const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { sendInvoice } = require('@app/services/invoices');
const InvoiceMessages = require('@app/messages/invoice');

module.exports = createHandler({
  path: '/invoices/:id/send',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const invoice = await sendInvoice(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: InvoiceMessages.INVOICE_SENT,
      data: invoice,
    };
  },
});
