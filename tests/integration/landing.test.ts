/**
 * Landing Page Integration Tests
 * Tests landing page routes, HTML structure, and meta tags
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

describe('Landing Page', () => {
  describe('GET /', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should contain required HTML structure', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      // Check basic HTML structure
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('</html>');
    });

    it('should contain required meta tags', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      // Essential meta tags
      expect(html).toContain('<meta charset="UTF-8">');
      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
      expect(html).toContain('initial-scale=1.0');

      // SEO meta tags
      expect(html).toContain('<title>');
      expect(html).toContain('meta name="description"');
      expect(html).toContain('meta name="keywords"');

      // Open Graph tags
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('og:type');

      // Twitter Card tags
      expect(html).toContain('twitter:card');
      expect(html).toContain('twitter:title');
    });

    it('should contain all main sections', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      // Navigation
      expect(html).toContain('nav');
      expect(html).toContain('Screenshot API');

      // Hero section
      expect(html).toContain('hero-section');
      expect(html).toContain('Get Started');

      // Features section
      expect(html).toContain('id="features"');

      // Code demo section
      expect(html).toContain('id="code-demo"');

      // Pricing section
      expect(html).toContain('id="pricing"');

      // Testimonials section
      expect(html).toContain('id="testimonials"');

      // CTA section
      expect(html).toContain('id="cta"');

      // Footer
      expect(html).toContain('footer');
    });

    it('should contain navigation links', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('href="#features"');
      expect(html).toContain('href="#pricing"');
      expect(html).toContain('href="/docs"');
      expect(html).toContain('href="/developer"');
    });

    it('should contain pricing plans', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('Free');
      expect(html).toContain('Starter');
      expect(html).toContain('Pro');
      expect(html).toContain('Enterprise');
      expect(html).toContain('$0');
      expect(html).toContain('$19');
      expect(html).toContain('$49');
      expect(html).toContain('$149');
    });

    it('should contain accessibility features', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      // Skip link
      expect(html).toContain('skip-link');
      expect(html).toContain('Skip to main content');

      // ARIA labels
      expect(html).toContain('aria-label');

      // Main content landmark
      expect(html).toContain('id="main-content"');
      expect(html).toContain('role="main"');
    });

    it('should contain structured data (JSON-LD)', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('application/ld+json');
      expect(html).toContain('@context');
      expect(html).toContain('schema.org');
      expect(html).toContain('SoftwareApplication');
    });

    it('should load Google Fonts', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('fonts.googleapis.com');
      expect(html).toContain('Inter');
      expect(html).toContain('JetBrains Mono');
    });

    it('should have responsive design meta tags', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('theme-color');
      expect(html).toContain('apple-touch-icon');
    });
  });

  describe('Related Routes', () => {
    it('GET /health should return 200', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
    });

    it('GET /api/v1 should return API info', async () => {
      const response = await request(app).get('/api/v1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.name).toBe('Screenshot API');
    });

    it('GET /docs should return Swagger UI', async () => {
      const response = await request(app).get('/docs/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('GET /developer should return Developer Portal', async () => {
      const response = await request(app).get('/developer');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('Static Assets', () => {
    it('should serve OpenAPI JSON spec', async () => {
      const response = await request(app).get('/docs/openapi.json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body.openapi).toBeDefined();
    });

    it('should serve OpenAPI YAML spec', async () => {
      const response = await request(app).get('/docs/openapi.yaml');

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent pages', async () => {
      const response = await request(app).get('/non-existent-page-12345');

      expect(response.status).toBe(404);
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await request(app).get('/');
      const duration = Date.now() - start;

      // Should respond within 500ms
      expect(duration).toBeLessThan(500);
    });

    it('should include preconnect hints', async () => {
      const response = await request(app).get('/');
      const html = response.text;

      expect(html).toContain('rel="preconnect"');
      expect(html).toContain('rel="dns-prefetch"');
    });
  });
});
