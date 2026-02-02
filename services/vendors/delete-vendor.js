const { VendorRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const VendorMessages = require('@app/messages/vendor');

async function deleteVendor(vendorId) {
  const vendor = await VendorRepo.findOne({ _id: vendorId });

  if (!vendor) {
    throwAppError(VendorMessages.VENDOR_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Soft delete by setting status to inactive
  await VendorRepo.updateOne(
    { _id: vendorId },
    { status: 'inactive', updated: Date.now() }
  );

  return { success: true };
}

module.exports = deleteVendor;
