const { PayoutRepo, VendorRepo, InvoiceRepo } = require('@app/repository');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const initiateTransfer = require('@app/services/flutterwave/initiate-transfer');
const PayoutMessages = require('@app/messages/payout');

/**
 * Execute a single vendor payout
 *
 * @param {Object} options
 * @param {String} options.invoiceId
 * @param {String} options.paymentId
 * @param {Object} options.allocation - Vendor allocation from invoice
 * @param {String} options.invoiceNumber - For narration
 *
 * @returns {Object} Created payout record
 */
async function executePayout(options) {
  const { invoiceId, paymentId, allocation, invoiceNumber } = options;

  // Get vendor details
  const vendor = await VendorRepo.findOne({ _id: allocation.vendorId });
  if (!vendor) {
    appLogger.error({ vendorId: allocation.vendorId }, 'Vendor not found for payout');
    throw new Error('Vendor not found');
  }

  const now = Date.now();

  // Generate unique reference: PAY-{invoiceId}-{vendorId}-{timestamp}
  const flutterwaveReference = `PAY-${invoiceId.slice(-8)}-${allocation.vendorId.slice(-8)}-${now}`;

  // Create payout record first (for tracking)
  const payout = await PayoutRepo.create({
    invoiceId,
    paymentId,
    vendorId: allocation.vendorId,
    vendorName: vendor.name,
    bankCode: vendor.bankDetails.bankCode,
    bankName: vendor.bankDetails.bankName,
    accountNumber: vendor.bankDetails.accountNumber.slice(-4), // Last 4 for display
    accountNumberFull: vendor.bankDetails.accountNumber,
    amount: allocation.calculatedAmount,
    currency: 'NGN',
    allocationType: allocation.allocationType,
    allocationValue: allocation.allocationValue,
    flutterwaveReference,
    status: 'pending',
    retryCount: 0,
    created: now,
    updated: now,
  });

  try {
    // Convert kobo to Naira for Flutterwave
    const amountInNaira = allocation.calculatedAmount / 100;

    // Initiate transfer
    const transfer = await initiateTransfer({
      bankCode: vendor.bankDetails.bankCode,
      accountNumber: vendor.bankDetails.accountNumber,
      amount: amountInNaira,
      reference: flutterwaveReference,
      narration: `Payout for Invoice ${invoiceNumber}`,
    });

    // Update payout with transfer details
    await PayoutRepo.updateOne(
      { _id: payout._id },
      {
        flutterwaveTransferId: transfer.id,
        status: 'processing',
        initiatedAt: now,
        updated: now,
      }
    );

    // Update allocation status in invoice
    await InvoiceRepo.raw((model) =>
      model.updateOne(
        { _id: invoiceId, 'vendorAllocations.vendorId': allocation.vendorId },
        {
          $set: {
            'vendorAllocations.$.payoutId': payout._id,
            'vendorAllocations.$.payoutStatus': 'processing',
          },
        }
      )
    );

    appLogger.info(
      { payoutId: payout._id, vendorId: vendor._id, amount: amountInNaira },
      'Payout initiated'
    );

    return payout;
  } catch (error) {
    appLogger.error({ error, payoutId: payout._id }, 'Payout initiation failed');

    // Update payout as failed
    await PayoutRepo.updateOne(
      { _id: payout._id },
      {
        status: 'failed',
        failureReason: error.message,
        updated: Date.now(),
      }
    );

    // Update allocation status in invoice
    await InvoiceRepo.raw((model) =>
      model.updateOne(
        { _id: invoiceId, 'vendorAllocations.vendorId': allocation.vendorId },
        {
          $set: {
            'vendorAllocations.$.payoutId': payout._id,
            'vendorAllocations.$.payoutStatus': 'failed',
          },
        }
      )
    );

    throw error;
  }
}

module.exports = executePayout;
