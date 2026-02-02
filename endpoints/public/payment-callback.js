const { createHandler } = require('@app-core/server');
const { InvoiceRepo } = require('@app/repository');

const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

/**
 * Payment callback endpoint
 * Flutterwave redirects here after payment attempt
 *
 * Query params from Flutterwave:
 * - status: 'successful' | 'cancelled' | 'failed'
 * - tx_ref: Our transaction reference
 * - transaction_id: Flutterwave transaction ID
 *
 * GET /public/payment/callback
 */
module.exports = createHandler({
  path: '/public/payment/callback',
  method: 'get',
  middlewares: [], // No auth required
  async handler(rc, helpers) {
    const { status, tx_ref: txRef, transaction_id: transactionId } = rc.query;

    // Find the invoice by payment reference
    const invoice = await InvoiceRepo.findOne({ paymentReference: txRef });

    if (!invoice) {
      return {
        status: helpers.http_statuses.HTTP_200_OK,
        message: 'Payment callback received',
        data: {
          status: 'error',
          message: 'Invoice not found',
          redirectUrl: APP_BASE_URL,
        },
      };
    }

    // Determine redirect URL based on payment status
    let redirectUrl;
    let message;

    if (status === 'successful') {
      // Note: Actual payment verification happens via webhook
      // This is just for user feedback
      message = 'Payment successful! You will receive a confirmation email shortly.';
      redirectUrl = `${APP_BASE_URL}/public/invoice/${invoice._id}?payment=success`;
    } else if (status === 'cancelled') {
      message = 'Payment was cancelled.';
      redirectUrl = `${APP_BASE_URL}/public/invoice/${invoice._id}?payment=cancelled`;
    } else {
      message = 'Payment failed. Please try again.';
      redirectUrl = `${APP_BASE_URL}/public/invoice/${invoice._id}?payment=failed`;
    }

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Payment callback processed',
      data: {
        status,
        transactionId,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        message,
        redirectUrl,
      },
    };
  },
});
