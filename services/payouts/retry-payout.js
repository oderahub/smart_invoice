const { PayoutRepo, VendorRepo, InvoiceRepo } = require('@app/repository');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const initiateTransfer = require('@app/services/flutterwave/initiate-transfer');
const PayoutMessages = require('@app/messages/payout');

const MAX_RETRIES = 3;

/**
 * Retry a failed payout
 *
 * @param {String} payoutId
 */
async function retryPayout(payoutId) {
  const payout = await PayoutRepo.findOne({ _id: payoutId });

  if (!payout) {
    throwAppError(PayoutMessages.PAYOUT_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  if (payout.status !== 'failed') {
    throwAppError('Can only retry failed payouts', ERROR_CODE.INVLDREQ);
  }

  if (payout.retryCount >= MAX_RETRIES) {
    throwAppError(PayoutMessages.PAYOUT_MAX_RETRIES, ERROR_CODE.LIMITERR);
  }

  // Get vendor details
  const vendor = await VendorRepo.findOne({ _id: payout.vendorId });
  if (!vendor) {
    throwAppError('Vendor not found', ERROR_CODE.NOTFOUND);
  }

  // Get invoice for narration
  const invoice = await InvoiceRepo.findOne({ _id: payout.invoiceId });

  const now = Date.now();

  // Generate new unique reference for retry
  const newReference = `PAY-${payout.invoiceId.slice(-8)}-${payout.vendorId.slice(-8)}-${now}`;

  try {
    // Convert kobo to Naira
    const amountInNaira = payout.amount / 100;

    // Initiate new transfer
    const transfer = await initiateTransfer({
      bankCode: vendor.bankDetails.bankCode,
      accountNumber: vendor.bankDetails.accountNumber,
      amount: amountInNaira,
      reference: newReference,
      narration: `Payout retry for Invoice ${invoice?.invoiceNumber || payout.invoiceId}`,
    });

    // Update payout record
    await PayoutRepo.updateOne(
      { _id: payoutId },
      {
        flutterwaveTransferId: transfer.id,
        flutterwaveReference: newReference,
        status: 'processing',
        failureReason: null,
        retryCount: payout.retryCount + 1,
        lastRetryAt: now,
        initiatedAt: now,
        updated: now,
      }
    );

    // Update allocation status in invoice
    await InvoiceRepo.raw((model) =>
      model.updateOne(
        { _id: payout.invoiceId, 'vendorAllocations.vendorId': payout.vendorId },
        {
          $set: {
            'vendorAllocations.$.payoutStatus': 'processing',
          },
        }
      )
    );

    appLogger.info(
      { payoutId, retryCount: payout.retryCount + 1, newReference },
      'Payout retry initiated'
    );

    return { success: true, newReference };
  } catch (error) {
    appLogger.error({ error, payoutId }, 'Payout retry failed');

    // Update retry count and failure reason
    await PayoutRepo.updateOne(
      { _id: payoutId },
      {
        retryCount: payout.retryCount + 1,
        lastRetryAt: now,
        failureReason: error.message,
        updated: now,
      }
    );

    throw error;
  }
}

module.exports = retryPayout;
