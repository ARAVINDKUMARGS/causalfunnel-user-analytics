const cors = require('cors');
const { CORS_ORIGIN, isProduction } = require('../config/env');

function getCorsOptions() {
  // Allow all in development or when explicitly configured as '*'
  if (!isProduction || CORS_ORIGIN === '*') {
    return {
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
      maxAge: 86400
    };
  }

  // Parse and normalize comma-separated allowed origins
  const allowedOrigins = CORS_ORIGIN.split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return {
    origin: function (origin, callback) {
      // Allow server-to-server, mobile, curl, or same-origin requests with no origin header
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.trim().replace(/\/+$/, '');

      const isAllowed = allowedOrigins.some((allowed) => {
        // Direct match
        if (allowed === cleanOrigin) return true;

        // Wildcard domain match (e.g., *.vercel.app)
        if (allowed.startsWith('*.')) {
          const suffix = allowed.slice(1); // e.g., .vercel.app
          return cleanOrigin.endsWith(suffix);
        }

        // Substring check if wildcard is within domain
        if (allowed.includes('*')) {
          const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
          return regex.test(cleanOrigin);
        }

        return false;
      });

      if (isAllowed) {
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
