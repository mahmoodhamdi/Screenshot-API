/**
 * API Optimization Middleware
 * Provides ETag support, response time tracking, and field selection utilities
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '@utils/logger';

// ============================================
// ETag Middleware
// ============================================

/**
 * Generate ETag for response body
 * Uses MD5 hash for speed (not security-critical)
 */
function generateETag(body: string): string {
  const hash = crypto.createHash('md5').update(body).digest('hex');
  return `"${hash}"`;
}

/**
 * ETag middleware for conditional GET requests
 * Returns 304 Not Modified if content hasn't changed
 */
export const etagMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);

  res.json = function (data: unknown): Response {
    // Skip ETag for error responses
    if (res.statusCode >= 400) {
      return originalJson(data);
    }

    const body = JSON.stringify(data);
    const etag = generateETag(body);

    res.setHeader('ETag', etag);

    // Check If-None-Match header
    const ifNoneMatch = _req.headers['if-none-match'];
    if (ifNoneMatch === etag) {
      res.status(304);
      return res.end();
    }

    // Set cache control headers for private caching
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
    }

    return originalJson(data);
  };

  next();
};

// ============================================
// Response Time Tracking
// ============================================

/**
 * Threshold for logging slow requests (in milliseconds)
 */
const SLOW_REQUEST_THRESHOLD = 1000;

/**
 * Response time tracking middleware
 * Adds X-Response-Time header and logs slow requests
 */
export const responseTimeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = process.hrtime.bigint();

  // Store start time for potential use by other middleware
  res.locals.requestStartTime = start;

  // Add listener for when response finishes
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationNs = Number(end - start);
    const durationMs = durationNs / 1e6;

    // Set response time header (rounded to 2 decimal places)
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);

    // Log slow requests
    if (durationMs > SLOW_REQUEST_THRESHOLD) {
      logger.warn('Slow request detected', {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        durationMs: Math.round(durationMs),
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    }
  });

  next();
};

// ============================================
// Field Selection (Sparse Fieldsets)
// ============================================

/**
 * Allowed fields for each resource type
 * This prevents exposing internal/sensitive fields
 */
export const ALLOWED_FIELDS: Record<string, string[]> = {
  screenshot: [
    '_id',
    'id',
    'url',
    'options',
    'result',
    'metadata',
    'status',
    'createdAt',
    'updatedAt',
    'expiresAt',
  ],
  user: ['_id', 'id', 'email', 'name', 'company', 'subscription', 'usage', 'createdAt'],
  apiKey: [
    '_id',
    'id',
    'name',
    'permissions',
    'isActive',
    'lastUsedAt',
    'expiresAt',
    'usageCount',
    'createdAt',
  ],
  usage: ['_id', 'id', 'date', 'screenshots', 'bandwidth', 'responseTime', 'createdAt'],
};

/**
 * Parse fields query parameter into MongoDB projection
 * @param fieldsParam - Comma-separated field names
 * @param resourceType - Type of resource (screenshot, user, apiKey, usage)
 * @returns MongoDB projection object or undefined if no valid fields
 */
export function parseFieldSelection(
  fieldsParam: string | undefined,
  resourceType: keyof typeof ALLOWED_FIELDS
): Record<string, 1> | undefined {
  if (!fieldsParam || typeof fieldsParam !== 'string') {
    return undefined;
  }

  const allowedFields = ALLOWED_FIELDS[resourceType];
  if (!allowedFields) {
    return undefined;
  }

  const requestedFields = fieldsParam
    .split(',')
    .map((f) => f.trim())
    .filter((f) => f.length > 0);

  if (requestedFields.length === 0) {
    return undefined;
  }

  // Filter to only allowed fields
  const validFields = requestedFields.filter((f) => allowedFields.includes(f));

  if (validFields.length === 0) {
    return undefined;
  }

  // Build projection object
  const projection: Record<string, 1> = {};
  validFields.forEach((field) => {
    projection[field] = 1;
  });

  return projection;
}

/**
 * Apply field selection to a response object
 * @param data - Data object or array
 * @param fields - Comma-separated field names
 * @param resourceType - Type of resource
 * @returns Filtered data
 */
export function applyFieldSelection<T extends Record<string, unknown>>(
  data: T | T[],
  fields: string | undefined,
  resourceType: keyof typeof ALLOWED_FIELDS
): Partial<T> | Partial<T>[] {
  if (!fields) {
    return data;
  }

  const projection = parseFieldSelection(fields, resourceType);
  if (!projection) {
    return data;
  }

  const projectionKeys = Object.keys(projection);

  const filterObject = (obj: T): Partial<T> => {
    const result: Partial<T> = {};
    for (const key of projectionKeys) {
      if (key in obj) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (result as any)[key] = obj[key];
      }
    }
    return result;
  };

  if (Array.isArray(data)) {
    return data.map(filterObject);
  }

  return filterObject(data);
}

/**
 * Middleware to parse fields query parameter
 * Adds parsedFields to res.locals
 */
export const fieldSelectionMiddleware = (resourceType: keyof typeof ALLOWED_FIELDS) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const fields = req.query.fields as string | undefined;
    res.locals.fieldSelection = parseFieldSelection(fields, resourceType);
    res.locals.fieldsParam = fields;
    res.locals.resourceType = resourceType;
    next();
  };
};

// ============================================
// Exports
// ============================================

export default {
  etagMiddleware,
  responseTimeMiddleware,
  parseFieldSelection,
  applyFieldSelection,
  fieldSelectionMiddleware,
  ALLOWED_FIELDS,
};
