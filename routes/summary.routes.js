const express = require('express');
const summaryController = require('../controllers/summary.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', summaryController.getSummary);

module.exports = router;
