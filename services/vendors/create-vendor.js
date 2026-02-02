const { VendorRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const VendorMessages = require('@app/messages/vendor');
const verifyBankAccount = require('@app/services/flutterwave/verify-bank-account');
const getBanks = require('@app/services/flutterwave/get-banks');

async function createVendor(data) {
  // Check if bank account already exists
  const existingVendor = await VendorRepo.findOne({
    'bankDetails.accountNumber': data.accountNumber,
    'bankDetails.bankCode': data.bankCode,
  });

  if (existingVendor) {
    throwAppError(VendorMessages.VENDOR_BANK_EXISTS, ERROR_CODE.DUPLRCRD);
  }

  // Verify the bank account with Flutterwave
  const verifiedAccount = await verifyBankAccount({
    accountNumber: data.accountNumber,
    bankCode: data.bankCode,
  });

  // Get bank name
  const banks = await getBanks();
  const bank = banks.find((b) => b.code === data.bankCode);
  const bankName = bank ? bank.name : data.bankCode;

  const now = Date.now();
  const vendor = await VendorRepo.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    bankDetails: {
      bankCode: data.bankCode,
      bankName,
      accountNumber: data.accountNumber,
      accountName: verifiedAccount.accountName,
    },
    defaultAllocationType: data.defaultAllocationType || null,
    defaultAllocationValue: data.defaultAllocationValue || null,
    totalPaid: 0,
    payoutCount: 0,
    status: 'active',
    notes: data.notes,
    created: now,
    updated: now,
  });

  return vendor;
}

module.exports = createVendor;
