/**
 * Security Configuration
 * CSP configurations and security header settings
 */

import { HelmetOptions } from 'helmet';

// ============================================
// CSP Configurations
// ============================================

/**
 * Strict CSP for application routes (landing, auth, dashboard)
 * Uses nonce-based script/style loading for security
 */
export const strictCSPDirectives = {
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", 'https://fonts.googleapis.com'],
  // scriptSrc will be set dynamically with nonce
  scriptSrc: ["'self'"],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
};

/**
 * Relaxed CSP for documentation routes (Swagger UI, ReDoc, Developer Portal)
 * These tools require inline scripts/styles and eval
 */
export const docsCSPDirectives = {
  defaultSrc: ["'self'"],
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://unpkg.com',
  ],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://cdnjs.cloudflare.com',
    'https://unpkg.com',
  ],
  scriptSrcAttr: ["'unsafe-inline'"],
  fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
  imgSrc: [
    "'self'",
    'data:',
    'blob:',
    'https://validator.swagger.io',
    'https://cdnjs.cloudflare.com',
  ],
  connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  workerSrc: ["'self'", 'blob:'],
};

/**
 * Get strict Helmet options with nonce support
 * @param nonce - The nonce value for this request
 */
export function getStrictHelmetOptions(nonce: string): HelmetOptions {
  return {
    contentSecurityPolicy: {
      directives: {
        ...strictCSPDirectives,
        scriptSrc: ["'self'", `'nonce-${nonce}'`],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', `'nonce-${nonce}'`],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xDownloadOptions: true,
    xFrameOptions: { action: 'deny' },
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    xPoweredBy: false,
    xXssProtection: true,
  };
}

/**
 * Get docs Helmet options (relaxed for Swagger/ReDoc)
 */
export function getDocsHelmetOptions(): HelmetOptions {
  return {
    contentSecurityPolicy: {
      directives: docsCSPDirectives,
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'sameorigin' },
    xPoweredBy: false,
    xXssProtection: true,
  };
}

// ============================================
// Additional Security Headers
// ============================================

/**
 * Additional security headers not covered by Helmet
 */
export const additionalSecurityHeaders = {
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
  // Cache control for security-sensitive pages
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * Security headers for API responses (less restrictive caching)
 */
export const apiSecurityHeaders = {
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
};

// ============================================
// Export
// ============================================

export default {
  strictCSPDirectives,
  docsCSPDirectives,
  getStrictHelmetOptions,
  getDocsHelmetOptions,
  additionalSecurityHeaders,
  apiSecurityHeaders,
};
