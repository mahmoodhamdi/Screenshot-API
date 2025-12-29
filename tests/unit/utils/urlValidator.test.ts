/**
 * URL Validator Tests
 */

import {
  validateScreenshotUrl,
  isAllowedUrl,
  isBlockedScheme,
  isBlockedExtension,
} from '@utils/urlValidator';

describe('URL Validator', () => {
  describe('validateScreenshotUrl', () => {
    describe('Valid URLs', () => {
      it('should accept valid HTTPS URLs', () => {
        const validUrls = [
          'https://example.com',
          'https://www.example.com',
          'https://subdomain.example.com/path',
          'https://example.com/path?query=value',
          'https://example.com:8443/path',
        ];

        for (const url of validUrls) {
          const result = validateScreenshotUrl(url);
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      });

      it('should accept valid HTTP URLs with warning', () => {
        const result = validateScreenshotUrl('http://example.com');
        expect(result.valid).toBe(true);
        expect(result.warnings).toContain('HTTP URLs may not work correctly on sites with HTTPS redirects');
      });

      it('should normalize URLs', () => {
        const result = validateScreenshotUrl('https://example.com/path');
        expect(result.url).toBe('https://example.com/path');
      });
    });

    describe('Blocked URL schemes', () => {
      it('should reject javascript: URLs', () => {
        const result = validateScreenshotUrl('javascript:alert(1)');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'javascript' is not allowed");
      });

      it('should reject data: URLs', () => {
        const result = validateScreenshotUrl('data:text/html,<script>alert(1)</script>');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'data' is not allowed");
      });

      it('should reject file: URLs', () => {
        const result = validateScreenshotUrl('file:///etc/passwd');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'file' is not allowed");
      });

      it('should reject blob: URLs', () => {
        const result = validateScreenshotUrl('blob:https://example.com/uuid');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'blob' is not allowed");
      });

      it('should reject ftp: URLs', () => {
        const result = validateScreenshotUrl('ftp://example.com/file');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'ftp' is not allowed");
      });

      it('should reject chrome: URLs', () => {
        const result = validateScreenshotUrl('chrome://settings');
        expect(result.valid).toBe(false);
        expect(result.error).toContain("scheme 'chrome' is not allowed");
      });

      it('should reject unsupported schemes', () => {
        const result = validateScreenshotUrl('gopher://example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('not supported');
      });
    });

    describe('Blocked file extensions', () => {
      it('should reject executable files', () => {
        const result = validateScreenshotUrl('https://example.com/file.exe');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('blocked file type: .exe');
      });

      it('should reject script files', () => {
        const extensions = ['.bat', '.cmd', '.sh', '.ps1'];

        for (const ext of extensions) {
          const result = validateScreenshotUrl(`https://example.com/script${ext}`);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('blocked file type');
        }
      });

      it('should reject library files', () => {
        const result = validateScreenshotUrl('https://example.com/lib.dll');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('blocked file type: .dll');
      });

      it('should be case-insensitive for extensions', () => {
        const result = validateScreenshotUrl('https://example.com/file.EXE');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('blocked file type');
      });

      it('should allow normal web files', () => {
        const validExtensions = ['.html', '.htm', '.php', '.asp', '.aspx', ''];

        for (const ext of validExtensions) {
          const result = validateScreenshotUrl(`https://example.com/page${ext}`);
          expect(result.valid).toBe(true);
        }
      });
    });

    describe('Internal IP addresses', () => {
      it('should reject localhost', () => {
        const result = validateScreenshotUrl('https://localhost/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs are not allowed');
      });

      it('should reject 127.0.0.1', () => {
        const result = validateScreenshotUrl('https://127.0.0.1/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject 0.0.0.0', () => {
        const result = validateScreenshotUrl('https://0.0.0.0/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject 10.x.x.x addresses', () => {
        const addresses = ['10.0.0.1', '10.255.255.255', '10.1.2.3'];

        for (const addr of addresses) {
          const result = validateScreenshotUrl(`https://${addr}/`);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Internal/private URLs');
        }
      });

      it('should reject 172.16-31.x.x addresses', () => {
        const addresses = ['172.16.0.1', '172.31.255.255', '172.20.1.1'];

        for (const addr of addresses) {
          const result = validateScreenshotUrl(`https://${addr}/`);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Internal/private URLs');
        }
      });

      it('should allow 172.15.x.x addresses', () => {
        const result = validateScreenshotUrl('https://172.15.0.1/');
        expect(result.valid).toBe(true);
      });

      it('should reject 192.168.x.x addresses', () => {
        const addresses = ['192.168.0.1', '192.168.1.1', '192.168.255.255'];

        for (const addr of addresses) {
          const result = validateScreenshotUrl(`https://${addr}/`);
          expect(result.valid).toBe(false);
          expect(result.error).toContain('Internal/private URLs');
        }
      });

      it('should reject link-local addresses', () => {
        const result = validateScreenshotUrl('https://169.254.1.1/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject IPv6 loopback', () => {
        const result = validateScreenshotUrl('https://[::1]/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject .local domains', () => {
        const result = validateScreenshotUrl('https://myserver.local/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject .internal domains', () => {
        const result = validateScreenshotUrl('https://service.internal/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });

      it('should reject cloud metadata URLs', () => {
        const result = validateScreenshotUrl('http://169.254.169.254/latest/meta-data/');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Internal/private URLs');
      });
    });

    describe('URL length', () => {
      it('should reject URLs longer than 2048 characters', () => {
        const longUrl = 'https://example.com/' + 'x'.repeat(2050);
        const result = validateScreenshotUrl(longUrl);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('too long');
      });

      it('should warn about very long URLs', () => {
        const longUrl = 'https://example.com/' + 'x'.repeat(1100);
        const result = validateScreenshotUrl(longUrl);
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.includes('long URL'))).toBe(true);
      });
    });

    describe('Suspicious ports', () => {
      it('should warn about SSH port', () => {
        const result = validateScreenshotUrl('https://example.com:22/');
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.includes('Port 22'))).toBe(true);
      });

      it('should warn about database ports', () => {
        const ports = [3306, 5432, 27017, 6379];

        for (const port of ports) {
          const result = validateScreenshotUrl(`https://example.com:${port}/`);
          expect(result.valid).toBe(true);
          expect(result.warnings.some(w => w.includes(`Port ${port}`))).toBe(true);
        }
      });

      it('should not warn about standard ports', () => {
        const result80 = validateScreenshotUrl('http://example.com:80/');
        const result443 = validateScreenshotUrl('https://example.com:443/');

        expect(result80.warnings.length).toBe(1); // HTTP warning only
        expect(result443.warnings.length).toBe(0);
      });
    });

    describe('URL with credentials', () => {
      it('should warn about URLs with credentials', () => {
        const result = validateScreenshotUrl('https://user:pass@example.com/');
        expect(result.valid).toBe(true);
        expect(result.warnings.some(w => w.includes('credentials'))).toBe(true);
      });
    });

    describe('Invalid URLs', () => {
      it('should reject malformed URLs', () => {
        const invalidUrls = [
          'not-a-url',
          'http://',
          '://example.com',
          'example.com', // Missing scheme
        ];

        for (const url of invalidUrls) {
          const result = validateScreenshotUrl(url);
          expect(result.valid).toBe(false);
        }
      });

      it('should reject empty URLs', () => {
        const result = validateScreenshotUrl('');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('required');
      });

      it('should reject null/undefined URLs', () => {
        const result1 = validateScreenshotUrl(null as unknown as string);
        const result2 = validateScreenshotUrl(undefined as unknown as string);

        expect(result1.valid).toBe(false);
        expect(result2.valid).toBe(false);
      });

      it('should reject URLs with invalid hostname characters', () => {
        const result = validateScreenshotUrl('https://exam<ple>.com/');
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('isAllowedUrl', () => {
    it('should return true for allowed URLs', () => {
      expect(isAllowedUrl('https://example.com')).toBe(true);
      expect(isAllowedUrl('http://example.com')).toBe(true);
    });

    it('should return false for blocked URLs', () => {
      expect(isAllowedUrl('javascript:alert(1)')).toBe(false);
      expect(isAllowedUrl('https://localhost/')).toBe(false);
      expect(isAllowedUrl('https://example.com/file.exe')).toBe(false);
    });
  });

  describe('isBlockedScheme', () => {
    it('should identify blocked schemes', () => {
      expect(isBlockedScheme('javascript')).toBe(true);
      expect(isBlockedScheme('javascript:')).toBe(true);
      expect(isBlockedScheme('data')).toBe(true);
      expect(isBlockedScheme('file')).toBe(true);
      expect(isBlockedScheme('blob')).toBe(true);
    });

    it('should return false for allowed schemes', () => {
      expect(isBlockedScheme('http')).toBe(false);
      expect(isBlockedScheme('https')).toBe(false);
      expect(isBlockedScheme('HTTP')).toBe(false);
    });
  });

  describe('isBlockedExtension', () => {
    it('should identify blocked extensions', () => {
      expect(isBlockedExtension('.exe')).toBe(true);
      expect(isBlockedExtension('exe')).toBe(true);
      expect(isBlockedExtension('.EXE')).toBe(true);
      expect(isBlockedExtension('.dll')).toBe(true);
      expect(isBlockedExtension('.bat')).toBe(true);
    });

    it('should return false for allowed extensions', () => {
      expect(isBlockedExtension('.html')).toBe(false);
      expect(isBlockedExtension('.pdf')).toBe(false);
      expect(isBlockedExtension('.png')).toBe(false);
    });
  });
});
