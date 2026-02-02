const { InvoiceRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');

/**
 * Mark an invoice as viewed by the client
 * Only updates if currently in 'sent' status
 *
 * @param {String} invoiceId
 */
async function markInvoiceViewed(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Only mark as viewed if currently 'sent'
  // Don't override 'paid' or other statuses
  if (invoice.status === 'sent') {
    await InvoiceRepo.updateOne(
      { _id: invoiceId },
      {
        status: 'viewed',
        viewedAt: Date.now(),
        updated: Date.now(),
      }
    );
  }

  return { success: true };
}

module.exports = markInvoiceViewed;
