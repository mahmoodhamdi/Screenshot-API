/**
 * Audit Logging Utility
 * Provides structured audit logging for security-sensitive operations
 */

import logger from './logger';

// ============================================
// Audit Event Types
// ============================================

/**
 * Audit action categories
 */
export type AuditActionCategory =
  | 'auth'
  | 'api_key'
  | 'screenshot'
  | 'subscription'
  | 'user'
  | 'admin'
  | 'system';

/**
 * Common audit actions
 */
export type AuditAction =
  // Auth actions
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.password_reset_request'
  | 'auth.password_reset_complete'
  | 'auth.password_change'
  | 'auth.email_verified'
  | 'auth.account_locked'
  | 'auth.account_unlocked'
  // API Key actions
  | 'api_key.create'
  | 'api_key.delete'
  | 'api_key.revoke'
  | 'api_key.regenerate'
  // Screenshot actions
  | 'screenshot.create'
  | 'screenshot.delete'
  | 'screenshot.download'
  | 'screenshot.retry'
  // Subscription actions
  | 'subscription.create'
  | 'subscription.update'
  | 'subscription.cancel'
  | 'subscription.payment_failed'
  | 'subscription.payment_success'
  // User actions
  | 'user.register'
  | 'user.update_profile'
  | 'user.delete_account'
  | 'user.update_settings'
  // Admin actions
  | 'admin.user_ban'
  | 'admin.user_unban'
  | 'admin.config_change'
  // System actions
  | 'system.startup'
  | 'system.shutdown'
  | 'system.error'
  // Custom actions
  | string;

/**
 * Resource types for audit events
 */
export type AuditResourceType =
  | 'user'
  | 'apiKey'
  | 'screenshot'
  | 'subscription'
  | 'config'
  | 'system';

/**
 * Audit event interface
 */
export interface AuditEvent {
  /** Action performed (e.g., 'auth.login', 'api_key.create') */
  action: AuditAction;
  /** User ID who performed the action (or 'system' for system events) */
  userId: string;
  /** Type of resource affected */
  resourceType: AuditResourceType;
  /** ID of the affected resource */
  resourceId?: string;
  /** Additional details about the action */
  details?: Record<string, unknown>;
  /** Client IP address */
  ip?: string;
  /** User agent string */
  userAgent?: string;
  /** Request ID for correlation */
  requestId?: string;
  /** Result of the action */
  result?: 'success' | 'failure';
  /** Error message if action failed */
  errorMessage?: string;
}

/**
 * Audit log entry (with computed fields)
 */
export interface AuditLogEntry extends AuditEvent {
  /** Log type identifier */
  type: 'audit';
  /** Timestamp of the event */
  timestamp: string;
  /** Action category */
  category: AuditActionCategory;
}

// ============================================
// Audit Logging Functions
// ============================================

/**
 * Extract category from action string
 */
function getActionCategory(action: string): AuditActionCategory {
  const category = action.split('.')[0] as AuditActionCategory;
  const validCategories: AuditActionCategory[] = [
    'auth',
    'api_key',
    'screenshot',
    'subscription',
    'user',
    'admin',
    'system',
  ];
  return validCategories.includes(category) ? category : 'system';
}

/**
 * Log an audit event
 * @param event - Audit event details
 */
export const auditLog = (event: AuditEvent): void => {
  const logEntry: AuditLogEntry = {
    type: 'audit',
    category: getActionCategory(event.action),
    timestamp: new Date().toISOString(),
    ...event,
  };

  // Use info level for successful actions, warn for failures
  if (event.result === 'failure') {
    logger.warn('Audit event', logEntry);
  } else {
    logger.info('Audit event', logEntry);
  }
};

/**
 * Log a successful audit event
 */
export const auditSuccess = (
  action: AuditAction,
  userId: string,
  resourceType: AuditResourceType,
  options?: Partial<Omit<AuditEvent, 'action' | 'userId' | 'resourceType' | 'result'>>
): void => {
  auditLog({
    action,
    userId,
    resourceType,
    result: 'success',
    ...options,
  });
};

/**
 * Log a failed audit event
 */
export const auditFailure = (
  action: AuditAction,
  userId: string,
  resourceType: AuditResourceType,
  errorMessage: string,
  options?: Partial<Omit<AuditEvent, 'action' | 'userId' | 'resourceType' | 'result' | 'errorMessage'>>
): void => {
  auditLog({
    action,
    userId,
    resourceType,
    result: 'failure',
    errorMessage,
    ...options,
  });
};

// ============================================
// Convenience Functions
// ============================================

/**
 * Log authentication event
 */
export const auditAuth = (
  action: 'login' | 'logout' | 'login_failed' | 'password_reset_request' | 'password_reset_complete' | 'password_change' | 'email_verified' | 'account_locked' | 'account_unlocked',
  userId: string,
  options?: { ip?: string; userAgent?: string; requestId?: string; details?: Record<string, unknown>; result?: 'success' | 'failure'; errorMessage?: string }
): void => {
  auditLog({
    action: `auth.${action}`,
    userId,
    resourceType: 'user',
    resourceId: userId,
    result: options?.result || 'success',
    ...options,
  });
};

/**
 * Log API key event
 */
export const auditApiKey = (
  action: 'create' | 'delete' | 'revoke' | 'regenerate',
  userId: string,
  apiKeyId: string,
  options?: { ip?: string; userAgent?: string; requestId?: string; details?: Record<string, unknown> }
): void => {
  auditLog({
    action: `api_key.${action}`,
    userId,
    resourceType: 'apiKey',
    resourceId: apiKeyId,
    result: 'success',
    ...options,
  });
};

/**
 * Log screenshot event
 */
export const auditScreenshot = (
  action: 'create' | 'delete' | 'download' | 'retry',
  userId: string,
  screenshotId: string,
  options?: { ip?: string; userAgent?: string; requestId?: string; details?: Record<string, unknown>; result?: 'success' | 'failure'; errorMessage?: string }
): void => {
  auditLog({
    action: `screenshot.${action}`,
    userId,
    resourceType: 'screenshot',
    resourceId: screenshotId,
    result: options?.result || 'success',
    ...options,
  });
};

/**
 * Log subscription event
 */
export const auditSubscription = (
  action: 'create' | 'update' | 'cancel' | 'payment_failed' | 'payment_success',
  userId: string,
  subscriptionId?: string,
  options?: { ip?: string; userAgent?: string; requestId?: string; details?: Record<string, unknown> }
): void => {
  auditLog({
    action: `subscription.${action}`,
    userId,
    resourceType: 'subscription',
    resourceId: subscriptionId,
    result: action === 'payment_failed' ? 'failure' : 'success',
    ...options,
  });
};

export default {
  auditLog,
  auditSuccess,
  auditFailure,
  auditAuth,
  auditApiKey,
  auditScreenshot,
  auditSubscription,
};
