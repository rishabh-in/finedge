const config = require('../config/env');
const cache = require('./cache.service');
const transactionService = require('./transaction.service');

const buildCacheKey = (filters) => `summary:${JSON.stringify(filters || {})}`;

const getMonthKey = (date) => date.slice(0, 7);

const getSummary = async (filters = {}) => {
  const cacheKey = buildCacheKey(filters);
  const cached = cache.get(cacheKey);

  if (cached) {
    return {
      ...cached,
      cached: true,
    };
  }

  const transactions = await transactionService.getTransactions(filters);

  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
      } else {
        summary.totalExpenses += transaction.amount;
      }

      const month = getMonthKey(transaction.date);
      const currentMonth = summary.monthlyTrends[month] || { income: 0, expenses: 0, balance: 0 };

      if (transaction.type === 'income') {
        currentMonth.income += transaction.amount;
      } else {
        currentMonth.expenses += transaction.amount;
      }

      currentMonth.balance = currentMonth.income - currentMonth.expenses;
      summary.monthlyTrends[month] = currentMonth;

      return summary;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      transactionCount: transactions.length,
      monthlyTrends: {},
    }
  );

  totals.balance = totals.totalIncome - totals.totalExpenses;

  cache.set(cacheKey, totals, config.summaryCacheTtlMs);

  return {
    ...totals,
    cached: false,
  };
};

module.exports = {
  getSummary,
};
