const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { getOverview } = require('@app/services/dashboard');
const DashboardMessages = require('@app/messages/dashboard');

module.exports = createHandler({
  path: '/dashboard/overview',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const overview = await getOverview();

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: DashboardMessages.OVERVIEW_FETCHED,
      data: overview,
    };
  },
});
