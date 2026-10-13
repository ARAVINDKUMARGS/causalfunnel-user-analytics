const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');
const logger = require('../utils/logger');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    mongoose.set('strictQuery', true);
    
    // Connect with recommended options and reasonable timeouts
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    isConnected = true;
    logger.info(`MongoDB connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (err) {
    isConnected = false;
    logger.error('MongoDB connection failure:', err.message);
    throw err;
  }
}

async function disconnectDB() {
  if (!isConnected && mongoose.connection.readyState === 0) {
    return;
  }
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB connection closed gracefully');
  } catch (err) {
    logger.error('Error during MongoDB disconnect:', err.message);
  }
}

function getDatabaseStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;
  return {
    status: states[readyState] || 'unknown',
    database: mongoose.connection ? mongoose.connection.name : null,
    isHealthy: readyState === 1
  };
}

module.exports = {
  connectDB,
  disconnectDB,
  getDatabaseStatus
};
