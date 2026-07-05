const AppError = require('../utils/AppError');

const allowedTypes = new Set(['income', 'expense']);

const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const validateTransaction = (mode = 'create') => (req, res, next) => {
  const isPatch = mode === 'update';
  const { type, category, amount, date } = req.body;

  if ((!isPatch || type !== undefined) && !allowedTypes.has(type)) {
    return next(new AppError('Transaction type must be income or expense.', 400));
  }

  if ((!isPatch || category !== undefined) && (!category || typeof category !== 'string')) {
    return next(new AppError('Transaction category is required.', 400));
  }

  if ((!isPatch || amount !== undefined) && (!Number.isFinite(Number(amount)) || Number(amount) <= 0)) {
    return next(new AppError('Transaction amount must be a positive number.', 400));
  }

  if ((!isPatch || date !== undefined) && !isValidDate(date)) {
    return next(new AppError('Transaction date must be a valid date.', 400));
  }

  return next();
};

module.exports = validateTransaction;
