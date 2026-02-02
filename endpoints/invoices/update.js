const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { updateInvoice } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices/:id',
  method: 'put',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const invoice = await updateInvoice(rc.params.id, rc.body);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.INVOICE_UPDATED,
      data: invoice,
    };
  },
});
