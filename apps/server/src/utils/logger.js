const { isTest } = require('../config/env');

const logger = {
  info: (msg, meta) => {
    if (isTest) return;
    console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, meta !== undefined ? meta : '');
  },
  warn: (msg, meta) => {
    if (isTest) return;
    console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, meta !== undefined ? meta : '');
  },
  error: (msg, meta) => {
    console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, meta !== undefined ? meta : '');
  },
  debug: (msg, meta) => {
    if (process.env.DEBUG) {
      console.log(`[DEBUG] [${new Date().toISOString()}] ${msg}`, meta !== undefined ? meta : '');
    }
  }
};

module.exports = logger;
