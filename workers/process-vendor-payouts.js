const { appLogger } = require('@app-core/logger');
const { processInvoicePayouts } = require('@app/services/payouts');

module.exports = {
  concurrency: 1,
  queue_options: {},
  scheduler_options: {},
  processor_name: 'process-vendor-payouts',

  /**
   * Process vendor payouts for a paid invoice
   *
   * Job data:
   * - invoiceId: Invoice ID
   * - paymentId: Payment ID
   */
  async processor(job) {
    const { invoiceId, paymentId } = job.data;

    try {
      appLogger.info(
        { label: 'PAYOUT_WORKER', jobId: job.id, invoiceId, paymentId },
        'Processing vendor payouts'
      );

      const result = await processInvoicePayouts(invoiceId, paymentId);

      appLogger.info(
        { label: 'PAYOUT_WORKER', jobId: job.id, result },
        'Vendor payouts processed'
      );

      return result;
    } catch (error) {
      appLogger.error(
        { label: 'PAYOUT_WORKER', jobId: job.id, error },
        'Vendor payout processing failed'
      );
      throw error;
    }
  },
};
