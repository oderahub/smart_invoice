const { VendorRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const VendorMessages = require('@app/messages/vendor');

async function getVendor(vendorId) {
  const vendor = await VendorRepo.findOne({ _id: vendorId });

  if (!vendor) {
    throwAppError(VendorMessages.VENDOR_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  return vendor;
}

module.exports = getVendor;
