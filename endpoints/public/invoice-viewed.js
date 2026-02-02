const { createHandler } = require('@app-core/server');
const { markInvoiceViewed } = require('@app/services/invoices');

/**
 * Mark invoice as viewed by client
 * Called when client opens the invoice page
 *
 * POST /public/invoice/:id/viewed
 */
module.exports = createHandler({
  path: '/public/invoice/:id/viewed',
  method: 'post',
  middlewares: [], // No auth required
  async handler(rc, helpers) {
    await markInvoiceViewed(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Invoice marked as viewed',
      data: { success: true },
    };
  },
});
