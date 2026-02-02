const { InvoiceRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');

/**
 * Get invoice for public/client view
 *
 * IMPORTANT: This returns a sanitized invoice without sensitive data:
 * - No vendor allocations
 * - No internal notes
 * - No profit calculations
 *
 * @param {String} invoiceId - Invoice ID (used as token in URL)
 * @returns {Object} Sanitized invoice for client view
 */
async function getPublicInvoice(invoiceId) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Only sent/viewed/paid invoices can be viewed publicly
  if (invoice.status === 'draft' || invoice.status === 'cancelled') {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Return sanitized invoice (NO vendor info, NO internal notes, NO profit)
  return {
    _id: invoice._id,
    invoiceNumber: invoice.invoiceNumber,

    // Client sees their own info
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientCompany: invoice.clientCompany,
    clientAddress: invoice.clientAddress,

    // Line items and totals
    lineItems: invoice.lineItems,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    discount: invoice.discount,
    total: invoice.total,
    currency: invoice.currency,

    // Dates
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,

    // Status (client can see if paid)
    status: invoice.status,
    paidAt: invoice.paidAt,

    // Payment link for unpaid invoices
    paymentLinkUrl: invoice.status !== 'paid' ? invoice.paymentLinkUrl : null,

    // Public notes only
    notes: invoice.notes,

    // Timestamps
    created: invoice.created,
  };
}

module.exports = getPublicInvoice;
