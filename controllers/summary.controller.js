const asyncHandler = require('../utils/asyncHandler');
const summaryService = require('../services/summary.service');

const getSummary = asyncHandler(async (req, res) => {
  const summary = await summaryService.getSummary({
    ...req.query,
    userId: req.user.id,
  });
  res.status(200).json({
    success: true,
    data: summary,
  });
});

module.exports = {
  getSummary,
};
