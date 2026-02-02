const { VendorRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const VendorMessages = require('@app/messages/vendor');
const verifyBankAccount = require('@app/services/flutterwave/verify-bank-account');
const getBanks = require('@app/services/flutterwave/get-banks');

async function updateVendor(vendorId, data) {
  const vendor = await VendorRepo.findOne({ _id: vendorId });

  if (!vendor) {
    throwAppError(VendorMessages.VENDOR_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  const updateData = {
    updated: Date.now(),
  };

  // If bank details are being changed, verify and check for duplicates
  if (data.accountNumber || data.bankCode) {
    const newAccountNumber = data.accountNumber || vendor.bankDetails.accountNumber;
    const newBankCode = data.bankCode || vendor.bankDetails.bankCode;

    // Check if new bank details already exist for another vendor
    const existingVendor = await VendorRepo.findOne({
      _id: { $ne: vendorId },
      'bankDetails.accountNumber': newAccountNumber,
      'bankDetails.bankCode': newBankCode,
    });

    if (existingVendor) {
      throwAppError(VendorMessages.VENDOR_BANK_EXISTS, ERROR_CODE.DUPLRCRD);
    }

    // Verify the new bank account
    const verifiedAccount = await verifyBankAccount({
      accountNumber: newAccountNumber,
      bankCode: newBankCode,
    });

    // Get bank name
    const banks = await getBanks();
    const bank = banks.find((b) => b.code === newBankCode);
    const bankName = bank ? bank.name : newBankCode;

    updateData.bankDetails = {
      bankCode: newBankCode,
      bankName,
      accountNumber: newAccountNumber,
      accountName: verifiedAccount.accountName,
    };
  }

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.defaultAllocationType !== undefined) {
    updateData.defaultAllocationType = data.defaultAllocationType;
  }
  if (data.defaultAllocationValue !== undefined) {
    updateData.defaultAllocationValue = data.defaultAllocationValue;
  }
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  const updatedVendor = await VendorRepo.updateOne({ _id: vendorId }, updateData);

  return updatedVendor;
}

module.exports = updateVendor;
