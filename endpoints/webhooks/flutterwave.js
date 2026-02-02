const { createHandler } = require('@app-core/server');
const { processWebhook } = require('@app/services/payments');
const { appLogger } = require('@app-core/logger');

/**
 * Flutterwave webhook endpoint
 *
 * Receives notifications for:
 * - charge.completed (payment received)
 * - transfer.completed (vendor payout completed)
 *
 * POST /webhooks/flutterwave
 */
module.exports = createHandler({
  path: '/webhooks/flutterwave',
  method: 'post',
  middlewares: [], // No auth - uses signature verification instead
  async handler(rc, helpers) {
    appLogger.info({ event: rc.body?.event }, 'Flutterwave webhook received');

    try {
      const result = await processWebhook(rc.body, rc.headers);

      return {
        status: helpers.http_statuses.HTTP_200_OK,
        message: 'Webhook processed',
        data: result,
      };
    } catch (error) {
      appLogger.error({ error }, 'Webhook processing error');

      // Always return 200 to Flutterwave to prevent retries for handled errors
      // Only actual server errors should return 500
      return {
        status: helpers.http_statuses.HTTP_200_OK,
        message: 'Webhook received',
        data: { status: 'error', message: error.message },
      };
    }
  },
});
