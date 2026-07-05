const path = require('path');
require('dotenv').config({ quiet: true });

const numberFromEnv = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

module.exports = {
  port: numberFromEnv('PORT', 3000),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dataFile: process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'database.json'),
  jwtSecret: process.env.JWT_SECRET || 'finedge-dev-secret',
  summaryCacheTtlMs: numberFromEnv('SUMMARY_CACHE_TTL_MS', 30000),
  rateLimitWindowMs: numberFromEnv('RATE_LIMIT_WINDOW_MS', 60000),
  rateLimitMaxRequests: numberFromEnv('RATE_LIMIT_MAX_REQUESTS', 120),
};
