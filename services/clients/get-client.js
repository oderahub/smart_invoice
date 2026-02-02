const { ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ClientMessages = require('@app/messages/client');

async function getClient(clientId) {
  const client = await ClientRepo.findOne({ _id: clientId });

  if (!client) {
    throwAppError(ClientMessages.CLIENT_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  return client;
}

module.exports = getClient;
