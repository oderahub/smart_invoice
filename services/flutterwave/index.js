const httpRequest = require('@app-core/http-request');

const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3';
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

/**
 * Flutterwave HTTP client with authentication headers
 */
const flutterwaveClient = httpRequest.initialize({
  baseUrl: FLUTTERWAVE_BASE_URL,
  headers: {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  logLabel: 'FLUTTERWAVE',
});

module.exports = flutterwaveClient;
