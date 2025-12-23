/**
 * Middlewares Index
 * Exports all middleware functions
 */

export {
  authenticateJWT,
  authenticateApiKeyMiddleware,
  authenticateAny,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireVerified,
  requirePermission,
} from './auth.middleware';

export {
  rateLimit,
  defaultRateLimit,
  strictRateLimit,
  authRateLimit,
  screenshotRateLimit,
  planBasedRateLimit,
  ipRateLimit,
  concurrentLimit,
} from './rateLimit.middleware';

export {
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
} from './error.middleware';
