const { WebhookLogRepo, PaymentRepo, InvoiceRepo, ClientRepo } = require('@app/repository');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const verifyWebhookSignature = require('@app/services/flutterwave/verify-webhook-signature');
const verifyTransaction = require('@app/services/flutterwave/verify-transaction');
const calculateFees = require('./calculate-fees');
const PaymentMessages = require('@app/messages/payment');

/**
 * Process incoming Flutterwave webhook
 *
 * This is the CRITICAL payment flow:
 * 1. Verify webhook signature
 * 2. Check idempotency (prevent duplicate processing)
 * 3. Verify transaction with Flutterwave API
 * 4. Create payment record
 * 5. Update invoice status
 * 6. Queue vendor payout worker
 *
 * @param {Object} payload - Webhook payload from Flutterwave
 * @param {Object} headers - Request headers (contains verif-hash)
 */
async function processWebhook(payload, headers) {
  const now = Date.now();
  const signature = headers['verif-hash'];
  const eventType = payload.event || 'charge.completed';

  // 1. Log webhook immediately (for debugging)
  const webhookLog = await WebhookLogRepo.create({
    source: 'flutterwave',
    eventType,
    webhookId: payload.data?.id?.toString(),
    flutterwaveRef: payload.data?.flw_ref,
    headers,
    payload,
    signature,
    signatureValid: false,
    processed: false,
    created: now,
  });

  try {
    // 2. Verify signature
    const isValidSignature = verifyWebhookSignature(signature);
    await WebhookLogRepo.updateOne({ _id: webhookLog._id }, { signatureValid: isValidSignature });

    if (!isValidSignature) {
      throwAppError(PaymentMessages.INVALID_WEBHOOK_SIGNATURE, ERROR_CODE.AUTHERR);
    }

    // 3. Check idempotency - have we processed this webhook before?
    const existingLog = await WebhookLogRepo.findOne({
      webhookId: payload.data?.id?.toString(),
      processed: true,
      _id: { $ne: webhookLog._id }, // Exclude current log
    });

    if (existingLog) {
      appLogger.info({ webhookId: payload.data?.id }, 'Webhook already processed');
      return { status: 'already_processed' };
    }

    // 4. Handle different event types
    if (eventType === 'charge.completed' && payload.data?.status === 'successful') {
      await processPaymentWebhook(payload.data, webhookLog._id);
    } else if (eventType === 'transfer.completed') {
      await processTransferWebhook(payload.data, webhookLog._id);
    } else {
      appLogger.info({ eventType, status: payload.data?.status }, 'Unhandled webhook event');
    }

    // 5. Mark webhook as processed
    await WebhookLogRepo.updateOne(
      { _id: webhookLog._id },
      { processed: true, processedAt: Date.now() }
    );

    return { status: 'processed' };
  } catch (error) {
    appLogger.error({ error, webhookId: webhookLog._id }, 'Webhook processing failed');

    await WebhookLogRepo.updateOne(
      { _id: webhookLog._id },
      { processingError: error.message }
    );

    throw error;
  }
}

/**
 * Process a successful payment webhook
 */
async function processPaymentWebhook(data, webhookLogId) {
  const txRef = data.tx_ref;
  const transactionId = data.id;

  // Find invoice by payment reference
  const invoice = await InvoiceRepo.findOne({ paymentReference: txRef });
  if (!invoice) {
    appLogger.warn({ txRef }, 'Invoice not found for payment');
    return;
  }

  // Check if already paid
  if (invoice.status === 'paid') {
    appLogger.info({ invoiceId: invoice._id }, 'Invoice already paid');
    return;
  }

  // Verify transaction with Flutterwave (CRITICAL - don't trust webhook alone)
  const verifiedTx = await verifyTransaction(transactionId);

  if (verifiedTx.status !== 'successful') {
    appLogger.warn({ transactionId, status: verifiedTx.status }, 'Transaction not successful');
    return;
  }

  // Verify amount matches (convert Naira to kobo)
  const paidAmountKobo = Math.round(verifiedTx.amount * 100);
  if (paidAmountKobo !== invoice.total) {
    appLogger.warn(
      { expected: invoice.total, received: paidAmountKobo },
      'Payment amount mismatch'
    );
    // Still process but log the discrepancy
  }

  // Calculate fees
  const fees = calculateFees(paidAmountKobo, verifiedTx.paymentType);

  const now = Date.now();

  // Create payment record
  const payment = await PaymentRepo.create({
    invoiceId: invoice._id,
    flutterwaveId: verifiedTx.id,
    flutterwaveRef: verifiedTx.flwRef,
    transactionRef: txRef,
    amount: paidAmountKobo,
    currency: 'NGN',
    paymentMethod: verifiedTx.paymentType,
    flutterwaveFee: fees.flutterwaveFee,
    stampDuty: fees.stampDuty,
    netAmount: fees.netAmount,
    payerName: verifiedTx.customer.name,
    payerEmail: verifiedTx.customer.email,
    status: 'successful',
    vendorPayoutStatus: 'pending',
    webhookPayload: data,
    created: now,
    updated: now,
  });

  // Calculate owner profit
  const totalVendorPayouts = invoice.vendorAllocations.reduce(
    (sum, v) => sum + v.calculatedAmount,
    0
  );
  const ownerProfit = paidAmountKobo - fees.totalFees - totalVendorPayouts;

  // Update invoice status
  await InvoiceRepo.updateOne(
    { _id: invoice._id },
    {
      status: 'paid',
      paidAt: now,
      flutterwaveFee: fees.flutterwaveFee,
      stampDuty: fees.stampDuty,
      totalFees: fees.totalFees,
      ownerProfit,
      updated: now,
    }
  );

  // Update client stats
  await ClientRepo.updateOne(
    { _id: invoice.clientId },
    {
      $inc: { totalPaid: paidAmountKobo },
      updated: now,
    }
  );

  // Update webhook log with related records
  await WebhookLogRepo.updateOne(
    { _id: webhookLogId },
    {
      relatedInvoiceId: invoice._id,
      relatedPaymentId: payment._id,
    }
  );

  // TODO: Queue vendor payout worker
  // processVendorPayoutsWorker.scheduleJob({ paymentId: payment._id, invoiceId: invoice._id });

  appLogger.info(
    { invoiceId: invoice._id, paymentId: payment._id, amount: paidAmountKobo },
    'Payment processed successfully'
  );
}

/**
 * Process a transfer webhook (vendor payout status update)
 */
async function processTransferWebhook(data, webhookLogId) {
  // This will be implemented in the payout services
  appLogger.info({ transferId: data.id, status: data.status }, 'Transfer webhook received');
}

module.exports = processWebhook;
