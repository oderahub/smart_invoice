const { InvoiceRepo, ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');
const generateInvoiceNumber = require('./generate-invoice-number');
const calculateAllocations = require('./calculate-allocations');

/**
 * Create a new invoice
 *
 * @param {Object} data
 * @param {String} data.clientId - Client to invoice
 * @param {Array} data.lineItems - [{description, quantity, unitPrice}]
 * @param {Array} data.vendorAllocations - [{vendorId, allocationType, allocationValue}]
 * @param {Number} data.tax - Tax amount in kobo (optional)
 * @param {Number} data.discount - Discount amount in kobo (optional)
 * @param {Number} data.dueDate - Due date timestamp
 * @param {String} data.notes - Notes visible to client
 * @param {String} data.internalNotes - Internal notes (hidden from client)
 */
async function createInvoice(data) {
  // 1. Validate client exists
  if (!data.clientId) {
    throwAppError(InvoiceMessages.CLIENT_REQUIRED, ERROR_CODE.INVLDREQ);
  }

  const client = await ClientRepo.findOne({ _id: data.clientId });
  if (!client) {
    throwAppError('Client not found', ERROR_CODE.NOTFOUND);
  }

  // 2. Validate line items
  if (!data.lineItems || data.lineItems.length === 0) {
    throwAppError(InvoiceMessages.LINE_ITEMS_REQUIRED, ERROR_CODE.INVLDREQ);
  }

  // 3. Calculate line item amounts and subtotal
  const lineItems = data.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice, // Already in kobo
    amount: item.quantity * item.unitPrice,
  }));

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = data.tax || 0;
  const discount = data.discount || 0;
  const total = subtotal + tax - discount;

  // 4. Calculate vendor allocations
  const vendorAllocations = await calculateAllocations(
    data.vendorAllocations || [],
    total
  );

  // 5. Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // 6. Set dates
  const now = Date.now();
  const issueDate = data.issueDate || now;
  const dueDate = data.dueDate || now + 30 * 24 * 60 * 60 * 1000; // Default: 30 days

  // 7. Create invoice with denormalized client data
  const invoice = await InvoiceRepo.create({
    invoiceNumber,

    // Denormalized client info (for PDF generation)
    clientId: client._id,
    clientName: client.name,
    clientEmail: client.email,
    clientCompany: client.company,
    clientAddress: client.address,

    lineItems,
    subtotal,
    tax,
    discount,
    total,
    currency: 'NGN',

    vendorAllocations,
    totalVendorPayouts: vendorAllocations.reduce((sum, v) => sum + v.calculatedAmount, 0),

    issueDate,
    dueDate,
    status: 'draft',

    notes: data.notes,
    internalNotes: data.internalNotes,

    created: now,
    updated: now,
  });

  // 8. Update client stats
  await ClientRepo.updateOne(
    { _id: client._id },
    {
      $inc: { invoiceCount: 1, totalInvoiced: total },
      updated: now,
    }
  );

  return invoice;
}

module.exports = createInvoice;
