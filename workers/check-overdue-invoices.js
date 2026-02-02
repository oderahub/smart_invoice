const { appLogger } = require('@app-core/logger');
const { InvoiceRepo } = require('@app/repository');

module.exports = {
  concurrency: 1,
  queue_options: {},
  scheduler_options: {
    // Run daily at 9:00 AM
    pattern: '0 9 * * *',
  },
  processor_name: 'check-overdue-invoices',

  /**
   * Check for overdue invoices and update their status
   * Also sends notification to owner about overdue invoices
   */
  async processor(job) {
    try {
      appLogger.info({ label: 'OVERDUE_CHECKER', jobId: job.id }, 'Checking for overdue invoices');

      const now = Date.now();

      // Find invoices that are past due date and not yet paid
      const overdueInvoices = await InvoiceRepo.findMany({
        status: { $in: ['sent', 'viewed'] },
        dueDate: { $lt: now },
      });

      if (overdueInvoices.length === 0) {
        appLogger.info({ label: 'OVERDUE_CHECKER' }, 'No overdue invoices found');
        return { overdueCount: 0 };
      }

      // Update status to overdue
      const invoiceIds = overdueInvoices.map((inv) => inv._id);

      await InvoiceRepo.raw((model) =>
        model.updateMany(
          { _id: { $in: invoiceIds } },
          { $set: { status: 'overdue', updated: now } }
        )
      );

      appLogger.info(
        { label: 'OVERDUE_CHECKER', count: overdueInvoices.length },
        'Invoices marked as overdue'
      );

      // TODO: Send notification email to owner
      // const overdueData = overdueInvoices.map(inv => ({
      //   invoice_number: inv.invoiceNumber,
      //   client_name: inv.clientName,
      //   amount_formatted: (inv.total / 100).toLocaleString(),
      //   days_overdue: Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24)),
      // }));
      // sendOverdueNotification(overdueData);

      return {
        overdueCount: overdueInvoices.length,
        invoiceIds,
      };
    } catch (error) {
      appLogger.error({ label: 'OVERDUE_CHECKER', error }, 'Overdue check failed');
      throw error;
    }
  },
};
