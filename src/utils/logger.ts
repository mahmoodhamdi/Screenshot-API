/**
 * Winston Logger Configuration
 * Centralized logging with multiple transports and formats
 */

import winston from 'winston';
import path from 'path';

/**
 * Log levels hierarchy
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Log level colors
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

/**
 * Get current environment
 */
const getEnv = (): string => process.env.NODE_ENV || 'development';

/**
 * Determine log level based on environment
 */
const getLogLevel = (): string => {
  const env = getEnv();
  if (env === 'test') return 'error'; // Minimal logging in tests
  if (env === 'production') return process.env.LOG_LEVEL || 'info';
  return 'debug';
};

/**
 * Custom format for console output
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    const meta = Object.keys(metadata).length ? JSON.stringify(metadata, null, 2) : '';
    return `[${timestamp as string}] ${level}: ${message as string} ${meta}`;
  })
);

/**
 * Custom format for file output (JSON)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Create console transport
 */
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

/**
 * Create file transports (only in non-test environments)
 */
const createFileTransports = (): winston.transport[] => {
  const env = getEnv();
  if (env === 'test') return [];

  const logsDir = path.resolve(process.cwd(), 'logs');

  return [
    // All logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
    // Error logs only
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  ];
};

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  transports: [consoleTransport, ...createFileTransports()],
  exitOnError: false,
  silent: getEnv() === 'test' && !process.env.LOG_IN_TESTS,
});

/**
 * Stream for Morgan HTTP logging
 */
export const httpLogStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  },
};

/**
 * Log an error with stack trace
 * @param message - Error message
 * @param error - Error object
 * @param metadata - Additional metadata
 */
export const logError = (message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void => {
  if (error instanceof Error) {
    logger.error(message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...metadata,
    });
  } else {
    logger.error(message, { error, ...metadata });
  }
};

/**
 * Log an info message with metadata
 * @param message - Info message
 * @param metadata - Additional metadata
 */
export const logInfo = (message: string, metadata?: Record<string, unknown>): void => {
  logger.info(message, metadata);
};

/**
 * Log a warning message with metadata
 * @param message - Warning message
 * @param metadata - Additional metadata
 */
export const logWarn = (message: string, metadata?: Record<string, unknown>): void => {
  logger.warn(message, metadata);
};

/**
 * Log a debug message with metadata
 * @param message - Debug message
 * @param metadata - Additional metadata
 */
export const logDebug = (message: string, metadata?: Record<string, unknown>): void => {
  logger.debug(message, metadata);
};

/**
 * Log an HTTP request
 * @param req - Request details
 */
export const logHttpRequest = (req: {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
}): void => {
  logger.http(`${req.method} ${req.url} ${req.statusCode} ${req.responseTime}ms`, {
    method: req.method,
    url: req.url,
    statusCode: req.statusCode,
    responseTime: req.responseTime,
    userAgent: req.userAgent,
    ip: req.ip,
  });
};

/**
 * Create a child logger with additional default metadata
 * @param metadata - Default metadata for all logs from this child
 * @returns Child logger instance
 */
export const createChildLogger = (metadata: Record<string, unknown>): winston.Logger => {
  return logger.child(metadata);
};

/**
 * Log performance metrics
 * @param operation - Operation name
 * @param durationMs - Duration in milliseconds
 * @param metadata - Additional metadata
 */
export const logPerformance = (operation: string, durationMs: number, metadata?: Record<string, unknown>): void => {
  const level = durationMs > 5000 ? 'warn' : 'debug';
  logger.log(level, `Performance: ${operation} took ${durationMs}ms`, {
    operation,
    durationMs,
    ...metadata,
  });
};

/**
 * Log API key usage
 * @param apiKeyId - API key ID
 * @param action - Action performed
 * @param metadata - Additional metadata
 */
export const logApiKeyUsage = (apiKeyId: string, action: string, metadata?: Record<string, unknown>): void => {
  logger.info(`API Key ${apiKeyId}: ${action}`, {
    apiKeyId,
    action,
    ...metadata,
  });
};

/**
 * Log screenshot operation
 * @param screenshotId - Screenshot ID
 * @param status - Operation status
 * @param metadata - Additional metadata
 */
export const logScreenshot = (
  screenshotId: string,
  status: 'started' | 'completed' | 'failed',
  metadata?: Record<string, unknown>
): void => {
  const level = status === 'failed' ? 'error' : 'info';
  logger.log(level, `Screenshot ${screenshotId}: ${status}`, {
    screenshotId,
    status,
    ...metadata,
  });
};

export default logger;
