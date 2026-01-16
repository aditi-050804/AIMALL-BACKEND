import mongoose from 'mongoose';
import dns from 'dns';
import { MONGO_URI } from './env.js';
import logger from '../utils/logger.js';

// Force IPv4 first to avoid DNS resolution issues
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    const sanitizedUri = MONGO_URI ? MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'UNDEFINED';
    logger.info(`Using URI: ${sanitizedUri}`);

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority',
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

  } catch (error) {
    logger.error(`❌ MongoDB Connection Failed: ${error.message}`);
    logger.error('Server will continue running without database connection.');
    logger.error('Please check:');
    logger.error('1. Internet connectivity');
    logger.error('2. MongoDB Atlas cluster status');
    logger.error('3. DNS resolution (try using Google DNS: 8.8.8.8)');

    // Don't exit - allow server to start for debugging
    // process.exit(1);
  }
};

export default connectDB;
