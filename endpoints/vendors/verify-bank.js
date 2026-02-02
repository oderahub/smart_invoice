const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const verifyBankAccount = require('@app/services/flutterwave/verify-bank-account');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors/verify-bank',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const result = await verifyBankAccount({
      accountNumber: rc.body.accountNumber,
      bankCode: rc.body.bankCode,
    });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.BANK_VERIFIED,
      data: result,
    };
  },
});
