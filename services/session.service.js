const { createHmac, timingSafeEqual } = require('crypto');
const config = require('../config/env');

const toBase64Url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

const sign = (value) => createHmac('sha256', config.jwtSecret).update(value).digest('base64url');

const fromBase64Url = (value) => JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));

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

const verifyToken = (token) => {
  try {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return null;
    }

    const expectedSignature = sign(`${header}.${payload}`);
    const signatureBuffer = Buffer.from(signature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return null;
    }

    return fromBase64Url(payload);
  } catch (error) {
    return null;
  }
};

module.exports = {
  createToken,
  verifyToken,
};
