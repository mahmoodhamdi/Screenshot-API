/**
 * Application Constants
 * Centralized constants and error messages
 */

// ============================================
// HTTP Status Codes
// ============================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
  // Authentication Errors (AUTH_)
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  AUTH_REFRESH_TOKEN_INVALID: 'AUTH_REFRESH_TOKEN_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_USER_INACTIVE: 'AUTH_USER_INACTIVE',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH_EMAIL_NOT_VERIFIED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // API Key Errors (API_KEY_)
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_KEY_EXPIRED: 'API_KEY_EXPIRED',
  API_KEY_INACTIVE: 'API_KEY_INACTIVE',
  API_KEY_NOT_FOUND: 'API_KEY_NOT_FOUND',
  API_KEY_IP_NOT_ALLOWED: 'API_KEY_IP_NOT_ALLOWED',
  API_KEY_DOMAIN_NOT_ALLOWED: 'API_KEY_DOMAIN_NOT_ALLOWED',

  // Rate Limiting Errors (RATE_)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',

  // Screenshot Errors (SCREENSHOT_)
  SCREENSHOT_URL_INVALID: 'SCREENSHOT_URL_INVALID',
  SCREENSHOT_URL_UNREACHABLE: 'SCREENSHOT_URL_UNREACHABLE',
  SCREENSHOT_TIMEOUT: 'SCREENSHOT_TIMEOUT',
  SCREENSHOT_CAPTURE_FAILED: 'SCREENSHOT_CAPTURE_FAILED',
  SCREENSHOT_NOT_FOUND: 'SCREENSHOT_NOT_FOUND',
  SCREENSHOT_EXPIRED: 'SCREENSHOT_EXPIRED',
  SCREENSHOT_FORMAT_NOT_ALLOWED: 'SCREENSHOT_FORMAT_NOT_ALLOWED',
  SCREENSHOT_SIZE_EXCEEDED: 'SCREENSHOT_SIZE_EXCEEDED',
  SCREENSHOT_FEATURE_NOT_ALLOWED: 'SCREENSHOT_FEATURE_NOT_ALLOWED',

  // Subscription Errors (SUBSCRIPTION_)
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_UPGRADE_REQUIRED: 'SUBSCRIPTION_UPGRADE_REQUIRED',
  SUBSCRIPTION_PAYMENT_FAILED: 'SUBSCRIPTION_PAYMENT_FAILED',
  SUBSCRIPTION_WEBHOOK_INVALID: 'SUBSCRIPTION_WEBHOOK_INVALID',

  // Validation Errors (VALIDATION_)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_MISSING_FIELD: 'VALIDATION_MISSING_FIELD',

  // Storage Errors (STORAGE_)
  STORAGE_UPLOAD_FAILED: 'STORAGE_UPLOAD_FAILED',
  STORAGE_DOWNLOAD_FAILED: 'STORAGE_DOWNLOAD_FAILED',
  STORAGE_DELETE_FAILED: 'STORAGE_DELETE_FAILED',
  STORAGE_FILE_NOT_FOUND: 'STORAGE_FILE_NOT_FOUND',

  // General Errors (GENERAL_)
  GENERAL_INTERNAL_ERROR: 'GENERAL_INTERNAL_ERROR',
  GENERAL_SERVICE_UNAVAILABLE: 'GENERAL_SERVICE_UNAVAILABLE',
  GENERAL_NOT_FOUND: 'GENERAL_NOT_FOUND',
  GENERAL_BAD_REQUEST: 'GENERAL_BAD_REQUEST',

  // Simplified error codes for middleware
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
} as const;

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Authentication token has expired',
  [ERROR_CODES.AUTH_TOKEN_INVALID]: 'Invalid authentication token',
  [ERROR_CODES.AUTH_TOKEN_MISSING]: 'Authentication token is required',
  [ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID]: 'Invalid or expired refresh token',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'User not found',
  [ERROR_CODES.AUTH_USER_INACTIVE]: 'User account is inactive',
  [ERROR_CODES.AUTH_EMAIL_EXISTS]: 'Email address is already registered',
  [ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions to perform this action',

  // API Key
  [ERROR_CODES.API_KEY_INVALID]: 'Invalid API key',
  [ERROR_CODES.API_KEY_EXPIRED]: 'API key has expired',
  [ERROR_CODES.API_KEY_INACTIVE]: 'API key is inactive',
  [ERROR_CODES.API_KEY_NOT_FOUND]: 'API key not found',
  [ERROR_CODES.API_KEY_IP_NOT_ALLOWED]: 'Request IP is not in the allowed list',
  [ERROR_CODES.API_KEY_DOMAIN_NOT_ALLOWED]: 'Request domain is not in the allowed list',

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please try again later',
  [ERROR_CODES.QUOTA_EXCEEDED]: 'Monthly screenshot quota exceeded. Please upgrade your plan',

  // Screenshot
  [ERROR_CODES.SCREENSHOT_URL_INVALID]: 'Invalid URL provided',
  [ERROR_CODES.SCREENSHOT_URL_UNREACHABLE]: 'Unable to reach the provided URL',
  [ERROR_CODES.SCREENSHOT_TIMEOUT]: 'Screenshot capture timed out',
  [ERROR_CODES.SCREENSHOT_CAPTURE_FAILED]: 'Failed to capture screenshot',
  [ERROR_CODES.SCREENSHOT_NOT_FOUND]: 'Screenshot not found',
  [ERROR_CODES.SCREENSHOT_EXPIRED]: 'Screenshot has expired and been deleted',
  [ERROR_CODES.SCREENSHOT_FORMAT_NOT_ALLOWED]: 'This format is not available in your plan',
  [ERROR_CODES.SCREENSHOT_SIZE_EXCEEDED]: 'Requested size exceeds your plan limits',
  [ERROR_CODES.SCREENSHOT_FEATURE_NOT_ALLOWED]: 'This feature is not available in your plan',

  // Subscription
  [ERROR_CODES.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found',
  [ERROR_CODES.SUBSCRIPTION_INACTIVE]: 'Subscription is not active',
  [ERROR_CODES.SUBSCRIPTION_EXPIRED]: 'Subscription has expired',
  [ERROR_CODES.SUBSCRIPTION_UPGRADE_REQUIRED]: 'Please upgrade your plan to access this feature',
  [ERROR_CODES.SUBSCRIPTION_PAYMENT_FAILED]: 'Payment processing failed',
  [ERROR_CODES.SUBSCRIPTION_WEBHOOK_INVALID]: 'Invalid webhook signature',

  // Validation
  [ERROR_CODES.VALIDATION_FAILED]: 'Validation failed',
  [ERROR_CODES.VALIDATION_INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.VALIDATION_MISSING_FIELD]: 'Required field is missing',

  // Storage
  [ERROR_CODES.STORAGE_UPLOAD_FAILED]: 'Failed to upload file',
  [ERROR_CODES.STORAGE_DOWNLOAD_FAILED]: 'Failed to download file',
  [ERROR_CODES.STORAGE_DELETE_FAILED]: 'Failed to delete file',
  [ERROR_CODES.STORAGE_FILE_NOT_FOUND]: 'File not found',

  // General
  [ERROR_CODES.GENERAL_INTERNAL_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.GENERAL_SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
  [ERROR_CODES.GENERAL_NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.GENERAL_BAD_REQUEST]: 'Bad request',

  // Simplified error messages for middleware
  [ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
  [ERROR_CODES.FORBIDDEN]: 'Access denied',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found',
  [ERROR_CODES.CONFLICT]: 'Resource already exists',
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.INTERNAL_ERROR]: 'An unexpected error occurred',
  [ERROR_CODES.DATABASE_ERROR]: 'Database error occurred',
  [ERROR_CODES.USAGE_LIMIT_EXCEEDED]: 'Usage limit exceeded',
  [ERROR_CODES.PAYMENT_REQUIRED]: 'Payment required to access this feature',

  // Middleware-specific messages
  MISSING_TOKEN: 'Authentication token is required',
  INVALID_TOKEN: 'Invalid or expired authentication token',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_DISABLED: 'User account is disabled',
  MISSING_API_KEY: 'API key is required',
  INVALID_API_KEY: 'Invalid API key',
  MISSING_AUTHENTICATION: 'Authentication is required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  EMAIL_NOT_VERIFIED: 'Email verification is required',
};

// ============================================
// Success Messages
// ============================================

export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  EMAIL_VERIFIED: 'Email verified successfully',

  // API Key
  API_KEY_CREATED: 'API key created successfully',
  API_KEY_DELETED: 'API key deleted successfully',
  API_KEY_UPDATED: 'API key updated successfully',

  // Screenshot
  SCREENSHOT_QUEUED: 'Screenshot request queued',
  SCREENSHOT_COMPLETED: 'Screenshot captured successfully',
  SCREENSHOT_DELETED: 'Screenshot deleted successfully',

  // Subscription
  SUBSCRIPTION_CREATED: 'Subscription created successfully',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
} as const;

// ============================================
// API Permissions
// ============================================

export const API_PERMISSIONS = {
  SCREENSHOT_CREATE: 'screenshot:create',
  SCREENSHOT_READ: 'screenshot:read',
  SCREENSHOT_DELETE: 'screenshot:delete',
  ANALYTICS_READ: 'analytics:read',
  WEBHOOK_MANAGE: 'webhook:manage',
} as const;

export const DEFAULT_PERMISSIONS = [
  API_PERMISSIONS.SCREENSHOT_CREATE,
  API_PERMISSIONS.SCREENSHOT_READ,
  API_PERMISSIONS.SCREENSHOT_DELETE,
];

// ============================================
// Cache Keys
// ============================================

export const CACHE_KEYS = {
  USER_PREFIX: 'user:',
  API_KEY_PREFIX: 'apikey:',
  SCREENSHOT_PREFIX: 'screenshot:',
  RATE_LIMIT_PREFIX: 'ratelimit:',
  USAGE_PREFIX: 'usage:',
  SESSION_PREFIX: 'session:',
} as const;

// ============================================
// Cache TTLs (in seconds)
// ============================================

export const CACHE_TTL = {
  USER: 3600, // 1 hour
  API_KEY: 300, // 5 minutes
  SCREENSHOT: 86400, // 24 hours
  RATE_LIMIT: 60, // 1 minute
  USAGE: 300, // 5 minutes
  SESSION: 604800, // 7 days
} as const;

// ============================================
// Default Values
// ============================================

export const DEFAULTS = {
  PAGINATION_PAGE: 1,
  PAGINATION_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
  SCREENSHOT_WIDTH: 1280,
  SCREENSHOT_HEIGHT: 720,
  SCREENSHOT_QUALITY: 80,
  SCREENSHOT_FORMAT: 'png' as const,
  SCREENSHOT_WAIT_UNTIL: 'networkidle2' as const,
  SCREENSHOT_DELAY: 0,
  SCREENSHOT_EXPIRY_DAYS: 7,
} as const;

// ============================================
// Regex Patterns
// ============================================

export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  OBJECT_ID: /^[a-fA-F0-9]{24}$/,
  API_KEY: /^ss_[a-zA-Z0-9]{32}$/,
  IP_ADDRESS: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
  DOMAIN: /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/,
} as const;

// ============================================
// Webhook Events
// ============================================

export const WEBHOOK_EVENTS = {
  SCREENSHOT_COMPLETED: 'screenshot.completed',
  SCREENSHOT_FAILED: 'screenshot.failed',
  USAGE_THRESHOLD_REACHED: 'usage.threshold_reached',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
} as const;

// ============================================
// Plan Features
// ============================================

export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
  },
  starter: {
    name: 'Starter',
    price: 19,
    description: 'For small projects and side hustles',
  },
  professional: {
    name: 'Professional',
    price: 49,
    description: 'For growing businesses',
  },
  enterprise: {
    name: 'Enterprise',
    price: 149,
    description: 'For large-scale operations',
  },
} as const;

export default {
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_PERMISSIONS,
  DEFAULT_PERMISSIONS,
  CACHE_KEYS,
  CACHE_TTL,
  DEFAULTS,
  REGEX,
  WEBHOOK_EVENTS,
  PLAN_FEATURES,
};
