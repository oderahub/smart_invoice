const flutterwaveClient = require('./index');
const { appLogger } = require('@app-core/logger');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Luzo DN Parsempo';
const DEFAULT_LOGO_URL = process.env.DEFAULT_LOGO_URL;

/**
 * Create a Flutterwave payment link for an invoice
 *
 * @param {Object} options
 * @param {String} options.txRef - Unique transaction reference (e.g., invoice ID)
 * @param {Number} options.amount - Amount in NAIRA (not kobo!) - Flutterwave expects Naira
 * @param {String} options.customerEmail - Customer's email
 * @param {String} options.customerName - Customer's name
 * @param {String} options.customerPhone - Customer's phone (optional)
 * @param {String} options.description - Payment description
 * @param {Object} options.meta - Additional metadata (invoice_id, etc.)
 *
 * @returns {Object} { link, id } - Payment link URL and Flutterwave link ID
 */
async function createPaymentLink(options) {
  const {
    txRef,
    amount,
    customerEmail,
    customerName,
    customerPhone,
    description,
    meta = {},
  } = options;

  try {
    const response = await flutterwaveClient.post('/payments', {
      tx_ref: txRef,
      amount, // Flutterwave expects Naira, not kobo
      currency: 'NGN',
      redirect_url: `${APP_BASE_URL}/public/payment/callback`,
      customer: {
        email: customerEmail,
        name: customerName,
        phonenumber: customerPhone,
      },
      customizations: {
        title: BUSINESS_NAME,
        description: description || 'Invoice Payment',
        logo: DEFAULT_LOGO_URL,
      },
      meta,
    });

    if (response.data?.status === 'success') {
      return {
        link: response.data.data.link,
        id: response.data.data.id,
      };
    }

    appLogger.error({ response: response.data }, 'Failed to create payment link');
    throwAppError('Failed to create payment link', ERROR_CODE.HTTPREQERR);
  } catch (error) {
    appLogger.error({ error }, 'Flutterwave payment link creation failed');

    if (error.response?.data?.message) {
      throwAppError(error.response.data.message, ERROR_CODE.HTTPREQERR);
    }

    throw error;
  }
}

module.exports = createPaymentLink;
