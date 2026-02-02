const bcrypt = require('bcrypt');
const validator = require('@app-core/validator');
const jwt = require('@app-core/jwt');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const AuthenticationMessages = require('@app/messages/authentication');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_DEFAULT_EXPIRY = process.env.JWT_DEFAULT_EXPIRY || '7d';

const loginSpec = `root {
  email email
  password string<min:6>
}`;

const parsedLoginSpec = validator.parse(loginSpec);

/**
 * Admin login service
 * Authenticates admin user and returns JWT token
 *
 * @param {Object} serviceData - { email, password }
 * @returns {Object} { token, user }
 */
async function login(serviceData) {
  const validatedData = validator.validate(serviceData, parsedLoginSpec);

  const { email, password } = validatedData;

  // Verify email matches admin
  if (email.toLowerCase() !== ADMIN_EMAIL?.toLowerCase()) {
    throwAppError(AuthenticationMessages.INVALID_CREDENTIALS, ERROR_CODE.NOAUTHERR);
  }

  // Verify password
  if (!ADMIN_PASSWORD_HASH) {
    throwAppError('Admin credentials not configured', ERROR_CODE.SRVRERR);
  }

  const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (!isValidPassword) {
    throwAppError(AuthenticationMessages.INVALID_CREDENTIALS, ERROR_CODE.NOAUTHERR);
  }

  // Generate JWT token
  const tokenPayload = {
    userId: 'admin',
    email: ADMIN_EMAIL,
    isAdmin: true,
  };

  const token = jwt.sign({
    payload: tokenPayload,
    expiresIn: JWT_DEFAULT_EXPIRY,
  });

  return {
    token,
    user: {
      id: 'admin',
      email: ADMIN_EMAIL,
      isAdmin: true,
    },
  };
}

module.exports = login;
