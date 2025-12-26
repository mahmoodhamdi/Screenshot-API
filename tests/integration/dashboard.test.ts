/**
 * Dashboard Integration Tests
 * Tests dashboard routes, HTML structure, and page components
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

describe('Dashboard Integration Tests', () => {
  describe('Route Tests', () => {
    describe('GET /dashboard (Overview)', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard');

        expect(response.text).toContain('<title>Dashboard - Screenshot API</title>');
      });
    });

    describe('GET /dashboard/screenshots', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/screenshots');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/screenshots');

        expect(response.text).toContain('<title>Screenshots - Screenshot API</title>');
      });
    });

    describe('GET /dashboard/screenshots/:id', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/screenshots/test-id-123');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/screenshots/test-id-123');

        expect(response.text).toContain('<title>Screenshot Details - Screenshot API</title>');
      });
    });

    describe('GET /dashboard/api-keys', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/api-keys');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/api-keys');

        expect(response.text).toContain('<title>API Keys - Screenshot API</title>');
      });
    });

    describe('GET /dashboard/usage', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/usage');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/usage');

        // Title contains & which is escaped as &amp; in HTML
        expect(response.text).toContain('Usage');
        expect(response.text).toContain('Analytics');
        expect(response.text).toContain('Screenshot API');
      });
    });

    describe('GET /dashboard/settings', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/settings');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/settings');

        expect(response.text).toContain('<title>Settings - Screenshot API</title>');
      });
    });

    describe('GET /dashboard/billing', () => {
      it('should return 200 and HTML content', async () => {
        const response = await request(app).get('/dashboard/billing');

        expect(response.status).toBe(200);
        expect(response.type).toBe('text/html');
      });

      it('should have proper page title', async () => {
        const response = await request(app).get('/dashboard/billing');

        expect(response.text).toContain('<title>Billing - Screenshot API</title>');
      });
    });
  });

  describe('Structure Tests', () => {
    const dashboardPages = [
      '/dashboard',
      '/dashboard/screenshots',
      '/dashboard/api-keys',
      '/dashboard/usage',
      '/dashboard/settings',
      '/dashboard/billing',
    ];

    dashboardPages.forEach((page) => {
      describe(`${page}`, () => {
        it('should contain sidebar', async () => {
          const response = await request(app).get(page);

          expect(response.text).toContain('dashboard-sidebar');
        });

        it('should contain header', async () => {
          const response = await request(app).get(page);

          expect(response.text).toContain('dashboard-header');
        });

        it('should contain main content area', async () => {
          const response = await request(app).get(page);

          expect(response.text).toContain('id="main-content"');
          expect(response.text).toContain('dashboard-main');
        });

        it('should have proper HTML structure', async () => {
          const response = await request(app).get(page);

          expect(response.text).toContain('<!DOCTYPE html>');
          expect(response.text).toContain('<html lang="en">');
          expect(response.text).toContain('<head>');
          expect(response.text).toContain('<body');
          expect(response.text).toContain('</html>');
        });
      });
    });
  });

  describe('Sidebar Navigation', () => {
    it('should contain all navigation links', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('href="/dashboard"');
      expect(response.text).toContain('href="/dashboard/screenshots"');
      expect(response.text).toContain('href="/dashboard/api-keys"');
      expect(response.text).toContain('href="/dashboard/usage"');
      expect(response.text).toContain('href="/dashboard/settings"');
      expect(response.text).toContain('href="/dashboard/billing"');
    });

    it('should contain navigation labels', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('Overview');
      expect(response.text).toContain('Screenshots');
      expect(response.text).toContain('API Keys');
      expect(response.text).toContain('Usage');
      expect(response.text).toContain('Settings');
      expect(response.text).toContain('Billing');
    });

    it('should have active state for current page', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('is-active');
    });

    it('should contain logo link', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('sidebar-logo');
      expect(response.text).toContain('Screenshot API');
    });

    it('should have user plan badge', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('sidebar-plan-badge');
    });
  });

  describe('Header', () => {
    it('should contain user dropdown trigger', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('user-dropdown-trigger');
    });

    it('should contain user dropdown menu', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('user-dropdown');
    });

    it('should have sign out button', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('Sign Out');
      expect(response.text).toContain('handleSignOut');
    });

    it('should have mobile menu toggle', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('header-menu-toggle');
      expect(response.text).toContain('toggleSidebar');
    });
  });

  describe('Overview Page Content', () => {
    it('should have welcome section', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('dashboard-welcome');
      expect(response.text).toContain('Welcome back');
    });

    it('should have stats grid', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('stats-grid');
      expect(response.text).toContain('stat-card');
    });

    it('should have quick capture form', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('quick-capture-form');
    });

    it('should have recent screenshots section', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('recent-screenshots');
    });
  });

  describe('Screenshots Page Content', () => {
    it('should have header with new screenshot button', async () => {
      const response = await request(app).get('/dashboard/screenshots');

      expect(response.text).toContain('New Screenshot');
    });

    it('should have screenshots table', async () => {
      const response = await request(app).get('/dashboard/screenshots');

      expect(response.text).toContain('screenshots-table');
    });

    it('should have empty state', async () => {
      const response = await request(app).get('/dashboard/screenshots');

      expect(response.text).toContain('empty-state');
    });

    it('should have new screenshot modal', async () => {
      const response = await request(app).get('/dashboard/screenshots');

      expect(response.text).toContain('new-screenshot-modal');
    });
  });

  describe('API Keys Page Content', () => {
    it('should have create new key button', async () => {
      const response = await request(app).get('/dashboard/api-keys');

      expect(response.text).toContain('Create New Key');
    });

    it('should have security notice', async () => {
      const response = await request(app).get('/dashboard/api-keys');

      expect(response.text).toContain('security-notice');
    });

    it('should have API keys table', async () => {
      const response = await request(app).get('/dashboard/api-keys');

      expect(response.text).toContain('api-keys-table');
    });

    it('should have create key modal', async () => {
      const response = await request(app).get('/dashboard/api-keys');

      expect(response.text).toContain('create-key-modal');
    });
  });

  describe('Usage Page Content', () => {
    it('should have date range picker', async () => {
      const response = await request(app).get('/dashboard/usage');

      expect(response.text).toContain('date-range');
    });

    it('should have export button', async () => {
      const response = await request(app).get('/dashboard/usage');

      expect(response.text).toContain('Export');
    });

    it('should have usage stats', async () => {
      const response = await request(app).get('/dashboard/usage');

      expect(response.text).toContain('usage-stats');
    });

    it('should have charts section', async () => {
      const response = await request(app).get('/dashboard/usage');

      expect(response.text).toContain('chart');
    });
  });

  describe('Settings Page Content', () => {
    it('should have profile section', async () => {
      const response = await request(app).get('/dashboard/settings');

      expect(response.text).toContain('id="profile"');
      expect(response.text).toContain('settings-section');
    });

    it('should have security section', async () => {
      const response = await request(app).get('/dashboard/settings');

      expect(response.text).toContain('id="security"');
      expect(response.text).toContain('settings-section');
    });

    it('should have notifications section', async () => {
      const response = await request(app).get('/dashboard/settings');

      expect(response.text).toContain('id="notifications"');
      expect(response.text).toContain('settings-section');
    });

    it('should have danger zone section', async () => {
      const response = await request(app).get('/dashboard/settings');

      expect(response.text).toContain('id="danger"');
      expect(response.text).toContain('danger-card');
    });

    it('should have password strength indicator', async () => {
      const response = await request(app).get('/dashboard/settings');

      expect(response.text).toContain('password-strength');
    });
  });

  describe('Billing Page Content', () => {
    it('should have current plan section', async () => {
      const response = await request(app).get('/dashboard/billing');

      expect(response.text).toContain('current-plan');
    });

    it('should have usage summary', async () => {
      const response = await request(app).get('/dashboard/billing');

      expect(response.text).toContain('usage-summary');
    });

    it('should have plan comparison', async () => {
      const response = await request(app).get('/dashboard/billing');

      expect(response.text).toContain('plans-comparison-card');
      expect(response.text).toContain('plans-grid');
    });

    it('should have billing history', async () => {
      const response = await request(app).get('/dashboard/billing');

      expect(response.text).toContain('billing-history');
    });

    it('should display all plan options', async () => {
      const response = await request(app).get('/dashboard/billing');

      expect(response.text).toContain('Free');
      expect(response.text).toContain('Starter');
      expect(response.text).toContain('Professional');
      expect(response.text).toContain('Enterprise');
    });
  });

  describe('Meta Tags and SEO', () => {
    const pages = [
      '/dashboard',
      '/dashboard/screenshots',
      '/dashboard/api-keys',
      '/dashboard/usage',
      '/dashboard/settings',
      '/dashboard/billing',
    ];

    pages.forEach((page) => {
      it(`${page} should have viewport meta tag`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('name="viewport"');
        expect(response.text).toContain('width=device-width');
      });

      it(`${page} should have description meta tag`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('name="description"');
      });

      it(`${page} should have noindex for dashboard pages`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('noindex');
      });

      it(`${page} should have theme-color meta tag`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('name="theme-color"');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have skip link', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('skip-link');
      expect(response.text).toContain('Skip to main content');
    });

    it('should have screen reader announcer', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('sr-announcer');
      expect(response.text).toContain('aria-live');
    });

    it('should have proper heading hierarchy', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('<h1');
      expect(response.text).toContain('<h2');
    });

    it('should have aria labels for interactive elements', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('aria-label');
    });
  });

  describe('Design System', () => {
    const pages = [
      '/dashboard',
      '/dashboard/screenshots',
      '/dashboard/api-keys',
      '/dashboard/usage',
      '/dashboard/settings',
      '/dashboard/billing',
    ];

    pages.forEach((page) => {
      it(`${page} should include Inter font`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('fonts.googleapis.com');
        expect(response.text).toContain('Inter');
      });

      it(`${page} should have CSS variables defined`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('--bg-primary');
        expect(response.text).toContain('--accent-primary');
        expect(response.text).toContain('--text-primary');
      });

      it(`${page} should have dark theme colors`, async () => {
        const response = await request(app).get(page);

        expect(response.text).toContain('#0a0a0f');
      });
    });
  });

  describe('JavaScript Functionality', () => {
    it('should have sidebar toggle script', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('toggleSidebar');
      expect(response.text).toContain('closeSidebar');
    });

    it('should have user dropdown script', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('toggleUserDropdown');
    });

    it('should have toast notification script', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('showToast');
    });

    it('should have announce function for screen readers', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('function announce');
    });

    it('should have sign out handler', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('handleSignOut');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive sidebar styles', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('@media');
      expect(response.text).toContain('1024px');
    });

    it('should have mobile overlay', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('sidebar-overlay');
    });
  });

  describe('Toast Container', () => {
    it('should have toast container element', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('toast-container');
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      await request(app).get('/dashboard');
      const duration = Date.now() - start;

      // First request may take longer due to initialization
      expect(duration).toBeLessThan(2000);
    });

    it('should include preconnect hints for fonts', async () => {
      const response = await request(app).get('/dashboard');

      expect(response.text).toContain('rel="preconnect"');
      expect(response.text).toContain('fonts.googleapis.com');
    });
  });
});
