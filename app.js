const express = require('express');
const budgetRoutes = require('./routes/budget.routes');
const healthRoutes = require('./routes/health.routes');
const summaryRoutes = require('./routes/summary.routes');
const transactionRoutes = require('./routes/transaction.routes');
const userRoutes = require('./routes/user.routes');
const cors = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

app.use(express.json());
app.use(cors);
app.use(logger);
app.use(rateLimiter);

app.use('/health', healthRoutes);
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/summary', summaryRoutes);
app.use('/budgets', budgetRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
