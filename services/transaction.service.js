const { randomUUID } = require('crypto');
const AppError = require('../utils/AppError');
const store = require('../store/fileStore');
const cache = require('./cache.service');

const normalizeTransaction = (payload, existing = {}) => ({
  ...existing,
  ...payload,
  amount: Number(payload.amount ?? existing.amount),
  date: new Date(payload.date ?? existing.date).toISOString().slice(0, 10),
});

const applyFilters = (transactions, filters = {}) => {
  const { category, type, from, to, userId } = filters;

  return transactions.filter((transaction) => {
    if (category && transaction.category.toLowerCase() !== String(category).toLowerCase()) {
      return false;
    }

    if (type && transaction.type !== type) {
      return false;
    }

    if (userId && transaction.userId !== userId) {
      return false;
    }

    if (from && transaction.date < from) {
      return false;
    }

    if (to && transaction.date > to) {
      return false;
    }

    return true;
  });
};

const createTransaction = async (payload, userId) => {
  const transaction = {
    id: randomUUID(),
    ...normalizeTransaction(payload),
    userId,
    description: payload.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await store.insert('transactions', transaction);
  cache.del('summary:');

  return transaction;
};

const getTransactions = async (filters) => {
  const transactions = await store.findAll('transactions');
  return applyFilters(transactions, filters);
};

const getTransactionById = async (id, userId) => {
  const transaction = await store.findById('transactions', id);

  if (!transaction || (userId && transaction.userId !== userId)) {
    throw new AppError('Transaction not found.', 404);
  }

  return transaction;
};

const updateTransaction = async (id, payload, userId) => {
  const transaction = await getTransactionById(id, userId);
  const updatedTransaction = {
    ...normalizeTransaction(payload, transaction),
    userId: transaction.userId,
    updatedAt: new Date().toISOString(),
  };

  await store.updateById('transactions', id, updatedTransaction);
  cache.del('summary:');

  return updatedTransaction;
};

const deleteTransaction = async (id, userId) => {
  await getTransactionById(id, userId);
  await store.deleteById('transactions', id);
  cache.del('summary:');
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
