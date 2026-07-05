const config = require('../config/env');
const AppError = require('../utils/AppError');

const requests = new Map();

const rateLimiter = (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = requests.get(key) || { count: 0, resetAt: now + config.rateLimitWindowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + config.rateLimitWindowMs;
  }

  entry.count += 1;
  requests.set(key, entry);

  if (entry.count > config.rateLimitMaxRequests) {
    return next(new AppError('Too many requests. Please try again later.', 429));
  }

  return next();
};

module.exports = rateLimiter;
