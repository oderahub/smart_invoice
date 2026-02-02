const { createHandler } = require('@app-core/server');
const { getPublicInvoice } = require('@app/services/invoices');

/**
 * Public endpoint for clients to view their invoice
 * No authentication required - invoice ID acts as a token
 *
 * GET /public/invoice/:id
 */
module.exports = createHandler({
  path: '/public/invoice/:id',
  method: 'get',
  middlewares: [], // No auth required
  async handler(rc, helpers) {
    const invoice = await getPublicInvoice(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Invoice retrieved',
      data: invoice,
    };
  },
});
