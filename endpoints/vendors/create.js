const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { createVendor } = require('@app/services/vendors');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const vendor = await createVendor(rc.body);

    return {
      status: helpers.http_statuses.HTTP_201_CREATED,
      message: VendorMessages.VENDOR_CREATED,
      data: vendor,
    };
  },
});
