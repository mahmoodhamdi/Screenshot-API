/**
 * Auth Pages Generator
 * Main entry point for generating authentication pages HTML
 */

import { getAuthLayout } from './components/auth-layout';
import { getFormInputStyles } from './components/form-input';
import { getFormButtonStyles } from './components/form-button';
import { getAuthCardStyles } from './components/auth-card';
import { generateLoginForm, getLoginStyles, getLoginScripts } from './pages/login';
import { generateRegisterForm, getRegisterStyles, getRegisterScripts } from './pages/register';

export type AuthPageType =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'verify-email';

export interface AuthPageConfig {
  title?: string;
  description?: string;
  baseUrl?: string;
  token?: string;
}

interface PageMeta {
  title: string;
  description: string;
  heading: string;
  subheading: string;
}

const PAGE_META: Record<AuthPageType, PageMeta> = {
  login: {
    title: 'Sign In - Screenshot API',
    description: 'Sign in to your Screenshot API account to access your dashboard and API keys.',
    heading: 'Welcome Back',
    subheading: 'Sign in to continue to your account',
  },
  register: {
    title: 'Create Account - Screenshot API',
    description:
      'Create your free Screenshot API account and start capturing screenshots instantly.',
    heading: 'Create Account',
    subheading: 'Get started with 100 free screenshots',
  },
  'forgot-password': {
    title: 'Forgot Password - Screenshot API',
    description: 'Reset your Screenshot API password. We will send you a reset link.',
    heading: 'Forgot Password?',
    subheading: 'Enter your email to receive a reset link',
  },
  'reset-password': {
    title: 'Reset Password - Screenshot API',
    description: 'Create a new password for your Screenshot API account.',
    heading: 'Reset Password',
    subheading: 'Create a new secure password',
  },
  'verify-email': {
    title: 'Verify Email - Screenshot API',
    description: 'Verify your email address to complete your Screenshot API registration.',
    heading: 'Verify Email',
    subheading: 'Confirming your email address',
  },
};

/**
 * Generate the complete auth page HTML
 */
export function generateAuthPage(page: AuthPageType, config: AuthPageConfig = {}): string {
  const pageMeta = PAGE_META[page];
  const { title = pageMeta.title, description = pageMeta.description, baseUrl = '' } = config;

  const styles = `
    ${getBaseStyles()}
    ${getAuthLayout()}
    ${getFormInputStyles()}
    ${getFormButtonStyles()}
    ${getAuthCardStyles()}
    ${getAuthAnimationStyles()}
    ${getPageStyles(page)}
  `;

  const content = getPageContent(page, config);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="robots" content="noindex, nofollow">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}/${page}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0f">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>${styles}</style>
</head>
<body>
  <div class="auth-container">
    <!-- Left Side - Branding -->
    <div class="auth-branding" aria-hidden="true">
      <div class="auth-branding-content">
        <a href="/" class="auth-logo">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="url(#logo-gradient)"/>
            <path d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="17" r="2" fill="white"/>
            <path d="M12 24L17 20L20 22L25 18L28 21V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V24Z" fill="white" fill-opacity="0.3"/>
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stop-color="#6366f1"/>
                <stop offset="1" stop-color="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
          <span>Screenshot API</span>
        </a>

        <div class="auth-tagline">
          <h1>Capture Any Website<br><span class="gradient-text">In Milliseconds</span></h1>
          <p>Professional screenshot API trusted by 10,000+ developers worldwide.</p>
        </div>

        <div class="auth-features">
          <div class="auth-feature">
            <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>100 free screenshots/month</span>
          </div>
          <div class="auth-feature">
            <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>No credit card required</span>
          </div>
          <div class="auth-feature">
            <svg class="auth-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Cancel anytime</span>
          </div>
        </div>

        <!-- Decorative elements -->
        <div class="auth-decoration">
          <div class="auth-orb auth-orb-1"></div>
          <div class="auth-orb auth-orb-2"></div>
          <div class="auth-grid-lines"></div>
        </div>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="auth-form-container" role="main">
      <div class="auth-form-wrapper">
        ${content}
      </div>
    </div>
  </div>

  <script>${getAuthScripts()}${getPageScripts(page)}</script>
