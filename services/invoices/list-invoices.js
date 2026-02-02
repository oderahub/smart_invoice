const { InvoiceRepo } = require('@app/repository');

/**
 * List invoices with filtering and pagination
 *
 * @param {Object} query
 * @param {String} query.status - Filter by status (draft, sent, paid, etc.)
 * @param {String} query.clientId - Filter by client
 * @param {String} query.search - Search in invoice number
 * @param {Number} query.page - Page number (default: 1)
 * @param {Number} query.limit - Items per page (default: 20)
 */
async function listInvoices(query = {}) {
  const filter = {};

  // Filter by status
  if (query.status) {
    filter.status = query.status;
  }

  // Filter by client
  if (query.clientId) {
    filter.clientId = query.clientId;
  }

  // Search by invoice number or client name
  if (query.search) {
    filter.$or = [
      { invoiceNumber: { $regex: query.search, $options: 'i' } },
      { clientName: { $regex: query.search, $options: 'i' } },
      { clientCompany: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Date range filter
  if (query.fromDate) {
    filter.issueDate = { $gte: parseInt(query.fromDate, 10) };
  }
  if (query.toDate) {
    filter.issueDate = {
      ...filter.issueDate,
      $lte: parseInt(query.toDate, 10),
    };
  }

  // Pagination
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Fetch invoices (exclude vendorAllocations for list view - it's sensitive)
  const invoices = await InvoiceRepo.findMany(filter, {
    sort: { created: -1 },
    skip,
    limit,
    projection: {
      vendorAllocations: 0, // Hide vendor details in list
      internalNotes: 0,
    },
  });

  const total = await InvoiceRepo.raw((model) => model.countDocuments(filter));

  return {
    invoices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

module.exports = listInvoices;
