const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
};

module.exports = {
  healthCheck,
};
