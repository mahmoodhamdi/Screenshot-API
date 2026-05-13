/**
 * URL Validator Utility
 * Enhanced URL validation for screenshot requests
 */

/**
 * URL validation result
 */
export interface UrlValidationResult {
  valid: boolean;
  url?: string;
  error?: string;
  warnings: string[];
}

/**
 * Blocked URL schemes (security risk)
 */
const BLOCKED_SCHEMES = new Set([
  'javascript',
  'data',
  'file',
  'vbscript',
  'about',
  'blob',
  'chrome',
  'chrome-extension',
  'moz-extension',
  'ms-browser-extension',
  'resource',
  'view-source',
  'ws',
  'wss',
  'ftp',
  'sftp',
  'ssh',
  'telnet',
  'ldap',
  'ldaps',
  'mailto',
  'tel',
  'sms',
  'geo',
  'magnet',
]);

/**
 * Blocked file extensions (security risk)
 */
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.dll',
  '.so',
  '.dylib',
  '.msi',
  '.app',
  '.dmg',
  '.pkg',
  '.deb',
  '.rpm',
  '.jar',
  '.class',
  '.com',
  '.scr',
  '.pif',
  '.vbs',
  '.vbe',
  '.js', // JavaScript files (not web pages)
  '.jse',
  '.wsf',
  '.wsh',
  '.msc',
  '.cpl',
  '.inf',
  '.reg',
]);

/**
 * Suspicious ports that may indicate non-web services
 */
const SUSPICIOUS_PORTS = new Set([
  21, // FTP
  22, // SSH
  23, // Telnet
  25, // SMTP
  53, // DNS
  110, // POP3
  143, // IMAP
  445, // SMB
  993, // IMAPS
  995, // POP3S
  1433, // MSSQL
  1521, // Oracle
  3306, // MySQL
  3389, // RDP
  5432, // PostgreSQL
  5900, // VNC
  6379, // Redis
  27017, // MongoDB
]);

/**
 * Internal/private IP patterns
 */
const INTERNAL_PATTERNS: (string | RegExp)[] = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  // Private IPv4 ranges
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/,
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
  // Link-local
  /^169\.254\.\d{1,3}\.\d{1,3}$/,
  // IPv6 private ranges
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,
  // IPv6 loopback
  /^\[?::1\]?$/,
  // Metadata services (cloud)
  '169.254.169.254', // AWS/GCP/Azure metadata
  'metadata.google.internal',
  'metadata.goog',
];

/**
 * Check if hostname matches internal patterns
 */
function isInternalHost(hostname: string): boolean {
  const lowerHostname = hostname.toLowerCase();

  for (const pattern of INTERNAL_PATTERNS) {
    if (typeof pattern === 'string') {
      if (lowerHostname === pattern) {
        return true;
      }
    } else if (pattern.test(hostname)) {
      return true;
    }
  }

  // Check for .local TLD (mDNS)
  if (lowerHostname.endsWith('.local')) {
    return true;
  }

  // Check for .internal TLD
  if (lowerHostname.endsWith('.internal')) {
    return true;
  }

  return false;
}

/**
 * Validate screenshot URL
 * @param url - URL to validate
 * @returns Validation result with potential warnings
 */
export function validateScreenshotUrl(url: string): UrlValidationResult {
  const warnings: string[] = [];

  // Check for empty URL
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL is required',
      warnings,
    };
  }

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check for excessively long URL
  if (trimmedUrl.length > 2048) {
    return {
      valid: false,
      error: 'URL is too long (max 2048 characters)',
      warnings,
    };
  }

  // Check for very long URL (but still valid)
  if (trimmedUrl.length > 1024) {
    warnings.push('Very long URL may cause issues with some browsers');
  }

  try {
    const parsed = new URL(trimmedUrl);

    // Get scheme without colon
    const scheme = parsed.protocol.replace(':', '').toLowerCase();

    // Check blocked schemes
    if (BLOCKED_SCHEMES.has(scheme)) {
      return {
        valid: false,
        error: `URL scheme '${scheme}' is not allowed`,
        warnings,
      };
    }

    // Only allow http and https
    if (!['http', 'https'].includes(scheme)) {
      return {
        valid: false,
        error: `URL scheme '${scheme}' is not supported. Use http or https.`,
        warnings,
      };
    }

    // Warn about HTTP (prefer HTTPS)
    if (scheme === 'http') {
      warnings.push('HTTP URLs may not work correctly on sites with HTTPS redirects');
    }

    // Check for blocked file extensions in pathname
    const pathname = parsed.pathname.toLowerCase();
    for (const ext of BLOCKED_EXTENSIONS) {
      if (pathname.endsWith(ext)) {
        return {
          valid: false,
          error: `URL points to a blocked file type: ${ext}`,
          warnings,
        };
      }
    }

    // Check hostname for internal addresses
    const hostname = parsed.hostname.toLowerCase();

    if (isInternalHost(hostname)) {
      return {
        valid: false,
        error: 'Internal/private URLs are not allowed',
        warnings,
      };
    }

    // Check for empty hostname
    if (!hostname) {
      return {
        valid: false,
        error: 'URL must have a hostname',
        warnings,
      };
    }

    // Check for suspicious ports
    if (parsed.port) {
      const port = parseInt(parsed.port, 10);

      if (SUSPICIOUS_PORTS.has(port)) {
        warnings.push(`Port ${port} typically indicates a non-web service`);
      }

      // Check for very low or very high ports
      if (port < 1 || port > 65535) {
        return {
          valid: false,
          error: 'Invalid port number',
          warnings,
        };
      }
    }

    // Check for username/password in URL (security concern)
    if (parsed.username || parsed.password) {
      warnings.push('URL contains credentials which may be logged');
    }

    // Check for unusual characters in hostname
    if (/[<>{}|\\^`]/.test(hostname)) {
      return {
        valid: false,
        error: 'URL hostname contains invalid characters',
        warnings,
      };
    }

    // Return valid result with normalized URL
    return {
      valid: true,
      url: parsed.toString(),
      warnings,
    };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
      warnings,
    };
  }
}

/**
 * Check if URL is allowed for screenshots
 * Simple boolean check for use in validation schemas
 */
export function isAllowedUrl(url: string): boolean {
  return validateScreenshotUrl(url).valid;
}

/**
 * Check if URL scheme is blocked
 */
export function isBlockedScheme(scheme: string): boolean {
  return BLOCKED_SCHEMES.has(scheme.toLowerCase().replace(':', ''));
}

/**
 * Check if file extension is blocked
 */
export function isBlockedExtension(ext: string): boolean {
  const normalizedExt = ext.toLowerCase().startsWith('.')
    ? ext.toLowerCase()
    : `.${ext.toLowerCase()}`;
  return BLOCKED_EXTENSIONS.has(normalizedExt);
}
