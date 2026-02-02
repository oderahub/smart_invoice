const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { getRevenue } = require('@app/services/dashboard');
const DashboardMessages = require('@app/messages/dashboard');

module.exports = createHandler({
  path: '/dashboard/revenue',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const revenue = await getRevenue({
      period: rc.query.period,
      fromDate: rc.query.fromDate ? parseInt(rc.query.fromDate, 10) : undefined,
      toDate: rc.query.toDate ? parseInt(rc.query.toDate, 10) : undefined,
      year: rc.query.year ? parseInt(rc.query.year, 10) : undefined,
    });

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: DashboardMessages.REVENUE_FETCHED,
      data: revenue,
    };
  },
});
