const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');

async function getBanks() {
  try {
    const response = await flutterwaveClient.get('/banks/NG');

    if (response.data?.status === 'success') {
      return response.data.data.map((bank) => ({
        id: bank.id,
        code: bank.code,
        name: bank.name,
      }));
    }

    return [];
  } catch (error) {
    appLogger.error({ error }, 'Failed to fetch banks from Flutterwave');
    throw error;
  }
}

module.exports = getBanks;
