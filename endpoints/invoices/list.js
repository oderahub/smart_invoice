const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { listInvoices } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const result = await listInvoices(rc.query);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.INVOICES_FETCHED,
      data: result,
    };
  },
});
