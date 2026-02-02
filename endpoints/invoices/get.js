const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { getInvoice } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices/:id',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const invoice = await getInvoice(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.INVOICE_FETCHED,
      data: invoice,
    };
  },
});
