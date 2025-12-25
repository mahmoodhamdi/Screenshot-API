/**
 * Server Entry Point
 * Starts the HTTP server with database and Redis connections
 */

import http from 'http';
import app from './app';
import config from '@config/index';
import { connectDatabase, disconnectDatabase } from '@config/database';
import { connectRedis, disconnectRedis, getRedisClient } from '@config/redis';
import { closeBrowserPool } from '@config/puppeteer';
import logger from '@utils/logger';

// ============================================
// Server Configuration
// ============================================

const PORT = config.server.port;
const HOST = '0.0.0.0';

// Create HTTP server
const server = http.createServer(app);

// ============================================
// Startup Function
// ============================================

async function startServer(): Promise<void> {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    await connectDatabase();
    logger.info('MongoDB connected successfully');

    // Connect to Redis (optional)
    logger.info('Connecting to Redis...');
    try {
      await connectRedis();
      logger.info('Redis connected successfully');
    } catch (redisError) {
      logger.warn('Redis connection failed, continuing without Redis cache', {
        error: redisError instanceof Error ? redisError.message : 'Unknown error',
      });
    }

    // Start HTTP server
    server.listen(PORT, HOST, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: config.server.env,
        version: config.api.version,
        nodeVersion: process.version,
      });

      if (config.server.env === 'development') {
        logger.info(`API available at http://localhost:${PORT}/api/${config.api.version}`);
        logger.info(`Health check at http://localhost:${PORT}/health`);
      }
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// ============================================
// Graceful Shutdown
// ============================================

let isShuttingDown = false;

function gracefulShutdown(signal: string): void {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal');
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close browser pool
      logger.info('Closing browser pool...');
      await closeBrowserPool();
      logger.info('Browser pool closed');

      // Disconnect Redis
      const redisClient = getRedisClient();
      if (redisClient) {
        logger.info('Disconnecting Redis...');
        await disconnectRedis();
        logger.info('Redis disconnected');
      }

      // Disconnect MongoDB
      logger.info('Disconnecting MongoDB...');
      await disconnectDatabase();
      logger.info('MongoDB disconnected');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  });

  // Force shutdown after timeout
  const shutdownTimeout = config.server.shutdownTimeout || 30000;
  setTimeout(() => {
    logger.error(`Forced shutdown after ${shutdownTimeout}ms timeout`);
    process.exit(1);
  }, shutdownTimeout);
}

// ============================================
// Process Event Handlers
// ============================================

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
  });
  // Don't exit for unhandled rejections, just log them
});

// ============================================
// Start Server
// ============================================

startServer();

export default server;
