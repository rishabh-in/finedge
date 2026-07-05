const asyncHandler = require('../utils/asyncHandler');
const transactionService = require('../services/transaction.service');

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body, req.user.id);
  res.status(201).json({
    success: true,
    data: transaction,
  });
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionService.getTransactions({
    ...req.query,
    userId: req.user.id,
  });
  res.status(200).json({
    success: true,
    data: transactions,
  });
});

const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    data: transaction,
  });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.params.id, req.body, req.user.id);
  res.status(200).json({
    success: true,
    data: transaction,
  });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionService.deleteTransaction(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
