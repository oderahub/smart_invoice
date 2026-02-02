const { parse } = require('@app-core/handlebars');
const { TEMPLATES } = require('../../helpers/constants');

const accountActivationTemplate = parse(require('./account-activation'));
const invoiceSentTemplate = parse(require('./invoice-sent'));
const paymentReceiptTemplate = parse(require('./payment-receipt'));
const paymentReceivedTemplate = parse(require('./payment-received'));
const payoutsCompletedTemplate = parse(require('./payouts-completed'));
const payoutFailedTemplate = parse(require('./payout-failed'));
const invoiceOverdueTemplate = parse(require('./invoice-overdue'));

module.exports = {
  [TEMPLATES.ACCOUNT_ACTIVATION]: accountActivationTemplate,
  [TEMPLATES.INVOICE_SENT]: invoiceSentTemplate,
  [TEMPLATES.PAYMENT_RECEIPT]: paymentReceiptTemplate,
  [TEMPLATES.PAYMENT_RECEIVED]: paymentReceivedTemplate,
  [TEMPLATES.PAYOUTS_COMPLETED]: payoutsCompletedTemplate,
  [TEMPLATES.PAYOUT_FAILED]: payoutFailedTemplate,
  [TEMPLATES.INVOICE_OVERDUE]: invoiceOverdueTemplate,
};
