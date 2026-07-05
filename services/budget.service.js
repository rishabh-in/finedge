const { randomUUID } = require('crypto');
const store = require('../store/fileStore');

const createBudget = async (payload, userId) => {
  const budget = {
    id: randomUUID(),
    userId,
    month: payload.month,
    monthlyGoal: Number(payload.monthlyGoal),
    savingsTarget: Number(payload.savingsTarget),
    createdAt: new Date().toISOString(),
  };

  await store.insert('budgets', budget);
  return budget;
};

const getBudgets = async (userId) => {
  const budgets = await store.findAll('budgets');
  return budgets.filter((budget) => budget.userId === userId);
};

module.exports = {
  createBudget,
  getBudgets,
};
