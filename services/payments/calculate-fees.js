/**
 * Calculate Flutterwave fees for a transaction
 *
 * Fee structure (Nigeria):
 * - Local cards/bank transfer/USSD: 1.4% (capped at ₦2,000)
 * - International cards: 3.8% (no cap)
 * - Stamp duty: ₦50 for transactions > ₦10,000
 *
 * @param {Number} amountInKobo - Transaction amount in kobo
 * @param {String} paymentType - 'card', 'bank_transfer', 'ussd'
 * @param {Boolean} isInternational - Is this an international card?
 *
 * @returns {Object} { flutterwaveFee, stampDuty, totalFees, netAmount } - All in kobo
 */
function calculateFees(amountInKobo, paymentType = 'card', isInternational = false) {
  const amountInNaira = amountInKobo / 100;

  let feePercentage;
  let feeCap;

  if (isInternational) {
    feePercentage = 0.038; // 3.8%
    feeCap = Infinity; // No cap for international
  } else {
    feePercentage = 0.014; // 1.4%
    feeCap = 2000; // ₦2,000 cap
  }

  // Calculate Flutterwave fee
  let flutterwaveFeeNaira = amountInNaira * feePercentage;
  flutterwaveFeeNaira = Math.min(flutterwaveFeeNaira, feeCap);
  const flutterwaveFee = Math.round(flutterwaveFeeNaira * 100); // Convert to kobo

  // Stamp duty: ₦50 (5000 kobo) for transactions > ₦10,000
  const stampDuty = amountInNaira > 10000 ? 5000 : 0;

  const totalFees = flutterwaveFee + stampDuty;
  const netAmount = amountInKobo - totalFees;

  return {
    flutterwaveFee,
    stampDuty,
    totalFees,
    netAmount,
  };
}

module.exports = calculateFees;
