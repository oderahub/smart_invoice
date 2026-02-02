const { InvoiceRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');
const createPaymentLink = require('@app/services/flutterwave/create-payment-link');
const { ulid } = require('@app-core/randomness');

/**
 * Send an invoice to the client
 *
 * This service:
 * 1. Validates the invoice is in draft status
 * 2. Creates a Flutterwave payment link
 * 3. Updates invoice status to 'sent'
 * 4. Triggers email notification (via worker queue)
 *
 * @param {String} invoiceId
 * @returns {Object} Updated invoice with payment link
 */
async function sendInvoice(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Check if already sent
  if (invoice.status !== 'draft') {
    throwAppError(InvoiceMessages.INVOICE_ALREADY_SENT, ERROR_CODE.INVLDREQ);
  }

  // Generate unique payment reference
  // Format: INV-{invoiceId}-{random} to ensure uniqueness
  const paymentReference = `INV-${invoice._id}-${ulid()}`;

  // Create Flutterwave payment link
  // IMPORTANT: Flutterwave expects amount in Naira, not kobo
  const amountInNaira = invoice.total / 100;

  const paymentLinkResult = await createPaymentLink({
    txRef: paymentReference,
    amount: amountInNaira,
    customerEmail: invoice.clientEmail,
    customerName: invoice.clientName,
    customerPhone: null, // Optional
    description: `Payment for Invoice ${invoice.invoiceNumber}`,
    meta: {
      invoice_id: invoice._id,
      invoice_number: invoice.invoiceNumber,
      client_id: invoice.clientId,
    },
  });

  const now = Date.now();

  // Update invoice with payment link and status
  const updatedInvoice = await InvoiceRepo.updateOne(
    { _id: invoiceId },
    {
      status: 'sent',
      sentAt: now,
      paymentReference,
      paymentLinkId: paymentLinkResult.id,
      paymentLinkUrl: paymentLinkResult.link,
      updated: now,
    }
  );

  // TODO: Queue email notification worker
  // sendInvoiceEmailWorker.scheduleJob({ invoiceId: invoice._id });

  return updatedInvoice;
}

module.exports = sendInvoice;
