const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

/**
 * Initiate a bank transfer to a vendor
 *
 * @param {Object} options
 * @param {String} options.bankCode - Bank code (e.g., "044" for Access Bank)
 * @param {String} options.accountNumber - Recipient account number
 * @param {Number} options.amount - Amount in NAIRA (not kobo!)
 * @param {String} options.reference - Unique reference (MUST be unique per transfer)
 * @param {String} options.narration - Transfer description
 *
 * @returns {Object} { id, reference, status, amount }
 */
async function initiateTransfer(options) {
  const { bankCode, accountNumber, amount, reference, narration } = options;

  try {
    const response = await flutterwaveClient.post('/transfers', {
      account_bank: bankCode,
      account_number: accountNumber,
      amount, // Flutterwave expects Naira
      currency: 'NGN',
      reference, // MUST be unique - used for idempotency
      narration: narration || 'Payout',
      debit_currency: 'NGN',
    });

    if (response.data?.status === 'success') {
      const transferData = response.data.data;

      return {
        id: transferData.id,
        reference: transferData.reference,
        status: transferData.status, // 'NEW', 'PENDING', 'SUCCESSFUL', 'FAILED'
        amount: transferData.amount,
        fee: transferData.fee,
        bankName: transferData.bank_name,
        fullName: transferData.full_name,
        message: transferData.complete_message,
      };
    }

    appLogger.error({ response: response.data }, 'Transfer initiation failed');
    throwAppError('Transfer initiation failed', ERROR_CODE.HTTPREQERR);
  } catch (error) {
    appLogger.error({ error, options }, 'Transfer initiation failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.HTTPREQERR);
    }

    throw error;
  }
}

module.exports = initiateTransfer;
