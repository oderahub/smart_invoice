const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'invoices';

/**
 * @typedef {Object} LineItem
 * @property {String} description
 * @property {Number} quantity
 * @property {Number} unitPrice
 * @property {Number} amount
 */

/**
 * @typedef {Object} VendorAllocation
 * @property {String} vendorId
 * @property {String} vendorName
 * @property {String} allocationType
 * @property {Number} allocationValue
 * @property {Number} calculatedAmount
 * @property {String} payoutId
 * @property {String} payoutStatus
 */

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} invoiceNumber
 * @property {String} clientId
 * @property {String} clientName
 * @property {String} clientEmail
 * @property {String} clientCompany
 * @property {Object} clientAddress
 * @property {LineItem[]} lineItems
 * @property {Number} subtotal
 * @property {Number} tax
 * @property {Number} discount
 * @property {Number} total
 * @property {String} currency
 * @property {VendorAllocation[]} vendorAllocations
 * @property {Number} flutterwaveFee
 * @property {Number} stampDuty
 * @property {Number} totalFees
 * @property {Number} totalVendorPayouts
 * @property {Number} ownerProfit
 * @property {Number} issueDate
 * @property {Number} dueDate
 * @property {String} status
 * @property {Number} sentAt
 * @property {Number} viewedAt
 * @property {Number} paidAt
 * @property {Number} cancelledAt
 * @property {String} paymentLinkId
 * @property {String} paymentLinkUrl
 * @property {String} paymentReference
 * @property {String} notes
 * @property {String} internalNotes
 * @property {Number} created
 * @property {Number} updated
 */

const lineItemSchema = {
  description: { type: SchemaTypes.String, required: true },
  quantity: { type: SchemaTypes.Number, required: true },
  unitPrice: { type: SchemaTypes.Number, required: true },
  amount: { type: SchemaTypes.Number, required: true },
};

const vendorAllocationSchema = {
  vendorId: { type: SchemaTypes.String, required: true },
  vendorName: { type: SchemaTypes.String, required: true },
  allocationType: { type: SchemaTypes.String, required: true },
  allocationValue: { type: SchemaTypes.Number, required: true },
  calculatedAmount: { type: SchemaTypes.Number, required: true },
  payoutId: { type: SchemaTypes.String },
  payoutStatus: { type: SchemaTypes.String, default: 'pending' },
};

const clientAddressSchema = {
  street: { type: SchemaTypes.String },
  city: { type: SchemaTypes.String },
  state: { type: SchemaTypes.String },
  country: { type: SchemaTypes.String },
};

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  invoiceNumber: { type: SchemaTypes.String, required: true, unique: true, index: true },

  // Client info (denormalized)
  clientId: { type: SchemaTypes.String, required: true, index: true },
  clientName: { type: SchemaTypes.String, required: true },
  clientEmail: { type: SchemaTypes.String, required: true },
  clientCompany: { type: SchemaTypes.String },
  clientAddress: { type: clientAddressSchema },

  // Line items
  lineItems: { type: [lineItemSchema], default: [] },

  // Financials (all in kobo)
  subtotal: { type: SchemaTypes.Number, default: 0 },
  tax: { type: SchemaTypes.Number, default: 0 },
  discount: { type: SchemaTypes.Number, default: 0 },
  total: { type: SchemaTypes.Number, required: true },
  currency: { type: SchemaTypes.String, default: 'NGN' },

  // Vendor allocations (hidden from client)
  vendorAllocations: { type: [vendorAllocationSchema], default: [] },

  // Fee breakdown (calculated when payment received)
  flutterwaveFee: { type: SchemaTypes.Number },
  stampDuty: { type: SchemaTypes.Number },
  totalFees: { type: SchemaTypes.Number },
  totalVendorPayouts: { type: SchemaTypes.Number },
  ownerProfit: { type: SchemaTypes.Number },

  // Dates
  issueDate: { type: SchemaTypes.Number, required: true },
  dueDate: { type: SchemaTypes.Number, required: true, index: true },

  // Status
  status: { type: SchemaTypes.String, default: 'draft', index: true },
  sentAt: { type: SchemaTypes.Number },
  viewedAt: { type: SchemaTypes.Number },
  paidAt: { type: SchemaTypes.Number },
  cancelledAt: { type: SchemaTypes.Number },

  // Payment link
  paymentLinkId: { type: SchemaTypes.String },
  paymentLinkUrl: { type: SchemaTypes.String },
  paymentReference: { type: SchemaTypes.String, index: true },

  // Notes
  notes: { type: SchemaTypes.String },
  internalNotes: { type: SchemaTypes.String },

  // Metadata
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
