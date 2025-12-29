/**
 * Cookie Sanitizer Utility
 * Validates and sanitizes cookies for screenshot requests
 */

/**
 * Cookie interface matching Puppeteer's cookie format
 */
export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  expires?: number;
}

/**
 * Result of cookie sanitization
 */
export interface CookieSanitizeResult {
  cookies: Cookie[];
  warnings: string[];
  blocked: string[];
}

/**
 * Options for cookie sanitization
 */
export interface CookieSanitizeOptions {
  maxCookies?: number;
  maxNameLength?: number;
  maxValueLength?: number;
  maxDomainLength?: number;
  maxPathLength?: number;
}

/**
 * RFC 6265 compliant cookie name validation
 * Cookie names can't contain these characters:
 * CTLs, separators: ()<>@,;:\"/[]?={} SPACE TAB
 */
function isValidCookieName(name: string): boolean {
  if (!name || name.length === 0) {
    return false;
  }
  // Control chars (0x00-0x1F, 0x7F) and separators
  const invalidChars = /[\x00-\x1f\x7f()<>@,;:\\"\/\[\]?={} \t]/;
  return !invalidChars.test(name);
}

/**
 * Cookie value validation
 * Cookie values can't contain CTLs, semicolons, or backslashes (unless quoted)
 */
function isValidCookieValue(value: string): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  // Control chars and problematic characters
  const invalidChars = /[\x00-\x1f\x7f;\\]/;
  return !invalidChars.test(value);
}

/**
 * Validate cookie domain against target URL
 * Cookie domain must be a suffix of the target domain
 */
