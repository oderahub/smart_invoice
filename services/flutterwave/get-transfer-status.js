const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

/**
 * Get the status of a transfer
 *
 * @param {Number} transferId - Flutterwave transfer ID
 * @returns {Object} Transfer status data
 */
async function getTransferStatus(transferId) {
  try {
    const response = await flutterwaveClient.get(`/transfers/${transferId}`);

    if (response.data?.status === 'success') {
      const transferData = response.data.data;

      return {
        id: transferData.id,
        reference: transferData.reference,
        status: transferData.status, // 'SUCCESSFUL', 'FAILED', 'PENDING', 'NEW'
        amount: transferData.amount,
        fee: transferData.fee,
        bankName: transferData.bank_name,
        accountNumber: transferData.account_number,
        fullName: transferData.full_name,
        message: transferData.complete_message,
        createdAt: transferData.created_at,
      };
    }

    throwAppError('Failed to get transfer status', ERROR_CODE.HTTPREQERR);
  } catch (error) {
    appLogger.error({ error, transferId }, 'Get transfer status failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.HTTPREQERR);
    }

    throw error;
  }
}

module.exports = getTransferStatus;
