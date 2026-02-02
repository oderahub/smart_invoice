const { InvoiceRepo, PaymentRepo, PayoutRepo, ClientRepo, VendorRepo } = require('@app/repository');

/**
 * Get dashboard overview statistics
 *
 * Returns:
 * - Total revenue (paid invoices)
 * - Total pending (unpaid invoices)
 * - Total vendor payouts
 * - Owner profit
 * - Counts by status
 * - Recent activity
 */
async function getOverview() {
  // Get invoice counts by status
  const [
    totalInvoices,
    draftCount,
    sentCount,
    paidCount,
    overdueCount,
  ] = await Promise.all([
    InvoiceRepo.raw((model) => model.countDocuments()),
    InvoiceRepo.raw((model) => model.countDocuments({ status: 'draft' })),
    InvoiceRepo.raw((model) => model.countDocuments({ status: { $in: ['sent', 'viewed'] } })),
    InvoiceRepo.raw((model) => model.countDocuments({ status: 'paid' })),
    InvoiceRepo.raw((model) => model.countDocuments({ status: 'overdue' })),
  ]);

  // Get financial totals from paid invoices
  const financialStats = await InvoiceRepo.raw((model) =>
    model.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalFees: { $sum: '$totalFees' },
          totalVendorPayouts: { $sum: '$totalVendorPayouts' },
          totalProfit: { $sum: '$ownerProfit' },
        },
      },
    ])
  );

  const finances = financialStats[0] || {
    totalRevenue: 0,
    totalFees: 0,
    totalVendorPayouts: 0,
    totalProfit: 0,
  };

  // Get pending invoice total
  const pendingStats = await InvoiceRepo.raw((model) =>
    model.aggregate([
      { $match: { status: { $in: ['sent', 'viewed', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ])
  );
  const pendingTotal = pendingStats[0]?.total || 0;

  // Get payout statistics
  const [
    totalPayouts,
    pendingPayouts,
    successfulPayouts,
    failedPayouts,
  ] = await Promise.all([
    PayoutRepo.raw((model) => model.countDocuments()),
    PayoutRepo.raw((model) => model.countDocuments({ status: 'pending' })),
    PayoutRepo.raw((model) => model.countDocuments({ status: 'successful' })),
    PayoutRepo.raw((model) => model.countDocuments({ status: 'failed' })),
  ]);

  // Get client and vendor counts
  const [clientCount, vendorCount] = await Promise.all([
    ClientRepo.raw((model) => model.countDocuments({ status: 'active' })),
    VendorRepo.raw((model) => model.countDocuments({ status: 'active' })),
  ]);

  // Get recent invoices (last 5)
  const recentInvoices = await InvoiceRepo.findMany(
    {},
    {
      sort: { created: -1 },
      limit: 5,
      projection: {
        invoiceNumber: 1,
        clientName: 1,
        total: 1,
        status: 1,
        created: 1,
      },
    }
  );

  // Get recent payments (last 5)
  const recentPayments = await PaymentRepo.findMany(
    { status: 'successful' },
    {
      sort: { created: -1 },
      limit: 5,
      projection: {
        invoiceId: 1,
        amount: 1,
        payerName: 1,
        paymentMethod: 1,
        created: 1,
      },
    }
  );

  return {
    invoices: {
      total: totalInvoices,
      draft: draftCount,
      pending: sentCount,
      paid: paidCount,
      overdue: overdueCount,
    },
    finances: {
      totalRevenue: finances.totalRevenue,           // In kobo
      totalPending: pendingTotal,                     // In kobo
      totalFees: finances.totalFees,                  // In kobo
      totalVendorPayouts: finances.totalVendorPayouts, // In kobo
      totalProfit: finances.totalProfit,              // In kobo
    },
    payouts: {
      total: totalPayouts,
      pending: pendingPayouts,
      successful: successfulPayouts,
      failed: failedPayouts,
    },
    counts: {
      clients: clientCount,
      vendors: vendorCount,
    },
    recent: {
      invoices: recentInvoices,
      payments: recentPayments,
    },
  };
}

module.exports = getOverview;
