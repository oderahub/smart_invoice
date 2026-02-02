const { ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ClientMessages = require('@app/messages/client');

async function deleteClient(clientId) {
  const client = await ClientRepo.findOne({ _id: clientId });

  if (!client) {
    throwAppError(ClientMessages.CLIENT_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Soft delete by setting status to archived
  await ClientRepo.updateOne(
    { _id: clientId },
    { status: 'archived', updated: Date.now() }
  );

  return { success: true };
}

module.exports = deleteClient;
