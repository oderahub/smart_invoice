const { createHandler } = require('@app-core/server');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const jwt = require('@app-core/jwt');
const AuthenticationMessages = require('@app/messages/authentication');

module.exports = createHandler({
  path: '*',
  method: '',
  async handler(rc) {
    const authHeader = rc.headers.authorization;

    if (!authHeader) {
      throwAppError(AuthenticationMessages.MISSING_AUTH_HEADER, ERROR_CODE.NOAUTHERR);
    }

    // Extract token from Bearer scheme
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throwAppError(AuthenticationMessages.INVALID_AUTH_FORMAT, ERROR_CODE.NOAUTHERR);
    }

    const token = parts[1];

    // Verify the token
    const decoded = jwt.verify({ token });

    // Check if user is admin
    if (!decoded.isAdmin) {
      throwAppError(AuthenticationMessages.ADMIN_REQUIRED, ERROR_CODE.NOAUTHERR);
    }

    return {
      augments: {
        meta: {
          user: {
            id: decoded.userId,
            email: decoded.email,
            isAdmin: decoded.isAdmin,
          },
        },
      },
    };
  },
});
