const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { PaymentRepo } = require('@app/repository');
const PaymentMessages = require('@app/messages/payment');

module.exports = createHandler({
  path: '/payments',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const filter = {};

    if (rc.query.invoiceId) {
      filter.invoiceId = rc.query.invoiceId;
    }

    if (rc.query.status) {
      filter.status = rc.query.status;
    }

    const page = parseInt(rc.query.page, 10) || 1;
    const limit = parseInt(rc.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const payments = await PaymentRepo.findMany(filter, {
      sort: { created: -1 },
      skip,
      limit,
      projection: { webhookPayload: 0 }, // Exclude large payload from list
    });

    const total = await PaymentRepo.raw((model) => model.countDocuments(filter));

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: PaymentMessages.PAYMENTS_FETCHED,
      data: {
        payments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    };
  },
});
