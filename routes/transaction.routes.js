const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const authenticate = require('../middleware/authenticate');
const validateTransaction = require('../middleware/validateTransaction');

const router = express.Router();

router.use(authenticate);

router.post('/', validateTransaction('create'), transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransaction);
router.patch('/:id', validateTransaction('update'), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
