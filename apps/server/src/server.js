const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');

let server;

async function startServer() {
  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Start HTTP listener
    server = app.listen(PORT, () => {
      logger.info(`===============================================`);
      logger.info(`🚀 CausalFunnel Server running on port ${PORT}`);
      logger.info(`🌐 Environment: ${NODE_ENV}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📦 Tracker script: http://localhost:${PORT}/tracker.js`);
      logger.info(`===============================================`);
    });

    // 3. Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);

      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed.');
          try {
            await disconnectDB();
            logger.info('Graceful shutdown completed successfully.');
            process.exit(0);
          } catch (err) {
            logger.error('Error during database disconnect:', err.message);
            process.exit(1);
          }
        });
      } else {
        process.exit(0);
      }

      // Force shutdown after timeout if pending handles don't drain
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err.message);
  process.exit(1);
});

startServer();
