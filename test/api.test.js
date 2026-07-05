process.env.NODE_ENV = 'test';
process.env.DATA_FILE = require('path').join(require('os').tmpdir(), `finedge-test-${Date.now()}.json`);
process.env.RATE_LIMIT_MAX_REQUESTS = '1000';

const assert = require('assert');
const fs = require('fs/promises');
const test = require('node:test');
const app = require('../app');

let server;
let baseUrl;

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return { response, body: null };
  }

  return {
    response,
    body: await response.json(),
  };
};

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
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
  const { response, body } = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Asha Mehta',
      email: 'asha@example.com',
      preferences: {
        currency: 'INR',
      },
    }),
  });

  assert.strictEqual(response.status, 201);
  assert.strictEqual(body.success, true);
  assert.strictEqual(body.data.user.email, 'asha@example.com');
  assert.strictEqual(body.data.token.split('.').length, 3);
});

test('transaction endpoints create, read, update, filter, and delete records', async () => {
  const createResult = await request('/transactions', {
    method: 'POST',
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

  const allResult = await request('/transactions');
  assert.strictEqual(allResult.response.status, 200);
  assert.strictEqual(allResult.body.data.length, 1);

  const filteredResult = await request('/transactions?category=groceries&from=2026-07-01&to=2026-07-31');
  assert.strictEqual(filteredResult.response.status, 200);
  assert.strictEqual(filteredResult.body.data.length, 1);

  const singleResult = await request(`/transactions/${transactionId}`);
  assert.strictEqual(singleResult.response.status, 200);
  assert.strictEqual(singleResult.body.data.category, 'groceries');

  const updateResult = await request(`/transactions/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      amount: 1500,
    }),
  });

  assert.strictEqual(updateResult.response.status, 200);
  assert.strictEqual(updateResult.body.data.amount, 1500);

  const deleteResult = await request(`/transactions/${transactionId}`, {
    method: 'DELETE',
  });

  assert.strictEqual(deleteResult.response.status, 204);

  const missingResult = await request(`/transactions/${transactionId}`);
  assert.strictEqual(missingResult.response.status, 404);
});

test('GET /summary calculates totals and uses the summary cache', async () => {
  await request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      type: 'income',
      category: 'salary',
      amount: 50000,
      date: '2026-07-01',
    }),
  });

  await request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      type: 'expense',
      category: 'rent',
      amount: 15000,
      date: '2026-07-03',
    }),
  });

  const firstResult = await request('/summary');
  assert.strictEqual(firstResult.response.status, 200);
  assert.strictEqual(firstResult.body.data.totalIncome, 50000);
  assert.strictEqual(firstResult.body.data.totalExpenses, 15000);
  assert.strictEqual(firstResult.body.data.balance, 35000);
  assert.strictEqual(firstResult.body.data.cached, false);

  const secondResult = await request('/summary');
  assert.strictEqual(secondResult.response.status, 200);
  assert.strictEqual(secondResult.body.data.cached, true);
});

test('POST /transactions validates required transaction input', async () => {
  const { response, body } = await request('/transactions', {
    method: 'POST',
    body: JSON.stringify({
      type: 'expense',
      amount: -10,
      date: 'not-a-date',
    }),
  });

  assert.strictEqual(response.status, 400);
  assert.strictEqual(body.success, false);
});
