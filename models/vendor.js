const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'vendors';

/**
 * @typedef {Object} BankDetails
 * @property {String} bankCode
 * @property {String} bankName
 * @property {String} accountNumber
 * @property {String} accountName
 */

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} name
 * @property {String} email
 * @property {String} phone
 * @property {String} role
 * @property {BankDetails} bankDetails
 * @property {String} defaultAllocationType
 * @property {Number} defaultAllocationValue
 * @property {Number} totalPaid
 * @property {Number} payoutCount
 * @property {String} status
 * @property {String} notes
 * @property {Number} created
 * @property {Number} updated
 */

const bankDetailsSchema = {
  bankCode: { type: SchemaTypes.String, required: true },
  bankName: { type: SchemaTypes.String, required: true },
  accountNumber: { type: SchemaTypes.String, required: true },
  accountName: { type: SchemaTypes.String, required: true },
};

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  name: { type: SchemaTypes.String, required: true },
  email: { type: SchemaTypes.String, index: true },
  phone: { type: SchemaTypes.String },
  role: { type: SchemaTypes.String },
  bankDetails: { type: bankDetailsSchema, required: true },
  defaultAllocationType: { type: SchemaTypes.String },
  defaultAllocationValue: { type: SchemaTypes.Number },
  totalPaid: { type: SchemaTypes.Number, default: 0 },
  payoutCount: { type: SchemaTypes.Number, default: 0 },
  status: { type: SchemaTypes.String, default: 'active', index: true },
  notes: { type: SchemaTypes.String },
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

// Compound unique index for bank account
modelSchema.index(
  { 'bankDetails.accountNumber': 1, 'bankDetails.bankCode': 1 },
  { unique: true }
);

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
