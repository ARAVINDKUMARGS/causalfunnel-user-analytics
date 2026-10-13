const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, isTest } = require('../config/env');

const ingestionLimiter = isTest
  ? (req, res, next) => next() // Disable in test environment
  : rateLimit({
      windowMs: RATE_LIMIT_WINDOW_MS,
      max: RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded for event ingestion. Please try again later.'
      }
    });

module.exports = {
  ingestionLimiter
};
