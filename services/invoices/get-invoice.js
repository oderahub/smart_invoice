const { InvoiceRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');

/**
 * Get a single invoice by ID
 * Returns full details including vendor allocations (for admin view)
 *
 * @param {String} invoiceId
 * @returns {Object} Full invoice object
 */
async function getInvoice(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  return invoice;
}

module.exports = getInvoice;
