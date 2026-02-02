const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'payouts';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} invoiceId
 * @property {String} paymentId
 * @property {String} vendorId
 * @property {String} vendorName
 * @property {String} bankCode
 * @property {String} bankName
 * @property {String} accountNumber
 * @property {String} accountNumberFull
 * @property {Number} amount
 * @property {String} currency
 * @property {String} allocationType
 * @property {Number} allocationValue
 * @property {Number} flutterwaveTransferId
 * @property {String} flutterwaveReference
 * @property {String} status
 * @property {String} failureReason
 * @property {Number} retryCount
 * @property {Number} lastRetryAt
 * @property {Number} initiatedAt
 * @property {Number} completedAt
 * @property {Number} created
 * @property {Number} updated
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  invoiceId: { type: SchemaTypes.String, required: true, index: true },
  paymentId: { type: SchemaTypes.String, required: true, index: true },
  vendorId: { type: SchemaTypes.String, required: true, index: true },

  // Vendor info (denormalized)
  vendorName: { type: SchemaTypes.String, required: true },
  bankCode: { type: SchemaTypes.String, required: true },
  bankName: { type: SchemaTypes.String, required: true },
  accountNumber: { type: SchemaTypes.String, required: true }, // Last 4 digits for display
  accountNumberFull: { type: SchemaTypes.String, required: true }, // Full number for transfer

  // Amount (in kobo)
  amount: { type: SchemaTypes.Number, required: true },
  currency: { type: SchemaTypes.String, default: 'NGN' },
  allocationType: { type: SchemaTypes.String, required: true },
  allocationValue: { type: SchemaTypes.Number, required: true },

  // Transfer details
  flutterwaveTransferId: { type: SchemaTypes.Number },
  flutterwaveReference: { type: SchemaTypes.String, unique: true, sparse: true, index: true },

  // Status
  status: { type: SchemaTypes.String, default: 'pending', index: true },
  failureReason: { type: SchemaTypes.String },

  // Retry tracking
  retryCount: { type: SchemaTypes.Number, default: 0 },
  lastRetryAt: { type: SchemaTypes.Number },

  // Timestamps
  initiatedAt: { type: SchemaTypes.Number },
  completedAt: { type: SchemaTypes.Number },

  // Metadata
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
