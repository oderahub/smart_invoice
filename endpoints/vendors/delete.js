const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { deleteVendor } = require('@app/services/vendors');
const VendorMessages = require('@app/messages/vendor');

module.exports = createHandler({
  path: '/vendors/:id',
  method: 'delete',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    await deleteVendor(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: VendorMessages.VENDOR_DELETED,
      data: { success: true },
    };
  },
});
