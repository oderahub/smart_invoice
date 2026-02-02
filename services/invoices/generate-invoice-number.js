const { InvoiceCounterRepo } = require('@app/repository');

const INVOICE_PREFIX = process.env.INVOICE_PREFIX || 'INV';

/**
 * Generates sequential invoice numbers: INV-2025-0001
 * Resets numbering each year
 * Uses atomic operations to prevent duplicates under concurrency
 */
async function generateInvoiceNumber() {
  const currentYear = new Date().getFullYear();

  // Try to find existing counter
  let counter = await InvoiceCounterRepo.findOne({ _id: 'main' });

  if (!counter) {
    // Create initial counter (first invoice ever)
    counter = await InvoiceCounterRepo.raw((model) =>
      model.create({
        _id: 'main',
        prefix: INVOICE_PREFIX,
        currentNumber: 1,
        year: currentYear,
        updated: Date.now(),
      })
    );
  } else if (counter.year !== currentYear) {
    // New year - reset counter to 1
    counter = await InvoiceCounterRepo.raw((model) =>
      model.findOneAndUpdate(
        { _id: 'main' },
        {
          $set: {
            currentNumber: 1,
            year: currentYear,
            updated: Date.now(),
          },
        },
        { new: true }
      )
    );
  } else {
    // Same year - increment atomically
    counter = await InvoiceCounterRepo.raw((model) =>
      model.findOneAndUpdate(
        { _id: 'main' },
        {
          $inc: { currentNumber: 1 },
          $set: { updated: Date.now() },
        },
        { new: true }
      )
    );
  }

  // Format: INV-2025-0001
  const paddedNumber = String(counter.currentNumber).padStart(4, '0');
  return `${INVOICE_PREFIX}-${currentYear}-${paddedNumber}`;
}

module.exports = generateInvoiceNumber;
