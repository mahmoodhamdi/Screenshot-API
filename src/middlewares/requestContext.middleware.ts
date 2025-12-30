/**
 * Request Context Middleware
 * Adds request ID, context logger, and request metadata to all requests
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createContextLogger, ContextLogger } from '@utils/logger';

// ============================================
// Extend Express Request Type
// ============================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
      log: ContextLogger;
      startTime: bigint;
    }
  }
}

// ============================================
// Request Context Middleware
// ============================================

/**
 * Request context middleware
 * - Generates or uses existing X-Request-ID
 * - Creates context logger with request metadata
 * - Tracks request start time
 */
export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate or use existing request ID
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Track request start time
  req.startTime = process.hrtime.bigint();

  // Create context logger with request metadata
  req.log = createContextLogger({
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  next();
};

/**
 * Get request duration in milliseconds
 */
export const getRequestDuration = (req: Request): number => {
  if (!req.startTime) return 0;
  const end = process.hrtime.bigint();
  return Number(end - req.startTime) / 1e6;
};

// ============================================
// Request Logging Middleware
// ============================================

/**
 * Log completed requests with duration and status
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log after response is sent
  res.on('finish', () => {
    const durationMs = getRequestDuration(req);

    // Skip health check logging
    if (req.path === '/health' || req.path === '/api/v1/health') {
      return;
    }

    const logData = {
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      contentLength: res.getHeader('content-length'),
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      req.log.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      req.log.warn('Request client error', logData);
    } else {
      req.log.http('Request completed', logData);
    }
  });

  next();
};

export default {
  requestContextMiddleware,
  requestLoggingMiddleware,
  getRequestDuration,
};
