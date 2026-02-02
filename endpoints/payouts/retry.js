const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { retryPayout } = require('@app/services/payouts');
const PayoutMessages = require('@app/messages/payout');

module.exports = createHandler({
  path: '/payouts/:id/retry',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const result = await retryPayout(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: PayoutMessages.PAYOUT_RETRY_INITIATED,
      data: result,
    };
  },
});
