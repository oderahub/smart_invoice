const { ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ClientMessages = require('@app/messages/client');

async function createClient(data) {
  // Check if email already exists
  const existingClient = await ClientRepo.findOne({ email: data.email });
  if (existingClient) {
    throwAppError(ClientMessages.CLIENT_EMAIL_EXISTS, ERROR_CODE.DUPLRCRD);
  }

  const now = Date.now();
  const client = await ClientRepo.create({
    name: data.name,
    email: data.email,
    company: data.company || data.name,
    phone: data.phone,
    address: data.address || {},
    notes: data.notes,
    totalInvoiced: 0,
    totalPaid: 0,
    invoiceCount: 0,
    status: 'active',
    created: now,
    updated: now,
  });

  return client;
}

module.exports = createClient;
