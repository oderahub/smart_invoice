const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

/**
 * Get Flutterwave wallet balance
 *
 * Used to check if we have enough balance before initiating vendor payouts
 *
 * @returns {Object} { availableBalance, ledgerBalance, currency }
 */
async function getBalance() {
  try {
    const response = await flutterwaveClient.get('/balances/NGN');

    if (response.data?.status === 'success') {
      const balanceData = response.data.data;

      return {
        availableBalance: balanceData.available_balance, // In Naira
        ledgerBalance: balanceData.ledger_balance,
        currency: balanceData.currency,
      };
    }

    throwAppError('Failed to get balance', ERROR_CODE.HTTPREQERR);
  } catch (error) {
    appLogger.error({ error }, 'Get balance failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.HTTPREQERR);
    }

    throw error;
  }
}

module.exports = getBalance;
