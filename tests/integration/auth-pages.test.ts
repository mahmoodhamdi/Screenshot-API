/**
 * Auth Pages Integration Tests
 * Verifies that all authentication pages render correctly
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

describe('Auth Pages Integration Tests', () => {
  describe('GET /login', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should contain login form elements', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('id="login-form"');
      expect(response.text).toContain('id="email"');
      expect(response.text).toContain('id="password"');
      expect(response.text).toContain('type="submit"');
    });

    it('should have proper page title', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('<title>Sign In - Screenshot API</title>');
    });

    it('should contain Welcome Back heading', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('Welcome Back');
    });

    it('should have link to register page', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('href="/register"');
    });

    it('should have link to forgot password page', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('href="/forgot-password"');
    });

    it('should have accessible form labels', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('for="email"');
      expect(response.text).toContain('for="password"');
    });

    it('should have remember me checkbox', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('id="remember"');
      expect(response.text).toContain('Remember me');
    });
  });

  describe('GET /register', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/register');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should contain register form elements', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('id="register-form"');
      expect(response.text).toContain('id="name"');
      expect(response.text).toContain('id="email"');
      expect(response.text).toContain('id="password"');
      expect(response.text).toContain('id="confirmPassword"');
    });

    it('should have proper page title', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('<title>Create Account - Screenshot API</title>');
    });

    it('should contain Create Account heading', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('Create Account');
    });

    it('should have password strength indicator', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('password-strength');
      expect(response.text).toContain('strength-fill');
      expect(response.text).toContain('strength-text');
    });

    it('should have password requirements list', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('At least 8 characters');
      expect(response.text).toContain('Contains a number');
      expect(response.text).toContain('Contains a special character');
      expect(response.text).toContain('Contains an uppercase letter');
    });

    it('should have terms checkbox', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('id="terms"');
      expect(response.text).toContain('Terms of Service');
      expect(response.text).toContain('Privacy Policy');
    });

    it('should have link to login page', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('href="/login"');
    });
  });

  describe('GET /forgot-password', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should contain forgot password form', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('id="forgot-form"');
      expect(response.text).toContain('id="email"');
    });

    it('should have proper page title', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('<title>Forgot Password - Screenshot API</title>');
    });

    it('should contain forgot password heading', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('Forgot your password?');
    });

    it('should have success state for email sent', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('forgot-success-state');
      expect(response.text).toContain('Check your email');
    });

    it('should have back to login link', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('Back to login');
      expect(response.text).toContain('href="/login"');
    });
  });

  describe('GET /reset-password', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should contain reset password form', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('id="reset-form"');
      expect(response.text).toContain('id="password"');
      expect(response.text).toContain('id="confirmPassword"');
    });

    it('should have proper page title', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('<title>Reset Password - Screenshot API</title>');
    });

    it('should have validating state', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('reset-validating-state');
      expect(response.text).toContain('Validating reset link');
    });

    it('should have success state', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('reset-success-state');
      expect(response.text).toContain('Password reset successful');
    });

    it('should have invalid token state', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('reset-invalid-state');
      expect(response.text).toContain('Invalid or expired link');
    });

    it('should have password strength indicator', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('password-strength');
      expect(response.text).toContain('strength-fill');
    });

    it('should accept token query parameter', async () => {
      const response = await request(app).get('/reset-password?token=test-token');

      expect(response.status).toBe(200);
      expect(response.text).toContain('test-token');
    });
  });

  describe('GET /verify-email', () => {
    it('should return 200 and HTML content', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });

    it('should have proper page title', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('<title>Verify Email - Screenshot API</title>');
    });

    it('should have loading/verifying state', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verify-loading-state');
      expect(response.text).toContain('Verifying your email');
    });

    it('should have success state', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verify-success-state');
      expect(response.text).toContain('Email Verified');
    });

    it('should have already verified state', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verify-already-state');
      expect(response.text).toContain('Already Verified');
    });

    it('should have invalid token state with resend form', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verify-invalid-state');
      expect(response.text).toContain('Verification Failed');
      expect(response.text).toContain('id="resend-form"');
    });

    it('should have pending state for just registered users', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verify-pending-state');
      expect(response.text).toContain('Verify Your Email');
    });

    it('should accept email query parameter', async () => {
      const response = await request(app).get('/verify-email?email=test@example.com');

      expect(response.status).toBe(200);
      expect(response.text).toContain('test@example.com');
    });
  });

  describe('Meta Tags and SEO', () => {
    const pages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

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

      it(`${page} should have noindex meta tag for privacy`, async () => {
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
    it('should have proper heading hierarchy on login page', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('<h1>');
      expect(response.text).toContain('<h2');
    });

    it('should have aria-labels for icon buttons', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('aria-label="Show password"');
    });

    it('should have role="alert" for error messages', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('role="alert"');
    });

    it('should have role="main" for main content', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('role="main"');
    });

    it('should have required indicators for required fields', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('required-indicator');
      expect(response.text).toContain('aria-hidden="true"');
    });
  });

  describe('Design System', () => {
    const pages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

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

      it(`${page} should have auth container layout`, async () => {
        const response = await request(app).get(page);
        expect(response.text).toContain('auth-container');
        expect(response.text).toContain('auth-branding');
        expect(response.text).toContain('auth-form-container');
      });
    });
  });

  describe('JavaScript Functionality', () => {
    it('login page should have password toggle script', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('togglePasswordVisibility');
    });

    it('login page should have form validation script', async () => {
      const response = await request(app).get('/login');

      expect(response.text).toContain('validateField');
      expect(response.text).toContain('validateForm');
    });

    it('register page should have password strength script', async () => {
      const response = await request(app).get('/register');

      expect(response.text).toContain('updatePasswordStrength');
    });

    it('forgot password page should have state switching script', async () => {
      const response = await request(app).get('/forgot-password');

      expect(response.text).toContain('showSuccessState');
      expect(response.text).toContain('maskEmail');
    });

    it('reset password page should have token validation script', async () => {
      const response = await request(app).get('/reset-password');

      expect(response.text).toContain('validateToken');
      expect(response.text).toContain('showState');
    });

    it('verify email page should have auto-verify script', async () => {
      const response = await request(app).get('/verify-email');

      expect(response.text).toContain('verifyEmail');
    });
  });
});
