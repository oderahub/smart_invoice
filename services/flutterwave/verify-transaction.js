const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

/**
 * Verify a transaction with Flutterwave
 *
 * IMPORTANT: Always verify transactions server-side before trusting webhook data.
 * Webhooks can be spoofed; verification confirms the transaction is real.
 *
 * @param {Number} transactionId - Flutterwave transaction ID
 * @returns {Object} Verified transaction data
 */
async function verifyTransaction(transactionId) {
  try {
    const response = await flutterwaveClient.get(`/transactions/${transactionId}/verify`);

    if (response.data?.status === 'success') {
      const txData = response.data.data;

      return {
        id: txData.id,
        txRef: txData.tx_ref,
        flwRef: txData.flw_ref,
        amount: txData.amount, // In Naira
        amountSettled: txData.amount_settled,
        currency: txData.currency,
        chargedAmount: txData.charged_amount,
        appFee: txData.app_fee, // Flutterwave fee
        status: txData.status, // 'successful', 'failed', 'pending'
        paymentType: txData.payment_type, // 'card', 'bank_transfer', 'ussd'
        customer: {
          email: txData.customer?.email,
          name: txData.customer?.name,
          phone: txData.customer?.phone_number,
        },
        meta: txData.meta,
        createdAt: txData.created_at,
      };
    }

    throwAppError('Transaction verification failed', ERROR_CODE.HTTPREQERR);
  } catch (error) {
    appLogger.error({ error, transactionId }, 'Transaction verification failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.HTTPREQERR);
    }

    throw error;
  }
}

module.exports = verifyTransaction;
