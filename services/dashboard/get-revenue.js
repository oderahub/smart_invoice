const { InvoiceRepo, PaymentRepo } = require('@app/repository');

/**
 * Get revenue data for a specific period
 *
 * @param {Object} query
 * @param {String} query.period - 'daily', 'weekly', 'monthly', 'yearly'
 * @param {Number} query.fromDate - Start timestamp (optional)
 * @param {Number} query.toDate - End timestamp (optional)
 * @param {Number} query.year - Year for monthly breakdown (optional)
 */
async function getRevenue(query = {}) {
  const { period = 'monthly', year } = query;

  // Default to current year if not specified
  const targetYear = year || new Date().getFullYear();

  // Calculate date range
  let fromDate = query.fromDate;
  let toDate = query.toDate;

  if (!fromDate || !toDate) {
    const now = new Date();

    if (period === 'daily') {
      // Last 30 days
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).getTime();
      toDate = now.getTime();
    } else if (period === 'weekly') {
      // Last 12 weeks
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 84).getTime();
      toDate = now.getTime();
    } else if (period === 'monthly') {
      // Full year
      fromDate = new Date(targetYear, 0, 1).getTime();
      toDate = new Date(targetYear, 11, 31, 23, 59, 59, 999).getTime();
    } else if (period === 'yearly') {
      // Last 5 years
      fromDate = new Date(now.getFullYear() - 4, 0, 1).getTime();
      toDate = now.getTime();
    }
  }

  // Build aggregation pipeline based on period
  let groupBy;
  if (period === 'daily') {
    groupBy = {
      year: { $year: { $toDate: '$paidAt' } },
      month: { $month: { $toDate: '$paidAt' } },
      day: { $dayOfMonth: { $toDate: '$paidAt' } },
    };
  } else if (period === 'weekly') {
    groupBy = {
      year: { $year: { $toDate: '$paidAt' } },
      week: { $week: { $toDate: '$paidAt' } },
    };
  } else if (period === 'monthly') {
    groupBy = {
      year: { $year: { $toDate: '$paidAt' } },
      month: { $month: { $toDate: '$paidAt' } },
    };
  } else {
    groupBy = {
      year: { $year: { $toDate: '$paidAt' } },
    };
  }

  // Get revenue breakdown
  const revenueData = await InvoiceRepo.raw((model) =>
    model.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          fees: { $sum: '$totalFees' },
          vendorPayouts: { $sum: '$totalVendorPayouts' },
          profit: { $sum: '$ownerProfit' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1, '_id.day': 1 } },
    ])
  );

  // Format the data for easier consumption
  const formattedData = revenueData.map((item) => {
    let label;
    if (period === 'daily') {
      label = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
    } else if (period === 'weekly') {
      label = `${item._id.year}-W${String(item._id.week).padStart(2, '0')}`;
    } else if (period === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
    } else {
      label = String(item._id.year);
    }

    return {
      label,
      period: item._id,
      revenue: item.revenue,
      fees: item.fees,
      vendorPayouts: item.vendorPayouts,
      profit: item.profit,
      invoiceCount: item.count,
    };
  });

  // Calculate totals
  const totals = formattedData.reduce(
    (acc, item) => ({
      revenue: acc.revenue + item.revenue,
      fees: acc.fees + item.fees,
      vendorPayouts: acc.vendorPayouts + item.vendorPayouts,
      profit: acc.profit + item.profit,
      invoiceCount: acc.invoiceCount + item.invoiceCount,
    }),
    { revenue: 0, fees: 0, vendorPayouts: 0, profit: 0, invoiceCount: 0 }
  );

  return {
    period,
    fromDate,
    toDate,
    data: formattedData,
    totals,
  };
}

module.exports = getRevenue;
