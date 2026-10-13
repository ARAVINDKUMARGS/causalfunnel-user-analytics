const { getDatabaseStatus } = require('../config/db');
const { NODE_ENV } = require('../config/env');

function getHealth(req, res) {
  const dbStatus = getDatabaseStatus();
  const isHealthy = dbStatus.isHealthy;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: {
      status: dbStatus.status,
      name: dbStatus.database
    }
  });
}

module.exports = {
  getHealth
};
