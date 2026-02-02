const { InvoiceRepo, ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const InvoiceMessages = require('@app/messages/invoice');
const calculateAllocations = require('./calculate-allocations');

/**
 * Update a draft invoice
 * Only draft invoices can be modified
 *
 * @param {String} invoiceId
 * @param {Object} data - Fields to update
 */
async function updateInvoice(invoiceId, data) {
  const invoice = await InvoiceRepo.findOne({ _id: invoiceId });

  if (!invoice) {
    throwAppError(InvoiceMessages.INVOICE_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Only draft invoices can be modified
  if (invoice.status !== 'draft') {
    throwAppError(InvoiceMessages.INVOICE_NOT_DRAFT, ERROR_CODE.INVLDREQ);
  }

  const updateData = {
    updated: Date.now(),
  };

  // Update client if changed
  if (data.clientId && data.clientId !== invoice.clientId) {
    const client = await ClientRepo.findOne({ _id: data.clientId });
    if (!client) {
      throwAppError('Client not found', ERROR_CODE.NOTFOUND);
    }

    updateData.clientId = client._id;
    updateData.clientName = client.name;
    updateData.clientEmail = client.email;
    updateData.clientCompany = client.company;
    updateData.clientAddress = client.address;
  }

  // Update line items and recalculate totals
  if (data.lineItems) {
    const lineItems = data.lineItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.quantity * item.unitPrice,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = data.tax !== undefined ? data.tax : invoice.tax;
    const discount = data.discount !== undefined ? data.discount : invoice.discount;
    const total = subtotal + tax - discount;

    updateData.lineItems = lineItems;
    updateData.subtotal = subtotal;
    updateData.total = total;

    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.discount !== undefined) updateData.discount = data.discount;

    // Recalculate vendor allocations if they exist
    const allocationsInput = data.vendorAllocations || invoice.vendorAllocations;
    if (allocationsInput && allocationsInput.length > 0) {
      // Convert existing allocations to input format if needed
      const allocationsToCalculate = allocationsInput.map((a) => ({
        vendorId: a.vendorId,
        allocationType: a.allocationType,
        allocationValue: a.allocationValue,
      }));

      updateData.vendorAllocations = await calculateAllocations(allocationsToCalculate, total);
      updateData.totalVendorPayouts = updateData.vendorAllocations.reduce(
        (sum, v) => sum + v.calculatedAmount,
        0
      );
    }
  } else if (data.vendorAllocations) {
    // Only updating allocations, not line items
    updateData.vendorAllocations = await calculateAllocations(
      data.vendorAllocations,
      invoice.total
    );
    updateData.totalVendorPayouts = updateData.vendorAllocations.reduce(
      (sum, v) => sum + v.calculatedAmount,
      0
    );
  }

  // Update other fields
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;

  const updatedInvoice = await InvoiceRepo.updateOne({ _id: invoiceId }, updateData);

  return updatedInvoice;
}

module.exports = updateInvoice;
