# FinEdge REST API

FinEdge is a JavaScript Node.js and Express REST API for tracking users, transactions, budgets, and income-expense summaries. It follows an MVC-style structure with modular routes, controllers, services, middleware, and JSON file persistence.

## Features

- User registration with preferences
- Mock JWT token returned during user registration
- CRUD APIs for income and expense transactions
- Budget creation and listing
- Summary API with total income, total expenses, balance, transaction count, and monthly trends
- Transaction filtering by category, type, user, and date range
- JSON file persistence using `fs/promises`
- Global error handling with custom error classes
- Request logging middleware
- Transaction and budget validation middleware
- CORS middleware
- Simple request rate limiter
- In-memory cache with TTL for `/summary`
- Tests for core endpoints using Node's built-in test runner

## Project Structure

```text
finedge/
  app.js
  server.js
  config/
  controllers/
  data/
  middleware/
  models/
  routes/
  services/
  store/
  test/
  utils/
```

## Setup

```bash
npm install
npm start
```

The API runs on:

```text
http://localhost:3000
```

For development:

```bash
npm run dev
```

## Environment Variables

Create a local `.env` file using `.env.example` as a reference if you want to override defaults.

```text
PORT=3000
CORS_ORIGIN=*
DATA_FILE=./data/database.json
JWT_SECRET=replace-with-a-local-secret
SUMMARY_CACHE_TTL_MS=30000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=120
```

## API Endpoints

### Health

```http
GET /health
```

### Users

```http
POST /users
```

Example body:

```json
{
  "name": "Asha Mehta",
  "email": "asha@example.com",
  "preferences": {
    "currency": "INR"
  }
}
```

### Transactions

```http
POST /transactions
GET /transactions
GET /transactions/:id
PATCH /transactions/:id
DELETE /transactions/:id
```

Example body:

```json
{
  "type": "expense",
  "category": "groceries",
  "amount": 1200,
  "date": "2026-07-05",
  "description": "Weekly groceries"
}
```

Supported filters:

```http
GET /transactions?category=groceries&type=expense&from=2026-07-01&to=2026-07-31
```

### Summary

```http
GET /summary
```

Supported filters:

```http
GET /summary?category=rent&from=2026-07-01&to=2026-07-31
```

### Budgets

```http
POST /budgets
GET /budgets
```

Example body:

```json
{
  "month": "2026-07",
  "monthlyGoal": 60000,
  "savingsTarget": 15000
}
```

## Tests

```bash
npm test
```

## Submission

Push this project to a public GitHub repository and submit the repository link.
