const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { updateVendor } = require('@app/services/vendors');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors/:id',
  method: 'put',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const vendor = await updateVendor(rc.params.id, rc.body);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.VENDOR_UPDATED,
      data: vendor,
    };
  },
});
