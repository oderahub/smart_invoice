const { InvoiceRepo, ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');

/**
 * Delete/cancel an invoice
 * - Draft invoices: permanently deleted
 * - Sent/other invoices: marked as cancelled
 *
 * @param {String} invoiceId
 */
async function deleteInvoice(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Cannot delete paid invoices
  if (invoice.status === 'paid') {
    throwAppError('Cannot delete a paid invoice', ERROR_CODE.INVLDREQ);
  }

  const now = Date.now();

  if (invoice.status === 'draft') {
    // Draft invoices can be permanently deleted
    await InvoiceRepo.deleteOne({ _id: invoiceId });

    // Revert client stats
    await ClientRepo.updateOne(
      { _id: invoice.clientId },
      {
        $inc: { invoiceCount: -1, totalInvoiced: -invoice.total },
        updated: now,
      }
    );
  } else {
    // Other invoices are marked as cancelled (for audit trail)
    await InvoiceRepo.updateOne(
      { _id: invoiceId },
      {
        status: 'cancelled',
        cancelledAt: now,
        updated: now,
      }
    );
  }

  return { success: true };
}

module.exports = deleteInvoice;
