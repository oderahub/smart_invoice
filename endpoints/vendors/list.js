const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { listVendors } = require('@app/services/vendors');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const result = await listVendors(rc.query);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.VENDORS_FETCHED,
      data: result,
    };
  },
});
