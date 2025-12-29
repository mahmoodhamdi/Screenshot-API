/**
 * Security Headers Integration Tests
 * Tests CSP, nonce, and security headers for different route types
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

describe('Security Headers', () => {
  describe('Content Security Policy', () => {
    describe('App Routes (Strict CSP)', () => {
      it('should include CSP header for landing page', async () => {
        const response = await request(app).get('/');

        expect(response.headers['content-security-policy']).toBeDefined();
      });

      it('should include nonce in script-src for landing page', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];

        expect(csp).toContain("'nonce-");
      });

      it('should include nonce in style-src for landing page', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];

        // Style-src should have nonce for inline styles
        expect(csp).toMatch(/style-src[^;]*'nonce-/);
      });

      it('should include nonce attribute in HTML style tag', async () => {
        const response = await request(app).get('/');
        const html = response.text;

        // HTML should have style tag with nonce
        expect(html).toMatch(/<style nonce="[A-Za-z0-9+/=]+"/);
      });

      it('should include nonce attribute in HTML script tag', async () => {
        const response = await request(app).get('/');
        const html = response.text;

        // HTML should have script tag with nonce
        expect(html).toMatch(/<script nonce="[A-Za-z0-9+/=]+"/);
      });

      it('should have matching nonce in CSP and HTML', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];
        const html = response.text;

        // Extract nonce from CSP
        const cspNonceMatch = csp.match(/'nonce-([A-Za-z0-9+/=]+)'/);
        expect(cspNonceMatch).toBeTruthy();
        const cspNonce = cspNonceMatch![1];

        // Check that HTML contains the same nonce
        expect(html).toContain(`nonce="${cspNonce}"`);
      });

      it('should not include unsafe-inline in script-src', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];

        // Extract script-src directive
        const scriptSrcMatch = csp.match(/script-src[^;]+/);
        if (scriptSrcMatch) {
          expect(scriptSrcMatch[0]).not.toContain("'unsafe-inline'");
          expect(scriptSrcMatch[0]).not.toContain("'unsafe-eval'");
        }
      });

      it('should have restrictive frame-ancestors', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];

        expect(csp).toContain("frame-ancestors 'none'");
      });

      it('should have restrictive object-src', async () => {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];

        expect(csp).toContain("object-src 'none'");
      });
    });

    describe('Auth Pages (Strict CSP)', () => {
      const authPages = ['login', 'register', 'forgot-password'];

      authPages.forEach((page) => {
        it(`should include CSP header for /${page}`, async () => {
          const response = await request(app).get(`/${page}`);

          expect(response.headers['content-security-policy']).toBeDefined();
        });

        it(`should include nonce in HTML for /${page}`, async () => {
          const response = await request(app).get(`/${page}`);
          const html = response.text;

          expect(html).toMatch(/<style nonce="[A-Za-z0-9+/=]+"/);
          expect(html).toMatch(/<script nonce="[A-Za-z0-9+/=]+"/);
        });
      });
    });

    describe('Dashboard Pages (Strict CSP)', () => {
      const dashboardPages = [
        '/dashboard',
        '/dashboard/screenshots',
        '/dashboard/api-keys',
        '/dashboard/usage',
        '/dashboard/settings',
        '/dashboard/billing',
      ];

      dashboardPages.forEach((page) => {
        it(`should include CSP header for ${page}`, async () => {
          const response = await request(app).get(page);

          expect(response.headers['content-security-policy']).toBeDefined();
        });

        it(`should include nonce in HTML for ${page}`, async () => {
          const response = await request(app).get(page);
          const html = response.text;

          expect(html).toMatch(/<style nonce="[A-Za-z0-9+/=]+"/);
          expect(html).toMatch(/<script nonce="[A-Za-z0-9+/=]+"/);
        });
      });
    });

    describe('Docs Routes (Relaxed CSP)', () => {
      it('should have CSP header for /docs/', async () => {
        const response = await request(app).get('/docs/');

        expect(response.headers['content-security-policy']).toBeDefined();
      });

      it('should allow unsafe-inline for docs routes', async () => {
        const response = await request(app).get('/docs/');
        const csp = response.headers['content-security-policy'];

        // Docs routes need unsafe-inline and unsafe-eval for Swagger UI
        if (csp) {
          expect(csp).toContain("'unsafe-inline'");
        }
      });

      it('should have CSP header for /redoc', async () => {
        const response = await request(app).get('/redoc');

        expect(response.headers['content-security-policy']).toBeDefined();
      });

      it('should have CSP header for /api-docs', async () => {
        const response = await request(app).get('/api-docs');

        expect(response.headers['content-security-policy']).toBeDefined();
      });

      it('should have CSP header for /developer', async () => {
        const response = await request(app).get('/developer');

        expect(response.headers['content-security-policy']).toBeDefined();
      });
    });

    describe('API Routes (Minimal Headers)', () => {
      it('should have Permissions-Policy for API routes', async () => {
        const response = await request(app).get('/api/v1');

        expect(response.headers['permissions-policy']).toBeDefined();
      });

      it('should disable camera in Permissions-Policy', async () => {
        const response = await request(app).get('/api/v1');
        const policy = response.headers['permissions-policy'];

        expect(policy).toContain('camera=()');
      });

      it('should disable microphone in Permissions-Policy', async () => {
        const response = await request(app).get('/api/v1');
        const policy = response.headers['permissions-policy'];

        expect(policy).toContain('microphone=()');
      });

      it('should disable geolocation in Permissions-Policy', async () => {
        const response = await request(app).get('/api/v1');
        const policy = response.headers['permissions-policy'];

        expect(policy).toContain('geolocation=()');
      });
    });

    describe('Health Check (No Security)', () => {
      it('should not have CSP header for /health', async () => {
        const response = await request(app).get('/health');

        // Health check should have minimal overhead - no CSP
        expect(response.headers['content-security-policy']).toBeUndefined();
      });

      it('should return healthy status', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });
  });

  describe('Other Security Headers', () => {
    describe('X-Frame-Options', () => {
      it('should have X-Frame-Options for app routes', async () => {
        const response = await request(app).get('/');

        expect(response.headers['x-frame-options']).toBeDefined();
      });

      it('should deny framing for landing page', async () => {
        const response = await request(app).get('/');

        expect(response.headers['x-frame-options']).toBe('DENY');
      });
    });

    describe('X-Content-Type-Options', () => {
      it('should have X-Content-Type-Options', async () => {
        const response = await request(app).get('/');

        expect(response.headers['x-content-type-options']).toBe('nosniff');
      });
    });

    describe('Referrer-Policy', () => {
      it('should have Referrer-Policy', async () => {
        const response = await request(app).get('/');

        expect(response.headers['referrer-policy']).toBeDefined();
      });
    });

    describe('HSTS', () => {
      it('should have Strict-Transport-Security', async () => {
        const response = await request(app).get('/');

        expect(response.headers['strict-transport-security']).toBeDefined();
      });

      it('should include max-age in HSTS', async () => {
        const response = await request(app).get('/');
        const hsts = response.headers['strict-transport-security'];

        expect(hsts).toContain('max-age=');
      });

      it('should include includeSubDomains in HSTS', async () => {
        const response = await request(app).get('/');
        const hsts = response.headers['strict-transport-security'];

        expect(hsts).toContain('includeSubDomains');
      });
    });

    describe('Permissions-Policy', () => {
      it('should have Permissions-Policy for app routes', async () => {
        const response = await request(app).get('/');

        expect(response.headers['permissions-policy']).toBeDefined();
      });
    });

    describe('X-Powered-By', () => {
      it('should not expose X-Powered-By', async () => {
        const response = await request(app).get('/');

        expect(response.headers['x-powered-by']).toBeUndefined();
      });
    });
  });

  describe('Nonce Uniqueness', () => {
    it('should generate unique nonce for each request', async () => {
      const response1 = await request(app).get('/');
      const response2 = await request(app).get('/');

      const csp1 = response1.headers['content-security-policy'];
      const csp2 = response2.headers['content-security-policy'];

      const nonce1 = csp1.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];
      const nonce2 = csp2.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];

      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
    });

    it('should have consistent nonce across CSP directive and HTML', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/');
        const csp = response.headers['content-security-policy'];
        const html = response.text;

        const cspNonce = csp.match(/'nonce-([A-Za-z0-9+/=]+)'/)?.[1];
        expect(html).toContain(`nonce="${cspNonce}"`);
      }
    });
  });

  describe('Cross-Origin Headers', () => {
    it('should have Cross-Origin-Opener-Policy', async () => {
      const response = await request(app).get('/');

      expect(response.headers['cross-origin-opener-policy']).toBeDefined();
    });

    it('should have Cross-Origin-Resource-Policy', async () => {
      const response = await request(app).get('/');

      expect(response.headers['cross-origin-resource-policy']).toBeDefined();
    });
  });
});
