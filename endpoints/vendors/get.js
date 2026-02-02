const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { getVendor } = require('@app/services/vendors');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors/:id',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const vendor = await getVendor(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.VENDOR_FETCHED,
      data: vendor,
    };
  },
});
