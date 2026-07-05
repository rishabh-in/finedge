const { randomUUID } = require('crypto');
const store = require('../store/fileStore');

const createBudget = async (payload) => {
  const budget = {
    id: randomUUID(),
    month: payload.month,
    monthlyGoal: Number(payload.monthlyGoal),
    savingsTarget: Number(payload.savingsTarget),
    createdAt: new Date().toISOString(),
  };

  await store.insert('budgets', budget);
  return budget;
};

const getBudgets = async () => store.findAll('budgets');

module.exports = {
  createBudget,
  getBudgets,
};
