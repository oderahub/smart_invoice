const { appLogger } = require('@app-core/logger');

const FLUTTERWAVE_WEBHOOK_HASH = process.env.FLUTTERWAVE_WEBHOOK_HASH;

/**
 * Verify Flutterwave webhook signature
 *
 * Flutterwave uses a simple hash comparison:
 * - They send a 'verif-hash' header with each webhook
 * - We compare it to our stored FLUTTERWAVE_WEBHOOK_HASH
 *
 * @param {String} signature - The 'verif-hash' header from the request
 * @returns {Boolean} True if signature is valid
 */
function verifyWebhookSignature(signature) {
  if (!FLUTTERWAVE_WEBHOOK_HASH) {
    appLogger.warn('FLUTTERWAVE_WEBHOOK_HASH not configured - skipping verification');
    return true; // Allow in development if not configured
  }

  if (!signature) {
    appLogger.warn('No verif-hash header in webhook request');
    return false;
  }

  const isValid = signature === FLUTTERWAVE_WEBHOOK_HASH;

  if (!isValid) {
    appLogger.warn({ signature }, 'Invalid webhook signature');
  }

  return isValid;
}

module.exports = verifyWebhookSignature;