function isValidDomain(domain: string, targetUrl: string): boolean {
  try {
    const targetHost = new URL(targetUrl).hostname.toLowerCase();
    let cookieDomain = domain.toLowerCase();

    // Remove leading dot if present
    if (cookieDomain.startsWith('.')) {
      cookieDomain = cookieDomain.slice(1);
    }

    // Exact match
    if (targetHost === cookieDomain) {
      return true;
    }

    // Domain is a suffix (subdomain match)
    if (targetHost.endsWith('.' + cookieDomain)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Validate cookie path
 */
function isValidPath(path: string): boolean {
  if (!path) {
    return true; // Empty path is valid (defaults to /)
  }

  // Path must start with /
  if (!path.startsWith('/')) {
    return false;
  }

  // Check for null bytes or control characters
  if (/[\x00-\x1f\x7f]/.test(path)) {
    return false;
  }

  return true;
}

/**
 * Validate expires timestamp
 */
function isValidExpires(expires: number | undefined): boolean {
  if (expires === undefined) {
    return true;
  }

  // Must be a positive number
  if (typeof expires !== 'number' || expires < 0) {
    return false;
  }

  // Must be a reasonable timestamp (not too far in the past or future)
  const now = Date.now() / 1000;
  const tenYearsFromNow = now + 10 * 365 * 24 * 60 * 60;

  // Allow past dates (for session cookies) and up to 10 years in future
  return expires <= tenYearsFromNow;
}

/**
 * Sanitize cookies for screenshot requests
 * @param cookies - Cookies to sanitize
 * @param targetUrl - Target URL for domain validation
 * @param options - Sanitization options
 * @returns Sanitized cookies with warnings and blocked list
 */
export function sanitizeCookies(
  cookies: Cookie[],
  targetUrl: string,
  options: CookieSanitizeOptions = {}
): CookieSanitizeResult {
  const {
    maxCookies = 50,
    maxNameLength = 256,
    maxValueLength = 4096,
    maxDomainLength = 253,
    maxPathLength = 1024,
  } = options;

  const result: CookieSanitizeResult = {
    cookies: [],
    warnings: [],
    blocked: [],
  };

  if (!Array.isArray(cookies)) {
    return result;
  }

  // Check target URL validity
  let parsedTargetUrl: URL | null = null;
  try {
    parsedTargetUrl = new URL(targetUrl);
  } catch {
    result.warnings.push('Invalid target URL, skipping domain validation');
  }

  if (cookies.length > maxCookies) {
    result.warnings.push(`Too many cookies (max ${maxCookies}), excess cookies ignored`);
  }

  for (const cookie of cookies.slice(0, maxCookies)) {
    // Validate name
    if (!cookie.name || typeof cookie.name !== 'string') {
      result.blocked.push(cookie.name || '(unnamed)');
      result.warnings.push('Cookie without valid name blocked');
      continue;
    }

    if (cookie.name.length > maxNameLength) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Cookie name too long: ${cookie.name.substring(0, 50)}...`);
      continue;
    }

    if (!isValidCookieName(cookie.name)) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Invalid cookie name: ${cookie.name}`);
      continue;
    }

    // Validate value
    if (cookie.value === undefined || cookie.value === null || typeof cookie.value !== 'string') {
      result.blocked.push(cookie.name);
      result.warnings.push(`Invalid cookie value for: ${cookie.name}`);
      continue;
    }

    if (cookie.value.length > maxValueLength) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Cookie value too long: ${cookie.name}`);
      continue;
    }

    if (!isValidCookieValue(cookie.value)) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Invalid cookie value characters for: ${cookie.name}`);
      continue;
    }

    // Validate domain if specified
    if (cookie.domain) {
      if (typeof cookie.domain !== 'string') {
        result.blocked.push(cookie.name);
        result.warnings.push(`Invalid cookie domain type for: ${cookie.name}`);
        continue;
      }

      if (cookie.domain.length > maxDomainLength) {
        result.blocked.push(cookie.name);
        result.warnings.push(`Cookie domain too long: ${cookie.name}`);
        continue;
      }

      if (parsedTargetUrl !== null && !isValidDomain(cookie.domain, targetUrl)) {
        result.blocked.push(cookie.name);
        result.warnings.push(`Cookie domain mismatch: ${cookie.name} (domain: ${cookie.domain})`);
        continue;
      }
    }

    // Validate path if specified
    if (cookie.path) {
      if (typeof cookie.path !== 'string') {
        result.blocked.push(cookie.name);
        result.warnings.push(`Invalid cookie path type for: ${cookie.name}`);
        continue;
      }

      if (cookie.path.length > maxPathLength) {
        result.blocked.push(cookie.name);
        result.warnings.push(`Cookie path too long: ${cookie.name}`);
        continue;
      }

      if (!isValidPath(cookie.path)) {
        result.blocked.push(cookie.name);
        result.warnings.push(`Invalid cookie path for: ${cookie.name}`);
        continue;
      }
    }

    // Validate expires
    if (!isValidExpires(cookie.expires)) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Invalid cookie expires for: ${cookie.name}`);
      continue;
    }

    // Validate sameSite
    if (cookie.sameSite && !['Strict', 'Lax', 'None'].includes(cookie.sameSite)) {
      result.blocked.push(cookie.name);
      result.warnings.push(`Invalid cookie sameSite for: ${cookie.name}`);
      continue;
    }

    // Build sanitized cookie
    const sanitizedCookie: Cookie = {
      name: cookie.name,
      value: cookie.value,
      path: cookie.path || '/',
    };

    // Add optional fields if valid
    if (cookie.domain) {
      sanitizedCookie.domain = cookie.domain;
    }
    if (typeof cookie.secure === 'boolean') {
      sanitizedCookie.secure = cookie.secure;
    }
    if (typeof cookie.httpOnly === 'boolean') {
      sanitizedCookie.httpOnly = cookie.httpOnly;
    }
    if (cookie.sameSite) {
      sanitizedCookie.sameSite = cookie.sameSite;
    }
    if (cookie.expires !== undefined) {
      sanitizedCookie.expires = cookie.expires;
    }

    result.cookies.push(sanitizedCookie);
  }

  return result;
}
