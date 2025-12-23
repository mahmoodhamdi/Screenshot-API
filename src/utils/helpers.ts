/**
 * Utility Helper Functions
 * Common utility functions used across the application
 */

import crypto from 'crypto';
import { config } from '@config/index';

/**
 * Generate a secure random string
 * @param length - Length of the string to generate
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 */
export const generateRandomString = (
  length: number = 32,
  charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
): string => {
  const charsetLength = charset.length;
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charsetLength];
  }

  return result;
};

/**
 * Generate an API key with prefix
 * @returns API key string
 */
export const generateApiKey = (): string => {
  const key = generateRandomString(config.apiKey.length);
  return `${config.apiKey.prefix}${key}`;
};

/**
 * Hash a string using SHA-256
 * @param value - String to hash
 * @returns Hashed string
 */
export const hashString = (value: string): string => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

/**
 * Hash an API key for storage
 * @param apiKey - API key to hash
 * @returns Hashed API key
 */
export const hashApiKey = (apiKey: string): string => {
  return hashString(apiKey);
};

/**
 * Generate a UUID v4
 * @returns UUID string
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param baseDelayMs - Base delay in milliseconds
 * @returns Result of the function
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize URL for logging (remove sensitive query params)
 * @param url - URL to sanitize
 * @returns Sanitized URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const sensitiveParams = ['token', 'key', 'secret', 'password', 'auth', 'api_key', 'apikey'];

    sensitiveParams.forEach((param) => {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.set(param, '[REDACTED]');
      }
    });

    return parsed.toString();
  } catch {
    return url;
  }
};

/**
 * Parse duration string to milliseconds
 * @param duration - Duration string (e.g., "7d", "24h", "30m")
 * @returns Duration in milliseconds
 */
export const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000, // seconds
    m: 60 * 1000, // minutes
    h: 60 * 60 * 1000, // hours
    d: 24 * 60 * 60 * 1000, // days
    w: 7 * 24 * 60 * 60 * 1000, // weeks
  };

  return value * multipliers[unit];
};

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format duration in milliseconds to human readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
};

/**
 * Calculate percentage
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @returns Percentage
 */
export const calculatePercentage = (value: number, total: number, decimals: number = 1): number => {
  if (total === 0) return 0;
  return parseFloat(((value / total) * 100).toFixed(decimals));
};

/**
 * Get days until a date
 * @param date - Target date
 * @returns Number of days
 */
export const daysUntil = (date: Date): number => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

/**
 * Get start of current month
 * @returns Date at start of current month
 */
export const getMonthStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Get end of current month
 * @returns Date at end of current month
 */
export const getMonthEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Check if date is in current month
 * @param date - Date to check
 * @returns True if in current month
 */
export const isCurrentMonth = (date: Date): boolean => {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

/**
 * Mask a string for display (e.g., API keys)
 * @param value - String to mask
 * @param visibleChars - Number of characters to show at start and end
 * @returns Masked string
 */
export const maskString = (value: string, visibleChars: number = 4): string => {
  if (value.length <= visibleChars * 2) {
    return '*'.repeat(value.length);
  }
  const start = value.substring(0, visibleChars);
  const end = value.substring(value.length - visibleChars);
  const masked = '*'.repeat(value.length - visibleChars * 2);
  return `${start}${masked}${end}`;
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

/**
 * Pick specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Omit specific keys from an object
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Check if running in production
 * @returns True if in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Check if running in development
 * @returns True if in development
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in test
 * @returns True if in test
 */
export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

/**
 * Safe JSON parse with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
};

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Convert object to query string
 * @param params - Object with parameters
 * @returns Query string
 */
export const toQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

/**
 * Get client IP from request headers
 * @param headers - Request headers
 * @returns Client IP or undefined
 */
export const getClientIp = (headers: Record<string, string | string[] | undefined>): string | undefined => {
  const forwardedFor = headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }
  const realIp = headers['x-real-ip'];
  return Array.isArray(realIp) ? realIp[0] : realIp;
};
