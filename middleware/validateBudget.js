const AppError = require('../utils/AppError');

const validateBudget = (req, res, next) => {
  const { month, monthlyGoal, savingsTarget } = req.body;

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return next(new AppError('Budget month is required in YYYY-MM format.', 400));
  }

  if (!Number.isFinite(Number(monthlyGoal)) || Number(monthlyGoal) < 0) {
    return next(new AppError('Budget monthlyGoal must be a non-negative number.', 400));
  }

  if (!Number.isFinite(Number(savingsTarget)) || Number(savingsTarget) < 0) {
    return next(new AppError('Budget savingsTarget must be a non-negative number.', 400));
  }

  return next();
};

module.exports = validateBudget;
