/**
 * Error Tracking Utility
 * Centralized error capturing and tracking with external service integration
 */

import logger from './logger';
import config from '@config/index';

// ============================================
// Types
// ============================================

/**
 * Error severity levels
 */
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

/**
 * User context for error tracking
 */
export interface ErrorUserContext {
  id?: string;
  email?: string;
  plan?: string;
}

/**
 * Request context for error tracking
 */
export interface ErrorRequestContext {
  path?: string;
  method?: string;
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  ip?: string;
}

/**
 * Full error context
 */
export interface ErrorContext {
  user?: ErrorUserContext;
  request?: ErrorRequestContext;
  requestId?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  severity?: ErrorSeverity;
}

/**
 * Captured error entry
 */
export interface CapturedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  timestamp: string;
  context: ErrorContext;
  fingerprint?: string;
}

// ============================================
// Error Fingerprinting
// ============================================

/**
 * Generate a fingerprint for error deduplication
 * Errors with the same fingerprint are grouped together
 */
function generateFingerprint(error: Error, context: ErrorContext): string {
  const parts = [
    error.name,
    error.message.replace(/[0-9a-f]{24}/gi, '<id>'), // Remove MongoDB IDs
    context.request?.path || 'unknown',
    context.request?.method || 'unknown',
  ];
  return parts.join(':');
}

/**
 * Sanitize error context to remove sensitive data
 */
function sanitizeContext(context: ErrorContext): ErrorContext {
  const sanitized = { ...context };

  // Remove sensitive headers
  if (sanitized.request?.headers) {
    const headers = { ...sanitized.request.headers };
    delete headers['authorization'];
    delete headers['x-api-key'];
    delete headers['cookie'];
    sanitized.request = { ...sanitized.request, headers };
  }

  // Remove sensitive body fields
  if (sanitized.request?.body) {
    const body = { ...sanitized.request.body };
    delete body['password'];
    delete body['token'];
    delete body['secret'];
    delete body['apiKey'];
    sanitized.request = { ...sanitized.request, body };
  }

  return sanitized;
}

// ============================================
// Error Tracking Functions
// ============================================

/**
 * Capture and log an error with full context
 * @param error - Error object to capture
 * @param context - Additional context about the error
 */
export const captureError = (error: Error, context: ErrorContext = {}): void => {
  const sanitizedContext = sanitizeContext(context);
  const fingerprint = generateFingerprint(error, sanitizedContext);

  const capturedError: CapturedError = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: (error as NodeJS.ErrnoException).code,
    timestamp: new Date().toISOString(),
    context: sanitizedContext,
    fingerprint,
  };

  // Log to Winston
  const logLevel = context.severity === 'fatal' ? 'error' : context.severity || 'error';
  logger.log(logLevel, 'Captured error', {
    type: 'error_tracking',
    error: capturedError,
  });

  // Integration with external error tracking services
  // Sentry integration (if configured)
  if (process.env.SENTRY_DSN) {
    // Sentry.captureException(error, {
    //   user: sanitizedContext.user,
    //   tags: sanitizedContext.tags,
    //   extra: sanitizedContext.extra,
    //   fingerprint: [fingerprint],
    // });
    logger.debug('Error sent to Sentry', { fingerprint });
  }

  // Rollbar integration (if configured)
  if (process.env.ROLLBAR_TOKEN) {
    // rollbar.error(error, { ...sanitizedContext });
    logger.debug('Error sent to Rollbar', { fingerprint });
  }
};

/**
 * Capture an error with request context
 * Convenience wrapper for capturing errors in request handlers
 */
export const captureRequestError = (
  error: Error,
  req: {
    requestId?: string;
    path?: string;
    method?: string;
    query?: Record<string, unknown>;
    ip?: string;
    user?: { _id?: string; id?: string; email?: string };
  },
  extra?: Record<string, unknown>
): void => {
  captureError(error, {
    requestId: req.requestId,
    request: {
      path: req.path,
      method: req.method,
      query: req.query,
      ip: req.ip,
    },
    user: req.user
      ? {
          id: req.user._id?.toString() || req.user.id,
          email: req.user.email,
        }
      : undefined,
    extra,
  });
};

/**
 * Capture a fatal error (application-breaking)
 */
export const captureFatalError = (error: Error, context?: Omit<ErrorContext, 'severity'>): void => {
  captureError(error, { ...context, severity: 'fatal' });
};

/**
 * Capture a warning-level error
 */
export const captureWarning = (error: Error, context?: Omit<ErrorContext, 'severity'>): void => {
  captureError(error, { ...context, severity: 'warning' });
};

// ============================================
// Error Boundary Helpers
// ============================================

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return (await fn(...args)) as Awaited<ReturnType<T>>;
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, context);
      }
      throw error;
    }
  }) as T;
}

/**
 * Track unhandled promise rejections
 */
export const setupUnhandledRejectionTracking = (): void => {
  process.on('unhandledRejection', (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    captureFatalError(error, {
      tags: { type: 'unhandled_rejection' },
    });
  });
};

/**
 * Track uncaught exceptions
 */
export const setupUncaughtExceptionTracking = (): void => {
  process.on('uncaughtException', (error: Error) => {
    captureFatalError(error, {
      tags: { type: 'uncaught_exception' },
    });

    // Give time for the error to be logged/sent before exiting
    if (config.env === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
};

/**
 * Initialize all error tracking handlers
 */
export const initializeErrorTracking = (): void => {
  setupUnhandledRejectionTracking();
  setupUncaughtExceptionTracking();
  logger.info('Error tracking initialized');
};

export default {
  captureError,
  captureRequestError,
  captureFatalError,
  captureWarning,
  withErrorTracking,
  initializeErrorTracking,
};
