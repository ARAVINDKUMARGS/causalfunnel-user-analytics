const cors = require('cors');
const { CORS_ORIGIN, isProduction } = require('../config/env');

function getCorsOptions() {
  if (!isProduction || CORS_ORIGIN === '*') {
    return {
      origin: true, // Reflect request origin
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400
    };
  }

  const allowedOrigins = CORS_ORIGIN.split(',').map((o) => o.trim());

  return {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by CORS policy`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400
  };
}

module.exports = cors(getCorsOptions());