</body>
</html>`;
}

/**
 * Get page-specific content
 */
function getPageContent(page: AuthPageType, config: AuthPageConfig): string {
  switch (page) {
    case 'login':
      return generateLoginForm({ baseUrl: config.baseUrl });
    case 'register':
      return generateRegisterForm({ baseUrl: config.baseUrl });
    default:
      return getPagePlaceholder(page, PAGE_META[page]);
  }
}

/**
 * Get page-specific styles
 */
function getPageStyles(page: AuthPageType): string {
  switch (page) {
    case 'login':
      return getLoginStyles();
    case 'register':
      return getRegisterStyles();
    default:
      return '';
  }
}

/**
 * Get page-specific scripts
 */
function getPageScripts(page: AuthPageType): string {
  switch (page) {
    case 'login':
      return getLoginScripts();
    case 'register':
      return getRegisterScripts();
    default:
      return '';
  }
}

/**
 * Get placeholder content for pages not yet implemented
 */
function getPagePlaceholder(page: AuthPageType, meta: PageMeta): string {
  return `
    <div class="auth-card">
      <div class="auth-card-header">
        <h2 class="auth-card-title">${meta.heading}</h2>
        <p class="auth-card-subtitle">${meta.subheading}</p>
      </div>
      <div class="auth-card-content">
        <p class="auth-placeholder-text">
          ${page} page will be implemented in Phase ${getPhaseNumber(page)}.
        </p>
      </div>
      <div class="auth-card-footer">
        <a href="/" class="auth-link">Back to Home</a>
      </div>
    </div>
  `;
}

function getPhaseNumber(page: AuthPageType): number {
  const phases: Record<AuthPageType, number> = {
    login: 2,
    register: 3,
    'forgot-password': 4,
    'reset-password': 5,
    'verify-email': 6,
  };
  return phases[page];
}

/**
 * Base styles matching landing page design system
 */
function getBaseStyles(): string {
  return `
    /* CSS Variables - Design System */
    :root {
      /* Colors */
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a24;
      --bg-hover: #22222e;
      --bg-input: #16161e;

      --text-primary: #ffffff;
      --text-secondary: #a0a0b0;
      --text-muted: #6b6b7b;

      --accent-primary: #6366f1;
      --accent-secondary: #8b5cf6;
      --accent-tertiary: #06b6d4;

      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;

      --border-color: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.15);
      --border-focus: rgba(99, 102, 241, 0.5);

      /* Typography */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

      /* Transitions */
      --transition-fast: 0.15s ease;
      --transition-normal: 0.3s ease;

      /* Focus */
      --focus-ring: 0 0 0 3px rgba(99, 102, 241, 0.3);
    }

    /* Reset */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: var(--font-sans);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
      overflow-x: hidden;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Focus styles */
    :focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    :focus:not(:focus-visible) {
      outline: none;
    }

    /* Gradient Text */
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Selection */
    ::selection {
      background: var(--accent-primary);
      color: white;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-hover);
      border-radius: 4px;
    }

    /* Placeholder text */
    .auth-placeholder-text {
      color: var(--text-muted);
      text-align: center;
      padding: 2rem;
      font-style: italic;
    }
  `;
}

/**
 * Auth-specific animation styles
 */
function getAuthAnimationStyles(): string {
  return `
    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-20px) scale(1.05);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.4;
      }
      50% {
        opacity: 0.8;
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes checkmark {
      0% {
        stroke-dashoffset: 100;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

/**
 * Auth scripts for interactivity
 */
function getAuthScripts(): string {
  return `
    // Password visibility toggle
    function togglePasswordVisibility(inputId, button) {
      const input = document.getElementById(inputId);
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      // Update button icon
      const showIcon = button.querySelector('.icon-show');
      const hideIcon = button.querySelector('.icon-hide');
      if (showIcon && hideIcon) {
        showIcon.style.display = isPassword ? 'none' : 'block';
        hideIcon.style.display = isPassword ? 'block' : 'none';
      }

      // Update aria-label
      button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    }

    // Form validation helper
    function showError(inputId, message) {
      const input = document.getElementById(inputId);
      const errorEl = document.getElementById(inputId + '-error');
      if (input && errorEl) {
        input.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      }
    }

    function clearError(inputId) {
      const input = document.getElementById(inputId);
      const errorEl = document.getElementById(inputId + '-error');
      if (input && errorEl) {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        errorEl.textContent = '';
        errorEl.style.display = 'none';
      }
    }

    // Form submission helper
    function setLoading(formId, isLoading) {
      const form = document.getElementById(formId);
      if (!form) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const inputs = form.querySelectorAll('input, button');

      if (submitBtn) {
        submitBtn.classList.toggle('is-loading', isLoading);
        submitBtn.disabled = isLoading;
      }

      inputs.forEach(input => {
        if (input !== submitBtn) {
          input.disabled = isLoading;
        }
      });
    }

    // Shake animation for errors
    function shakeElement(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 500);
      }
    }
  `;
}

export default generateAuthPage;
