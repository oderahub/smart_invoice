const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'clients';

/**
 * @typedef {Object} ClientAddress
 * @property {String} street
 * @property {String} city
 * @property {String} state
 * @property {String} country
 */

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} name
 * @property {String} email
 * @property {String} company
 * @property {String} phone
 * @property {ClientAddress} address
 * @property {String} notes
 * @property {Number} totalInvoiced
 * @property {Number} totalPaid
 * @property {Number} invoiceCount
 * @property {String} status
 * @property {Number} created
 * @property {Number} updated
 */

const addressSchema = {
  street: { type: SchemaTypes.String },
  city: { type: SchemaTypes.String },
  state: { type: SchemaTypes.String },
  country: { type: SchemaTypes.String, default: 'Nigeria' },
};

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  name: { type: SchemaTypes.String, required: true },
  email: { type: SchemaTypes.String, required: true, unique: true, index: true },
  company: { type: SchemaTypes.String },
  phone: { type: SchemaTypes.String },
  address: { type: addressSchema },
  notes: { type: SchemaTypes.String },
  totalInvoiced: { type: SchemaTypes.Number, default: 0 },
  totalPaid: { type: SchemaTypes.Number, default: 0 },
  invoiceCount: { type: SchemaTypes.Number, default: 0 },
  status: { type: SchemaTypes.String, default: 'active', index: true },
  created: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
