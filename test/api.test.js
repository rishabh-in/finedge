process.env.NODE_ENV = 'test';
process.env.DATA_FILE = require('path').join(require('os').tmpdir(), `finedge-test-${Date.now()}.json`);
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

const assert = require('assert');
const fs = require('fs/promises');
const test = require('node:test');
const app = require('../app');

let server;
let baseUrl;
let userToken;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) {
    return { response, body: null };
  }

  return {
    response,
    body: await response.json(),
  };
};

const authHeaders = (token = userToken) => ({
  authorization: `Bearer ${token}`,
});

const registerUser = async (email) => {
  const { response, body } = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: email.split('@')[0],
      email,
      preferences: {
        currency: 'INR',
      },
    }),
  });

  assert.strictEqual(response.status, 201);
  return body.data;
};

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const registeredUser = await registerUser('primary@example.com');
  userToken = registeredUser.token;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await fs.unlink(process.env.DATA_FILE).catch(() => {});
});

test('GET /health verifies the server is running', async () => {
  const { response, body } = await request('/health');

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.message, 'Server is running');
});

test('POST /users registers a new user and returns a mock JWT', async () => {
  const { user, token } = await registerUser('asha@example.com');

  assert.strictEqual(user.email, 'asha@example.com');
  assert.strictEqual(token.split('.').length, 3);
});

test('GET /users/me returns the authenticated user profile', async () => {
  const { response, body } = await request('/users/me', {
    headers: authHeaders(),
  });

  assert.strictEqual(response.status, 200);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.email, 'primary@example.com');
});

test('protected routes reject requests without a bearer token', async () => {
  const { response, body } = await request('/transactions');

  assert.strictEqual(response.status, 401);
  assert.strictEqual(body.success, false);
});

test('protected routes reject malformed bearer tokens', async () => {
  const { response, body } = await request('/transactions', {
    headers: authHeaders('not-a-valid-token'),
  });

  assert.strictEqual(response.status, 401);
  assert.strictEqual(body.success, false);
});

test('transaction endpoints create, read, update, filter, and delete records', async () => {
  const createResult = await request('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      type: 'expense',
      category: 'groceries',
      amount: 1200,
      date: '2026-07-05',
      description: 'Weekly groceries',
    }),
  });

  assert.strictEqual(createResult.response.status, 201);
  const transactionId = createResult.body.data.id;
  assert.ok(createResult.body.data.userId);

  const allResult = await request('/transactions', {
    headers: authHeaders(),
  });
  assert.strictEqual(allResult.response.status, 200);
  assert.strictEqual(allResult.body.data.length, 1);

  const filteredResult = await request('/transactions?category=groceries&from=2026-07-01&to=2026-07-31', {
    headers: authHeaders(),
  });
  assert.strictEqual(filteredResult.response.status, 200);
  assert.strictEqual(filteredResult.body.data.length, 1);

  const singleResult = await request(`/transactions/${transactionId}`, {
    headers: authHeaders(),
  });
  assert.strictEqual(singleResult.response.status, 200);
  assert.strictEqual(singleResult.body.data.category, 'groceries');

  const updateResult = await request(`/transactions/${transactionId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({
      amount: 1500,
    }),
  });

  assert.strictEqual(updateResult.response.status, 200);
  assert.strictEqual(updateResult.body.data.amount, 1500);

  const deleteResult = await request(`/transactions/${transactionId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  assert.strictEqual(deleteResult.response.status, 204);

  const missingResult = await request(`/transactions/${transactionId}`, {
    headers: authHeaders(),
  });
  assert.strictEqual(missingResult.response.status, 404);
});

test('transaction queries are scoped to the authenticated user', async () => {
  const otherUser = await registerUser('other@example.com');

  const primaryResult = await request('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      type: 'income',
      category: 'bonus',
      amount: 10000,
      date: '2026-07-10',
    }),
  });

  await request('/transactions', {
    method: 'POST',
    headers: authHeaders(otherUser.token),
    body: JSON.stringify({
      type: 'expense',
      category: 'travel',
      amount: 7000,
      date: '2026-07-11',
    }),
  });

  const primaryList = await request('/transactions', {
    headers: authHeaders(),
  });
  assert.ok(primaryList.body.data.every((transaction) => transaction.userId === primaryResult.body.data.userId));

  const crossUserLookup = await request(`/transactions/${primaryResult.body.data.id}`, {
    headers: authHeaders(otherUser.token),
  });
  assert.strictEqual(crossUserLookup.response.status, 404);
});

test('GET /summary calculates totals and uses the summary cache', async () => {
  await request('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      type: 'income',
      category: 'salary',
      amount: 50000,
      date: '2026-07-01',
    }),
  });

  await request('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      type: 'expense',
      category: 'rent',
      amount: 15000,
      date: '2026-07-03',
    }),
  });

  const firstResult = await request('/summary', {
    headers: authHeaders(),
  });
  assert.strictEqual(firstResult.response.status, 200);
  assert.strictEqual(firstResult.body.data.totalIncome, 60000);
  assert.strictEqual(firstResult.body.data.totalExpenses, 15000);
  assert.strictEqual(firstResult.body.data.balance, 45000);
  assert.strictEqual(firstResult.body.data.cached, false);

  const secondResult = await request('/summary', {
    headers: authHeaders(),
  });
  assert.strictEqual(secondResult.response.status, 200);
  assert.strictEqual(secondResult.body.data.cached, true);
});

test('POST /transactions validates required transaction input', async () => {
  const { response, body } = await request('/transactions', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      type: 'expense',
      amount: -10,
      date: 'not-a-date',
    }),
  });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.success, false);
});
