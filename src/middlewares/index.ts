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
  adaptiveAuthRateLimit,
  getRateLimitCircuitState,
  getRateLimitCircuitStats,
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

export {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validators,
  sanitizeString,
  isValidObjectId,
  isSafeUrl,
  createScreenshotSchema,
  listScreenshotsSchema,
  idParamSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  createApiKeySchema,
  createCheckoutSchema,
  dateRangeSchema,
  paginationSchema,
} from './validation.middleware';

export { csrfToken, csrfProtection, conditionalCsrf, csrfErrorHandler } from './csrf.middleware';

export {
  generateNonce,
  getNonce,
  nonceMiddleware,
  strictCSPMiddleware,
  docsCSPMiddleware,
  apiSecurityMiddleware,
  routeAwareSecurityMiddleware,
  isDocsRoute,
  isApiRoute,
} from './nonce.middleware';

export {
  etagMiddleware,
  responseTimeMiddleware,
  parseFieldSelection,
  applyFieldSelection,
  fieldSelectionMiddleware,
  ALLOWED_FIELDS,
} from './apiOptimization.middleware';

export {
  requestContextMiddleware,
  requestLoggingMiddleware,
  getRequestDuration,
} from './requestContext.middleware';
