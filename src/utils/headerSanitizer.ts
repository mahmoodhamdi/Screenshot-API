/**
 * Header Sanitizer Utility
 * Sanitizes custom headers for screenshot requests
 */

/**
 * Headers that should never be overwritten (security/protocol headers)
 */
const FORBIDDEN_HEADERS = new Set([
  'host',
  'content-length',
  'transfer-encoding',
  'connection',
  'keep-alive',
  'upgrade',
  'upgrade-insecure-requests',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'expect',
  'content-encoding',
  'accept-encoding',
  'sec-websocket-key',
  'sec-websocket-version',
  'sec-websocket-accept',
  'sec-websocket-extensions',
  'sec-websocket-protocol',
]);

/**
 * Headers that could be dangerous if spoofed
 */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
  'x-real-ip',
  'x-original-url',
  'x-rewrite-url',
  'forwarded',
  'via',
]);

/**
 * Result of header sanitization
 */
export interface HeaderSanitizeResult {
  headers: Record<string, string>;
  warnings: string[];
  blocked: string[];
}

/**
 * Options for header sanitization
 */
export interface HeaderSanitizeOptions {
  allowSensitive?: boolean;
  maxHeaders?: number;
  maxHeaderNameLength?: number;
  maxHeaderValueLength?: number;
}

/**
 * Validate header name according to RFC 7230
 * Header names must be tokens: 1*tchar
 * tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "." /
 *         "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA
 */
function isValidHeaderName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }
  // Simplified: allow alphanumeric, hyphen, underscore
  return /^[a-zA-Z0-9\-_]+$/.test(name);
}

/**
 * Check for CRLF injection in header value
 */
function hasCrlfInjection(value: string): boolean {
  return /[\r\n]/.test(value);
}

/**
 * Check for null bytes in header value
 */
function hasNullBytes(value: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /\x00/.test(value);
}

/**
 * Sanitize custom headers for screenshot requests
 * @param headers - Headers to sanitize
 * @param options - Sanitization options
 * @returns Sanitized headers with warnings and blocked list
 */
export function sanitizeHeaders(
  headers: Record<string, string>,
  options: HeaderSanitizeOptions = {}
): HeaderSanitizeResult {
  const {
    allowSensitive = false,
    maxHeaders = 20,
    maxHeaderNameLength = 256,
    maxHeaderValueLength = 8192,
  } = options;

  const result: HeaderSanitizeResult = {
    headers: {},
    warnings: [],
    blocked: [],
  };

  if (!headers || typeof headers !== 'object') {
    return result;
  }

  const entries = Object.entries(headers);

  // Limit number of headers
  if (entries.length > maxHeaders) {
    result.warnings.push(`Too many headers (max ${maxHeaders}), excess headers ignored`);
  }

  for (const [key, value] of entries.slice(0, maxHeaders)) {
    const lowerKey = key.toLowerCase();

    // Check header name length
    if (key.length > maxHeaderNameLength) {
      result.blocked.push(key);
      result.warnings.push(`Header name too long: ${key.substring(0, 50)}...`);
      continue;
    }

    // Block forbidden headers
    if (FORBIDDEN_HEADERS.has(lowerKey)) {
      result.blocked.push(key);
      continue;
    }

    // Block or warn about sensitive headers
    if (SENSITIVE_HEADERS.has(lowerKey)) {
      if (!allowSensitive) {
        result.blocked.push(key);
        result.warnings.push(`Sensitive header blocked: ${key}`);
        continue;
      } else {
        result.warnings.push(`Sensitive header allowed: ${key}`);
      }
    }

    // Validate header name (RFC 7230)
    if (!isValidHeaderName(key)) {
      result.blocked.push(key);
      result.warnings.push(`Invalid header name: ${key}`);
      continue;
    }

    // Validate header value type
    if (typeof value !== 'string') {
      result.blocked.push(key);
      result.warnings.push(`Header value must be string: ${key}`);
      continue;
    }

    // Check for CRLF injection
    if (hasCrlfInjection(value)) {
      result.blocked.push(key);
      result.warnings.push(`Header value contains invalid characters (CRLF): ${key}`);
      continue;
    }

    // Check for null bytes
    if (hasNullBytes(value)) {
      result.blocked.push(key);
      result.warnings.push(`Header value contains null bytes: ${key}`);
      continue;
    }

    // Truncate long values
    let sanitizedValue = value;
    if (value.length > maxHeaderValueLength) {
      sanitizedValue = value.substring(0, maxHeaderValueLength);
      result.warnings.push(`Header value truncated: ${key}`);
    }

    // Trim whitespace
    sanitizedValue = sanitizedValue.trim();

    // Skip empty values
    if (sanitizedValue.length === 0) {
      result.warnings.push(`Empty header value skipped: ${key}`);
      continue;
    }

    result.headers[key] = sanitizedValue;
  }

  return result;
}

/**
 * Check if a header name is forbidden
 */
export function isForbiddenHeader(name: string): boolean {
  return FORBIDDEN_HEADERS.has(name.toLowerCase());
}

/**
 * Check if a header name is sensitive
 */
export function isSensitiveHeader(name: string): boolean {
  return SENSITIVE_HEADERS.has(name.toLowerCase());
}
