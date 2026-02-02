const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'payments';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} invoiceId
 * @property {Number} flutterwaveId
 * @property {String} flutterwaveRef
 * @property {String} transactionRef
 * @property {Number} amount
 * @property {String} currency
 * @property {String} paymentMethod
 * @property {Number} flutterwaveFee
 * @property {Number} stampDuty
 * @property {Number} netAmount
 * @property {String} payerName
 * @property {String} payerEmail
 * @property {String} status
 * @property {String} vendorPayoutStatus
 * @property {Number} vendorPayoutsInitiated
 * @property {Number} vendorPayoutsCompleted
 * @property {Object} webhookPayload
 * @property {Number} created
 * @property {Number} updated
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  invoiceId: { type: SchemaTypes.String, required: true, index: true },

  // Flutterwave transaction details
  flutterwaveId: { type: SchemaTypes.Number },
  flutterwaveRef: { type: SchemaTypes.String, unique: true, sparse: true, index: true },
  transactionRef: { type: SchemaTypes.String, index: true },

  // Payment details (amount in kobo)
  amount: { type: SchemaTypes.Number, required: true },
  currency: { type: SchemaTypes.String, default: 'NGN' },
  paymentMethod: { type: SchemaTypes.String },

  // Fees (in kobo)
  flutterwaveFee: { type: SchemaTypes.Number },
  stampDuty: { type: SchemaTypes.Number },
  netAmount: { type: SchemaTypes.Number },

  // Payer info
  payerName: { type: SchemaTypes.String },
  payerEmail: { type: SchemaTypes.String },

  // Status
  status: { type: SchemaTypes.String, default: 'pending', index: true },

  // Vendor payout status
  vendorPayoutStatus: { type: SchemaTypes.String, default: 'pending' },
  vendorPayoutsInitiated: { type: SchemaTypes.Number },
  vendorPayoutsCompleted: { type: SchemaTypes.Number },

  // Raw webhook data (for debugging)
  webhookPayload: { type: SchemaTypes.Mixed },

  // Metadata
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
