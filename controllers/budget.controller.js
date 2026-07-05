const asyncHandler = require('../utils/asyncHandler');
const budgetService = require('../services/budget.service');

const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.body);
  res.status(201).json({
    success: true,
    data: budget,
  });
});

const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets();
  res.status(200).json({
    success: true,
    data: budgets,
  });
});

module.exports = {
  createBudget,
  getBudgets,
};
