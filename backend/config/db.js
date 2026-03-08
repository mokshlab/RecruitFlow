const path = require('path');
const mongoose = require('mongoose');
const logger = require('./logger');
const constants = require('./constants');
const { initGridFS } = require('./gridfs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * Connect to MongoDB with improved retry logic, error handling, and connection pooling
 */
const connectDB = async () => {
  // Validate MongoDB URI exists
  if (!process.env.MONGO_URI) {
    logger.error('MONGO_URI environment variable is not defined');
    process.exit(1);
  }

  let retries = constants.DB_RETRY_ATTEMPTS;
  let delay = constants.DB_RETRY_DELAY_MS;
  const maxDelay = 60000; // Cap exponential backoff at 60 seconds

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: constants.DB_CONNECTION_TIMEOUT_MS,
        maxPoolSize: 10, // Connection pool size
        minPoolSize: 2,
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        retryWrites: true,
        retryReads: true,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      logger.info(`Database: ${conn.connection.name}`);
      
      // Initialize GridFS after successful MongoDB connection
      mongoose.connection.once('open', () => {
        initGridFS();
      });
      
      // Handle connection events
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Auto-reconnection will be attempted by Mongoose.');
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', { error: err.message, stack: err.stack });
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected successfully');
      });

      mongoose.connection.on('reconnectFailed', () => {
        logger.error('MongoDB reconnection failed after multiple attempts');
      });

      return conn;
    } catch (err) {
      retries -= 1;
      const nextDelay = Math.min(delay, maxDelay);
      
      logger.error(`MongoDB connection failed. Retries left: ${retries}`, {
        error: err.message,
        errorCode: err.code,
        nextRetryIn: retries > 0 ? `${nextDelay / 1000}s` : 'none'
      });

      if (retries === 0) {
        logger.error('MongoDB connection failed after all retry attempts. Exiting process.');
        process.exit(1);
      }

      // Exponential backoff with cap: wait before next retry
      await new Promise(resolve => setTimeout(resolve, nextDelay));
      delay = Math.min(delay * 2, maxDelay); // Double the delay but cap it
    }
  }
};

module.exports = connectDB;