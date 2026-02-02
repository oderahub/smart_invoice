const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { PaymentRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const PaymentMessages = require('@app/messages/payment');

module.exports = createHandler({
  path: '/payments/:id',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const payment = await PaymentRepo.findOne({ _id: rc.params.id });

    if (!payment) {
      throwAppError(PaymentMessages.PAYMENT_NOT_FOUND, ERROR_CODE.NOTFOUND);
    }

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: PaymentMessages.PAYMENT_FETCHED,
      data: payment,
    };
  },
});
