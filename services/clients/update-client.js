const { ClientRepo } = require('@app/repository');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const ClientMessages = require('@app/messages/client');

async function updateClient(clientId, data) {
  const client = await ClientRepo.findOne({ _id: clientId });

  if (!client) {
    throwAppError(ClientMessages.CLIENT_NOT_FOUND, ERROR_CODE.NOTFOUND);
  }

  // Check if email is being changed and already exists
  if (data.email && data.email !== client.email) {
    const existingClient = await ClientRepo.findOne({ email: data.email });
    if (existingClient) {
      throwAppError(ClientMessages.CLIENT_EMAIL_EXISTS, ERROR_CODE.DUPLRCRD);
    }
  }

  const updateData = {
    updated: Date.now(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;

  const updatedClient = await ClientRepo.updateOne({ _id: clientId }, updateData);

  return updatedClient;
}

module.exports = updateClient;
