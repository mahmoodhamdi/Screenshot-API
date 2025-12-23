/**
 * MongoDB Database Configuration
 * Handles connection, disconnection, and health checks
 */

import mongoose from 'mongoose';
import { config } from './index';
import { logger } from '@utils/logger';

/**
 * MongoDB connection options
 */
const mongooseOptions: mongoose.ConnectOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
  w: 'majority',
};

/**
 * Database connection state
 */
let isConnected = false;

/**
 * Connect to MongoDB database
 * @returns Promise that resolves when connected
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    logger.info('Using existing database connection');
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(config.mongo.uri, mongooseOptions);

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Set up connection event handlers
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    isConnected = false;
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 * @returns Promise that resolves when disconnected
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (!isConnected) {
    logger.info('No active database connection to close');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Check database connection health
 * @returns Object with connection status and details
 */
export const checkDatabaseHealth = async (): Promise<{
  connected: boolean;
  status: string;
  host?: string;
  database?: string;
  latencyMs?: number;
}> => {
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return {
        connected: false,
        status: 'disconnected',
      };
    }

    const startTime = Date.now();
    await mongoose.connection.db?.admin().ping();
    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      status: 'connected',
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      latencyMs,
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      connected: false,
      status: 'error',
    };
  }
};

/**
 * Get current connection state
 * @returns MongoDB connection ready state
 */
export const getConnectionState = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Get database statistics
 * @returns Database statistics or null if not connected
 */
export const getDatabaseStats = async (): Promise<Record<string, unknown> | null> => {
  try {
    if (!isConnected || !mongoose.connection.db) {
      return null;
    }

    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      views: stats.views,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return null;
  }
};

export default {
  connect: connectDatabase,
  disconnect: disconnectDatabase,
  checkHealth: checkDatabaseHealth,
  getState: getConnectionState,
  getStats: getDatabaseStats,
};
