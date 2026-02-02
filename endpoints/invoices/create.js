const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { createInvoice } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const invoice = await createInvoice(rc.body);

    return {
      status: helpers.http_statuses.HTTP_201_CREATED,
      message: InvoiceMessages.INVOICE_CREATED,
      data: invoice,
    };
  },
});
