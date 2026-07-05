const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  const error = err instanceof AppError ? err : new AppError('Internal server error', 500);

  if (!(err instanceof AppError)) {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

module.exports = errorHandler;
