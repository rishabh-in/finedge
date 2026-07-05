const express = require('express');
const budgetController = require('../controllers/budget.controller');
const validateBudget = require('../middleware/validateBudget');

const router = express.Router();

router.post('/', validateBudget, budgetController.createBudget);
router.get('/', budgetController.getBudgets);

module.exports = router;
