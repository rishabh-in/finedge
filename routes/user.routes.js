const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/', userController.createUser);
router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router;
