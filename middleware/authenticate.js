const sessionService = require('../services/session.service');
const userService = require('../services/user.service');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication token is required.', 401);
  }

  const payload = sessionService.verifyToken(token);

  if (!payload?.sub) {
    throw new AppError('Authentication token is invalid.', 401);
  }

  const user = await userService.getUserById(payload.sub);

  req.user = user;
  next();
});

module.exports = authenticate;
