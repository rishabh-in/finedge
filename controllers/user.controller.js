const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

const createUser = asyncHandler(async (req, res) => {
  const result = await userService.createUser(req.body);
  res.status(201).json({
    success: true,
    data: result,
  });
});

module.exports = {
  createUser,
};
