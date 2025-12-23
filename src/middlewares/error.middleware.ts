/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';
import logger from '@utils/logger';
import { ERROR_CODES, ERROR_MESSAGES } from '@utils/constants';
import { formatZodErrors } from '@utils/validators';

// ============================================
// Custom Error Classes
// ============================================

/**
 * Base application error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, true, details);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 401, ERROR_CODES.UNAUTHORIZED, true);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, 403, ERROR_CODES.FORBIDDEN, true);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, ERROR_CODES.NOT_FOUND, true);
  }
}

/**
 * Conflict error (e.g., duplicate resource)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, ERROR_CODES.CONFLICT, true);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, 429, ERROR_CODES.RATE_LIMIT_EXCEEDED, true);
    this.retryAfter = retryAfter;
  }
}

/**
 * Usage limit error
 */
export class UsageLimitError extends AppError {
  constructor(message: string = 'Monthly usage limit reached') {
    super(message, 429, ERROR_CODES.USAGE_LIMIT_EXCEEDED, true);
  }
}

/**
 * Payment required error
 */
export class PaymentRequiredError extends AppError {
  constructor(message: string = 'Payment required') {
    super(message, 402, ERROR_CODES.PAYMENT_REQUIRED, true);
  }
}

// ============================================
// Error Response Interface
// ============================================

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  requestId?: string;
}

// ============================================
// Error Handling Middleware
// ============================================

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): ErrorResponse {
  const formattedErrors = formatZodErrors(error);
  return {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: formattedErrors,
    },
  };
}

/**
 * Handle MongoDB errors
 */
function handleMongoError(error: MongoError): ErrorResponse {
  // Duplicate key error
  if (error.code === 11000) {
    const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern;
    const field = keyPattern ? Object.keys(keyPattern)[0] : 'field';
    return {
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      },
    };
  }

  return {
    success: false,
    error: {
      code: ERROR_CODES.DATABASE_ERROR,
      message: 'Database error occurred',
    },
  };
}

/**
 * Handle Mongoose validation errors
 */
function handleMongooseValidationError(
  error: mongoose.Error.ValidationError
): ErrorResponse {
  const errors: Record<string, string> = {};
  for (const field in error.errors) {
    errors[field] = error.errors[field].message;
  }

  return {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      details: errors,
    },
  };
}

/**
 * Handle Mongoose cast errors (e.g., invalid ObjectId)
 */
function handleCastError(error: mongoose.Error.CastError): ErrorResponse {
  return {
    success: false,
    error: {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: `Invalid ${error.path}: ${error.value}`,
    },
  };
}

/**
 * Handle application errors
 */
function handleAppError(error: AppError): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (error.details) {
    response.error.details = error.details;
  }

  return response;
}

/**
 * Main error handling middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500;
  let response: ErrorResponse;

  // Log error
  const logData = {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId?.toString(),
  };

  // Handle specific error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    response = handleAppError(error);

    if (!error.isOperational) {
      logger.error('Non-operational error', logData);
    } else {
      logger.warn('Operational error', logData);
    }
  } else if (error instanceof ZodError) {
    statusCode = 400;
    response = handleZodError(error);
    logger.debug('Validation error', logData);
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    response = handleMongooseValidationError(error);
    logger.debug('Mongoose validation error', logData);
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    response = handleCastError(error);
    logger.debug('Cast error', logData);
  } else if ('code' in error && typeof (error as MongoError).code === 'number') {
    statusCode = 400;
    response = handleMongoError(error as MongoError);
    logger.warn('MongoDB error', logData);
  } else {
    // Unknown error
    logger.error('Unhandled error', logData);
    response = {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message:
          process.env.NODE_ENV === 'production'
            ? ERROR_MESSAGES.INTERNAL_ERROR
            : error.message,
      },
    };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.error.stack = error.stack;
  }

  // Add request ID if available
  const requestId = req.headers['x-request-id'] as string;
  if (requestId) {
    response.requestId = requestId;
  }

  // Send response
  res.status(statusCode).json(response);
}

/**
 * Handle 404 not found
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}

/**
 * Async handler wrapper to catch promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ============================================
// Export
// ============================================

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UsageLimitError,
  PaymentRequiredError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
