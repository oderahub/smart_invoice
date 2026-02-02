const { createHandler } = require('@app-core/server');
const { adminAuth } = require('@app/middlewares');
const { createClient } = require('@app/services/clients');
const ClientMessages = require('@app/messages/client');

module.exports = createHandler({
  path: '/clients',
  method: 'post',
  middlewares: [adminAuth],
  async handler(rc, helpers) {
    const client = await createClient(rc.body);

    return {
      status: helpers.http_statuses.HTTP_201_CREATED,
      message: ClientMessages.CLIENT_CREATED,
      data: client,
    };
  },
});
