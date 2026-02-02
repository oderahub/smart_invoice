const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const getBanks = require('@app/services/flutterwave/get-banks');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors/banks',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const banks = await getBanks();

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.BANKS_FETCHED,
      data: banks,
    };
  },
});
