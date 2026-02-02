const { VendorRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');

/**
 * Calculate vendor allocations for an invoice
 *
 * @param {Array} vendorAllocations - Array of {vendorId, allocationType, allocationValue}
 *   - allocationType: 'percentage' (e.g., 5 for 5%) or 'fixed' (amount in kobo)
 *   - allocationValue: the percentage number OR fixed amount in kobo
 * @param {Number} invoiceTotal - Total invoice amount in kobo
 * @returns {Array} Calculated allocations with vendor details and actual amounts
 *
 * Example:
 *   Input: [{vendorId: 'abc', allocationType: 'percentage', allocationValue: 5}], 50000000
 *   Output: [{...vendorDetails, calculatedAmount: 2500000}]  // 5% of ₦500,000 = ₦25,000
 */
async function calculateAllocations(vendorAllocations, invoiceTotal) {
  if (!vendorAllocations || vendorAllocations.length === 0) {
    return [];
  }

  const calculatedAllocations = [];
  let totalAllocated = 0;

  for (const allocation of vendorAllocations) {
    // Fetch vendor to get their name (for denormalization)
    const vendor = await VendorRepo.findOne({ _id: allocation.vendorId });

    if (!vendor) {
      throwAppError(`Vendor ${allocation.vendorId} not found`, ERROR_CODE.NOTFOUND);
    }

    if (vendor.status !== 'active') {
      throwAppError(`Vendor ${vendor.name} is not active`, ERROR_CODE.INVLDREQ);
    }

    let calculatedAmount;

    if (allocation.allocationType === 'percentage') {
      // Percentage of invoice total
      // Math.floor ensures we don't overpay due to rounding
      calculatedAmount = Math.floor((invoiceTotal * allocation.allocationValue) / 100);
    } else if (allocation.allocationType === 'fixed') {
      // Fixed amount (already in kobo)
      calculatedAmount = allocation.allocationValue;
    } else {
      throwAppError(
        'Invalid allocation type. Use "percentage" or "fixed"',
        ERROR_CODE.INVLDREQ
      );
    }

    totalAllocated += calculatedAmount;

    calculatedAllocations.push({
      vendorId: vendor._id,
      vendorName: vendor.name,
      allocationType: allocation.allocationType,
      allocationValue: allocation.allocationValue,
      calculatedAmount,
      payoutId: null,
      payoutStatus: 'pending',
    });
  }

  // Safety check: allocations cannot exceed invoice total
  if (totalAllocated > invoiceTotal) {
    throwAppError(InvoiceMessages.INVALID_ALLOCATIONS, ERROR_CODE.INVLDREQ);
  }

  return calculatedAllocations;
}

module.exports = calculateAllocations;
