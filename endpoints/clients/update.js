const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { updateClient } = require('@app/services/clients');
const ClientMessages = require('@app/messages/client');

module.exports = createHandler({
  path: '/clients/:id',
  method: 'put',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const client = await updateClient(rc.params.id, rc.body);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: ClientMessages.CLIENT_UPDATED,
      data: client,
    };
  },
});
