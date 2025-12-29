/**
 * Nonce Middleware
 * Generates a unique nonce for each request for CSP script/style validation
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import helmet from 'helmet';
import {
  getStrictHelmetOptions,
  getDocsHelmetOptions,
  additionalSecurityHeaders,
  apiSecurityHeaders,
} from '@config/security';

// ============================================
// Type Extensions
// ============================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Response {
      locals: {
        nonce?: string;
        csrfToken?: string;
        [key: string]: unknown;
      };
    }
  }
}

// ============================================
// Nonce Generation
// ============================================

/**
 * Generate a cryptographically secure nonce
 * Uses 16 bytes (128 bits) of randomness
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Get nonce from response locals
 * @param res - Express response object
 */
export function getNonce(res: Response): string {
  return res.locals.nonce || '';
}

// ============================================
// Middleware Functions
// ============================================

/**
 * Nonce middleware - generates unique nonce for each request
 * Must be used before Helmet CSP middleware
 */
export function nonceMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Generate unique nonce for this request
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  next();
}

/**
 * Strict CSP middleware for application routes
 * Uses nonce-based script/style loading
 */
export function strictCSPMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nonce = res.locals.nonce || generateNonce();
  if (!res.locals.nonce) {
    res.locals.nonce = nonce;
  }

  // Apply Helmet with strict CSP
  const helmetMiddleware = helmet(getStrictHelmetOptions(nonce));
  helmetMiddleware(req, res, () => {
    // Add additional security headers
    Object.entries(additionalSecurityHeaders).forEach(([header, value]) => {
      res.setHeader(header, value);
    });
    next();
  });
}

/**
 * Docs CSP middleware for documentation routes
 * Uses relaxed CSP for Swagger/ReDoc compatibility
 */
export function docsCSPMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Apply Helmet with docs CSP
  const helmetMiddleware = helmet(getDocsHelmetOptions());
  helmetMiddleware(req, res, next);
}

/**
 * API security headers middleware
 * Adds security headers for API responses
 */
export function apiSecurityMiddleware(_req: Request, res: Response, next: NextFunction): void {
  Object.entries(apiSecurityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
}

// ============================================
// Route Matchers
// ============================================

/**
 * Check if path is a documentation route
 */
export function isDocsRoute(path: string): boolean {
  const docsPaths = ['/docs', '/redoc', '/api-docs', '/developer'];
  return docsPaths.some((p) => path.startsWith(p));
}

/**
 * Check if path is an API route
 */
export function isApiRoute(path: string): boolean {
  return path.startsWith('/api/');
}

/**
 * Check if path is a static asset
 */
export function isStaticRoute(path: string): boolean {
  const staticExtensions = [
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.svg',
    '.ico',
    '.woff',
    '.woff2',
  ];
  return staticExtensions.some((ext) => path.endsWith(ext));
}

// ============================================
// Combined Middleware
// ============================================

/**
 * Route-aware security middleware
 * Applies appropriate CSP based on route type
 */
export function routeAwareSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const path = req.path;

  // Skip for health checks
  if (path === '/health') {
    return next();
  }

  // Use relaxed CSP for docs routes
  if (isDocsRoute(path)) {
    return docsCSPMiddleware(req, res, next);
  }

  // Use minimal headers for API routes (JSON responses)
  if (isApiRoute(path)) {
    return apiSecurityMiddleware(req, res, next);
  }

  // Use strict CSP for all other routes (HTML pages)
  return strictCSPMiddleware(req, res, next);
}

// ============================================
// Export
// ============================================

export default {
  generateNonce,
  getNonce,
  nonceMiddleware,
  strictCSPMiddleware,
  docsCSPMiddleware,
  apiSecurityMiddleware,
  routeAwareSecurityMiddleware,
  isDocsRoute,
  isApiRoute,
  isStaticRoute,
};
