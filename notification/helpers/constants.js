const TEMPLATES = {
  ACCOUNT_ACTIVATION: 'account-activation',
  INVOICE_SENT: 'invoice-sent',
  PAYMENT_RECEIPT: 'payment-receipt',
  PAYMENT_RECEIVED: 'payment-received',
  PAYOUTS_COMPLETED: 'payouts-completed',
  PAYOUT_FAILED: 'payout-failed',
  INVOICE_OVERDUE: 'invoice-overdue',
};

const NOTIFICATION_TYPE = {
  EMAIL: 'email',
  SLACK: 'slack',
};

module.exports = {
  TEMPLATES,
  NOTIFICATION_TYPE,
};
