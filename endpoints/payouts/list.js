const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { PayoutRepo } = require('@app/repository');
const PayoutMessages = require('@app/messages/payout');

module.exports = createHandler({
  path: '/payouts',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const filter = {};

    if (rc.query.invoiceId) {
      filter.invoiceId = rc.query.invoiceId;
    }

    if (rc.query.vendorId) {
      filter.vendorId = rc.query.vendorId;
    }

    if (rc.query.status) {
      filter.status = rc.query.status;
    }

    const page = parseInt(rc.query.page, 10) || 1;
    const limit = parseInt(rc.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const payouts = await PayoutRepo.findMany(filter, {
      sort: { created: -1 },
      skip,
      limit,
      projection: { accountNumberFull: 0 }, // Hide full account number
    });

    const total = await PayoutRepo.raw((model) => model.countDocuments(filter));

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: PayoutMessages.PAYOUTS_FETCHED,
      data: {
        payouts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
});
