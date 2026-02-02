const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { getClient } = require('@app/services/clients');
const ClientMessages = require('@app/messages/client');

module.exports = createHandler({
  path: '/clients/:id',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const client = await getClient(rc.params.id);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: ClientMessages.CLIENT_FETCHED,
      data: client,
    };
  },
});
