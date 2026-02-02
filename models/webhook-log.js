const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const modelName = 'webhook_logs';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} source
 * @property {String} eventType
 * @property {String} webhookId
 * @property {String} flutterwaveRef
 * @property {Object} headers
 * @property {Object} payload
 * @property {String} signature
 * @property {Boolean} signatureValid
 * @property {Boolean} processed
 * @property {Number} processedAt
 * @property {String} processingError
 * @property {String} relatedInvoiceId
 * @property {String} relatedPaymentId
 * @property {String} relatedPayoutId
 * @property {Number} created
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  source: { type: SchemaTypes.String, required: true, default: 'flutterwave' },
  eventType: { type: SchemaTypes.String, required: true, index: true },

  // Identification
  webhookId: { type: SchemaTypes.String, unique: true, sparse: true, index: true },
  flutterwaveRef: { type: SchemaTypes.String, index: true },

  // Request details
  headers: { type: SchemaTypes.Mixed },
  payload: { type: SchemaTypes.Mixed, required: true },
  signature: { type: SchemaTypes.String },

  // Verification
  signatureValid: { type: SchemaTypes.Boolean },

  // Processing
  processed: { type: SchemaTypes.Boolean, default: false, index: true },
  processedAt: { type: SchemaTypes.Number },
  processingError: { type: SchemaTypes.String },

  // Related records
  relatedInvoiceId: { type: SchemaTypes.String },
  relatedPaymentId: { type: SchemaTypes.String },
  relatedPayoutId: { type: SchemaTypes.String },

  // Metadata
  created: { type: SchemaTypes.Number, required: true },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
