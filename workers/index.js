const { createWorker } = require('../core/queue');
const echoLoginValidation = require('./echo-login-validation');
const processVendorPayouts = require('./process-vendor-payouts');
const checkOverdueInvoices = require('./check-overdue-invoices');
const retryFailedPayouts = require('./retry-failed-payouts');

module.exports = {
  echoLoginValidation: createWorker(echoLoginValidation),
  processVendorPayouts: createWorker(processVendorPayouts),
  checkOverdueInvoices: createWorker(checkOverdueInvoices),
  retryFailedPayouts: createWorker(retryFailedPayouts),
};
