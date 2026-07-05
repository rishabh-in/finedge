const { createHmac } = require('crypto');
const config = require('../config/env');

const toBase64Url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const sign = (value) => createHmac('sha256', config.jwtSecret).update(value).digest('base64url');

const createToken = (user) => {
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const payload = toBase64Url({
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
  });
  const signature = sign(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
};

module.exports = {
  createToken,
};
