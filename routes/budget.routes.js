const express = require('express');
const budgetController = require('../controllers/budget.controller');
const authenticate = require('../middleware/authenticate');
const validateBudget = require('../middleware/validateBudget');

const router = express.Router();

router.use(authenticate);

router.post('/', validateBudget, budgetController.createBudget);
router.get('/', budgetController.getBudgets);

module.exports = router;
