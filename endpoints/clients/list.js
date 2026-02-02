const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { listClients } = require('@app/services/clients');
const ClientMessages = require('@app/messages/client');

module.exports = createHandler({
  path: '/clients',
  method: 'get',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const result = await listClients(rc.query);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: ClientMessages.CLIENTS_FETCHED,
      data: result,
    };
  },
});
