const { appLogger } = require('@app-core/logger');
const { PayoutRepo } = require('@app/repository');
const { retryPayout } = require('@app/services/payouts');

const MAX_RETRIES = 3;

module.exports = {
  concurrency: 1,
  queue_options: {},
  scheduler_options: {
    // Run every 15 minutes
    pattern: '*/15 * * * *',
  },
  processor_name: 'retry-failed-payouts',

  /**
   * Find failed payouts that haven't reached max retries and retry them
   */
  async processor(job) {
    try {
      appLogger.info({ label: 'PAYOUT_RETRY', jobId: job.id }, 'Checking for failed payouts to retry');

      // Find failed payouts that can be retried
      const failedPayouts = await PayoutRepo.findMany({
        status: 'failed',
        retryCount: { $lt: MAX_RETRIES },
      });

      if (failedPayouts.length === 0) {
        appLogger.info({ label: 'PAYOUT_RETRY' }, 'No failed payouts to retry');
        return { retriedCount: 0 };
      }

      appLogger.info(
        { label: 'PAYOUT_RETRY', count: failedPayouts.length },
        'Found failed payouts to retry'
      );

      const results = [];

      for (const payout of failedPayouts) {
        try {
          await retryPayout(payout._id);
          results.push({ payoutId: payout._id, status: 'retried' });
        } catch (error) {
          appLogger.error(
            { label: 'PAYOUT_RETRY', payoutId: payout._id, error },
            'Payout retry failed'
          );
          results.push({ payoutId: payout._id, status: 'failed', error: error.message });
        }
      }

      const retriedCount = results.filter((r) => r.status === 'retried').length;

      appLogger.info(
        { label: 'PAYOUT_RETRY', retriedCount, totalAttempted: failedPayouts.length },
        'Payout retry job completed'
      );

      return {
        retriedCount,
        totalAttempted: failedPayouts.length,
        results,
      };
    } catch (error) {
      appLogger.error({ label: 'PAYOUT_RETRY', error }, 'Payout retry job failed');
      throw error;
    }
  },
};
