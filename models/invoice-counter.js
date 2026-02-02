const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'invoice_counters';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} prefix
 * @property {Number} currentNumber
 * @property {Number} year
 * @property {Number} updated
 */

const schemaConfig = {
  _id: { type: SchemaTypes.String, required: true }, // 'main' singleton
  prefix: { type: SchemaTypes.String, default: 'INV' },
  currentNumber: { type: SchemaTypes.Number, default: 0 },
  year: { type: SchemaTypes.Number, required: true },
  updated: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
