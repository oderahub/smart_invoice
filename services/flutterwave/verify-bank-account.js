const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const VendorMessages = require('@app/messages/vendor');

async function verifyBankAccount({ accountNumber, bankCode }) {
  try {
    const response = await flutterwaveClient.post('/accounts/resolve', {
      account_number: accountNumber,
      account_bank: bankCode,
    });

    if (response.data?.status === 'success') {
      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
      };
    }

    throwAppError(VendorMessages.BANK_VERIFICATION_FAILED, ERROR_CODE.INVLDREQ);
  } catch (error) {
    appLogger.error({ error, accountNumber, bankCode }, 'Bank verification failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.INVLDREQ);
    }

    throwAppError(VendorMessages.BANK_VERIFICATION_FAILED, ERROR_CODE.INVLDREQ);
  }
}

module.exports = verifyBankAccount;
