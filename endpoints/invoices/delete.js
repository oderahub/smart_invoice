const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { deleteInvoice } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices/:id',
  method: 'delete',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    await deleteInvoice(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.INVOICE_DELETED,
      data: { success: true },
    };
  },
});
