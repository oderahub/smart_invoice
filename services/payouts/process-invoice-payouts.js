const { InvoiceRepo, PaymentRepo } = require('@app/repository');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const getBalance = require('@app/services/flutterwave/get-balance');
const executePayout = require('./execute-payout');
const PayoutMessages = require('@app/messages/payout');

/**
 * Process all vendor payouts for a paid invoice
 *
 * This is called after a payment is confirmed:
 * 1. Check Flutterwave balance
 * 2. Execute payouts to each vendor
 * 3. Update payment record with payout status
 *
 * @param {String} invoiceId
 * @param {String} paymentId
 */
async function processInvoicePayouts(invoiceId, paymentId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });
  if (!invoice) {
    throwAppError('Invoice not found', ERROR_CODE.NOTFOUND);
  }

  if (!invoice.vendorAllocations || invoice.vendorAllocations.length === 0) {
    appLogger.info({ invoiceId }, 'No vendor allocations to process');
    return { status: 'no_payouts', payoutsProcessed: 0 };
  }

  // Calculate total payout amount (convert kobo to Naira for balance check)
  const totalPayoutKobo = invoice.vendorAllocations.reduce(
    (sum, v) => sum + v.calculatedAmount,
    0
  );
  const totalPayoutNaira = totalPayoutKobo / 100;

  // Check Flutterwave balance
  const balance = await getBalance();
  if (balance.availableBalance < totalPayoutNaira) {
    appLogger.error(
      { required: totalPayoutNaira, available: balance.availableBalance },
      'Insufficient balance for payouts'
    );

    // Update payment status
    await PaymentRepo.updateOne(
      { _id: paymentId },
      {
        vendorPayoutStatus: 'failed',
        updated: Date.now(),
      }
    );

    throwAppError(PayoutMessages.INSUFFICIENT_BALANCE, ERROR_CODE.LIMITERR);
  }

  // Update payment status to processing
  await PaymentRepo.updateOne(
    { _id: paymentId },
    {
      vendorPayoutStatus: 'processing',
      vendorPayoutsInitiated: Date.now(),
      updated: Date.now(),
    }
  );

  // Execute payouts for each vendor
  const payoutResults = [];
  let successCount = 0;
  let failCount = 0;

  for (const allocation of invoice.vendorAllocations) {
    try {
      const payout = await executePayout({
        invoiceId,
        paymentId,
        allocation,
        invoiceNumber: invoice.invoiceNumber,
      });

      payoutResults.push({ vendorId: allocation.vendorId, status: 'initiated', payoutId: payout._id });
      successCount++;
    } catch (error) {
      payoutResults.push({ vendorId: allocation.vendorId, status: 'failed', error: error.message });
      failCount++;
    }
  }

  // Determine final status
  let finalStatus;
  if (failCount === 0) {
    finalStatus = 'processing'; // All initiated, waiting for transfer webhooks
  } else if (successCount === 0) {
    finalStatus = 'failed'; // All failed
  } else {
    finalStatus = 'partial'; // Some succeeded, some failed
  }

  await PaymentRepo.updateOne(
    { _id: paymentId },
    {
      vendorPayoutStatus: finalStatus,
      updated: Date.now(),
    }
  );

  appLogger.info(
    { invoiceId, paymentId, successCount, failCount },
    'Invoice payouts processed'
  );

  return {
    status: finalStatus,
    payoutsProcessed: invoice.vendorAllocations.length,
    successCount,
    failCount,
    results: payoutResults,
  };
}

module.exports = processInvoicePayouts;
