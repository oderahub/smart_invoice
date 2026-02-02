const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { deleteClient } = require('@app/services/clients');
const ClientMessages = require('@app/messages/client');

module.exports = createHandler({
  path: '/clients/:id',
  method: 'delete',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    await deleteClient(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: ClientMessages.CLIENT_DELETED,
      data: { success: true },
    };
  },
});
