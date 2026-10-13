const logger = require('../utils/logger');
const { isProduction } = require('../config/env');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err.message);

  // MongoDB / Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  // MongoDB CastError (e.g. invalid ObjectId or type)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid Parameter',
      message: `Invalid value for parameter: ${err.path}`
    });
  }

  // JSON parse error in body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON',
      message: 'Invalid JSON payload received'
    });
  }

  // CORS Error
  if (err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Forbidden',
      message: err.message
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const response = {
    success: false,
    error: err.name || 'InternalServerError',
    message: isProduction && statusCode === 500 ? 'An unexpected internal error occurred' : err.message
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
