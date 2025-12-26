/**
 * Dashboard Pages Generator
 * Main entry point for generating dashboard pages HTML
 */

import { generateDashboardLayout, getDashboardLayoutStyles } from './layouts/dashboard-layout';
import { getSidebarStyles } from './components/sidebar';
import { getHeaderStyles } from './components/header';
import { getStatCardStyles } from './components/stat-card';
import { getDataTableStyles, getDataTableScripts } from './components/data-table';
import { getPaginationStyles, getPaginationScripts } from './components/pagination';
import { getEmptyStateStyles } from './components/empty-state';
import { generateOverviewPage, getOverviewStyles, getOverviewScripts } from './pages/overview';
import {
  generateScreenshotsPage,
  getScreenshotsStyles,
  getScreenshotsScripts,
} from './pages/screenshots';
import {
  generateScreenshotDetailPage,
  getScreenshotDetailStyles,
  getScreenshotDetailScripts,
} from './pages/screenshot-detail';
import { generateApiKeysPage, getApiKeysStyles, getApiKeysScripts } from './pages/api-keys';
import { getChartStyles, getChartScripts } from './components/chart';
import { generateUsagePage, getUsageStyles, getUsageScripts } from './pages/usage';
import { generateSettingsPage, getSettingsStyles, getSettingsScripts } from './pages/settings';
import { generateBillingPage, getBillingStyles, getBillingScripts } from './pages/billing';

export type DashboardPageType =
  | 'overview'
  | 'screenshots'
  | 'screenshot-detail'
  | 'api-keys'
  | 'usage'
  | 'settings'
  | 'billing';

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
}

export interface DashboardPageConfig {
  title?: string;
  description?: string;
  baseUrl?: string;
  user: DashboardUser;
  data?: Record<string, unknown>;
}

interface PageMeta {
  title: string;
  description: string;
  pageTitle: string;
}

const PAGE_META: Record<DashboardPageType, PageMeta> = {
  overview: {
    title: 'Dashboard - Screenshot API',
    description: 'View your screenshot usage, recent activity, and account overview.',
    pageTitle: 'Overview',
  },
  screenshots: {
    title: 'Screenshots - Screenshot API',
    description: 'Manage your screenshots, view history, and capture new ones.',
    pageTitle: 'Screenshots',
  },
  'screenshot-detail': {
    title: 'Screenshot Details - Screenshot API',
    description: 'View screenshot details, metadata, and download options.',
    pageTitle: 'Screenshot Details',
  },
  'api-keys': {
    title: 'API Keys - Screenshot API',
    description: 'Manage your API keys, create new ones, and set permissions.',
    pageTitle: 'API Keys',
  },
  usage: {
    title: 'Usage & Analytics - Screenshot API',
    description: 'View your usage statistics, analytics, and API performance.',
    pageTitle: 'Usage & Analytics',
  },
  settings: {
    title: 'Settings - Screenshot API',
    description: 'Manage your account settings, profile, and security options.',
    pageTitle: 'Settings',
  },
  billing: {
    title: 'Billing - Screenshot API',
    description: 'Manage your subscription, view invoices, and update payment methods.',
    pageTitle: 'Billing',
  },
};

/**
 * Generate the complete dashboard page HTML
 */
export function generateDashboardPage(
  page: DashboardPageType,
  config: DashboardPageConfig
): string {
  const pageMeta = PAGE_META[page];
  const { title = pageMeta.title, description = pageMeta.description, baseUrl = '', user } = config;

  const styles = `
    ${getBaseStyles()}
    ${getDashboardLayoutStyles()}
    ${getSidebarStyles()}
    ${getHeaderStyles()}
    ${getPageStyles(page)}
  `;

  const content = generateDashboardLayout({
    page,
    pageTitle: pageMeta.pageTitle,
    user,
    content: getPageContent(page, config),
  });

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
  <link rel="canonical" href="${baseUrl}/dashboard${page === 'overview' ? '' : '/' + page}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#0a0a0f">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>${styles}</style>
</head>
<body class="dashboard-body">
  <!-- Skip link for keyboard navigation -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Screen reader announcements -->
  <div id="sr-announcer" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>

  <!-- Toast container -->
  <div id="toast-container" class="toast-container" aria-live="polite"></div>

  ${content}

  <script>${getDashboardScripts()}${getPageScripts(page)}</script>
</body>
</html>`;
}

/**
 * Get page-specific content
 */
function getPageContent(page: DashboardPageType, config: DashboardPageConfig): string {
  switch (page) {
    case 'overview':
      return generateOverviewPage(config);
    case 'screenshots':
      return generateScreenshotsPage();
    case 'screenshot-detail':
      return generateScreenshotDetailPage();
    case 'api-keys':
      return generateApiKeysPage();
    case 'usage':
      return generateUsagePage();
    case 'settings':
      return generateSettingsPage();
    case 'billing':
      return generateBillingPage();
    default:
      return generateOverviewPage(config);
  }
}

/**
 * Get page-specific styles
 */
function getPageStyles(page: DashboardPageType): string {
  // Common placeholder styles for pages not yet implemented
  const placeholderStyles = `
    .dashboard-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      text-align: center;
      color: var(--text-secondary);
    }

    .dashboard-placeholder-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1.5rem;
      color: var(--text-muted);
    }

    .dashboard-placeholder-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .dashboard-placeholder-text {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }
  `;

  switch (page) {
    case 'overview':
      return `
        ${getStatCardStyles()}
        ${getOverviewStyles()}
      `;
    case 'screenshots':
      return `
        ${getDataTableStyles()}
        ${getPaginationStyles()}
        ${getEmptyStateStyles()}
        ${getScreenshotsStyles()}
      `;
    case 'screenshot-detail':
      return getScreenshotDetailStyles();
    case 'api-keys':
      return getApiKeysStyles();
    case 'usage':
      return `
        ${getChartStyles()}
        ${getUsageStyles()}
      `;
    case 'settings':
      return getSettingsStyles();
    case 'billing':
      return getBillingStyles();
    default:
      return placeholderStyles;
  }
}

/**
 * Get page-specific scripts
 */
function getPageScripts(page: DashboardPageType): string {
  switch (page) {
    case 'overview':
      return getOverviewScripts();
    case 'screenshots':
      return `
        ${getDataTableScripts()}
        ${getPaginationScripts()}
        ${getScreenshotsScripts()}
      `;
    case 'screenshot-detail':
      return getScreenshotDetailScripts();
    case 'api-keys':
      return getApiKeysScripts();
    case 'usage':
      return `
        ${getChartScripts()}
        ${getUsageScripts()}
      `;
    case 'settings':
      return getSettingsScripts();
    case 'billing':
      return getBillingScripts();
    default:
      return `
        // ${page} page scripts
        console.log('Dashboard page loaded: ${page}');
      `;
  }
}

/**
 * Base styles for dashboard
 */
function getBaseStyles(): string {
  return `
    /* CSS Variables - Design System */
    :root {
      /* Colors */
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-tertiary: #1a1a24;
      --bg-card: #16161e;
      --bg-hover: #22222e;
      --bg-input: #12121a;

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

      /* Spacing */
      --sidebar-width: 280px;
      --sidebar-collapsed-width: 72px;
      --header-height: 64px;
      --content-padding: 24px;

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

    body.dashboard-body {
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

    button {
      font-family: inherit;
      cursor: pointer;
    }

    /* Focus styles */
    :focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    :focus:not(:focus-visible) {
      outline: none;
    }

    /* Screen reader only */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Skip link */
    .skip-link {
      position: absolute;
      top: -100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--accent-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0 0 8px 8px;
      z-index: 10000;
      font-weight: 500;
      transition: top 0.3s ease;
    }

    .skip-link:focus {
      top: 0;
    }

    /* Selection */
    ::selection {
      background: var(--accent-primary);
      color: white;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-hover);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    /* Toast container */
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      pointer-events: auto;
      animation: slideIn 0.3s ease;
    }

    .toast-success {
      border-left: 3px solid var(--success);
    }

    .toast-error {
      border-left: 3px solid var(--error);
    }

    .toast-warning {
      border-left: 3px solid var(--warning);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Common button styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
      border: none;
    }

    .btn-primary:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: var(--bg-tertiary);
      color: var(--text-primary);
      border-color: var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }

    .btn-ghost:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .btn-danger {
      background: var(--error);
      color: white;
    }

    .btn-danger:hover {
      filter: brightness(1.1);
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
    }

    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    .btn-icon {
      padding: 0.5rem;
    }

    .btn-icon svg {
      width: 18px;
      height: 18px;
    }

    /* Badge styles */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .badge-primary {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .badge-warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    /* Dashboard welcome */
    .dashboard-welcome {
      margin-bottom: 2rem;
    }

    .dashboard-welcome h2 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .dashboard-date {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    /* Card styles */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
    }

    /* Error state */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .error-state-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1.5rem;
      color: var(--error);
    }

    .error-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .error-state-message {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      max-width: 400px;
    }

    .error-state-retry {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Skeleton loader */
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton-row {
      display: flex;
      gap: 1rem;
    }

    .skeleton-item {
      background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
      background-size: 200% 100%;
      animation: skeletonShimmer 1.5s infinite;
      border-radius: 6px;
    }

    .skeleton-text {
      height: 1rem;
      width: 100%;
    }

    .skeleton-text-sm {
      height: 0.75rem;
      width: 60%;
    }

    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .skeleton-card {
      height: 120px;
      border-radius: 12px;
    }

    @keyframes skeletonShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
 * Dashboard scripts
 */
function getDashboardScripts(): string {
  return `
    // Screen reader announcement
    function announce(message, priority = 'polite') {
      const announcer = document.getElementById('sr-announcer');
      if (announcer) {
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = '';
        setTimeout(() => {
          announcer.textContent = message;
        }, 100);
      }
    }

    // Toast notifications
    function showToast(message, type = 'success', duration = 3000) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.innerHTML = message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
      }, duration);

      announce(message);
    }

    // Mobile sidebar toggle
    function toggleSidebar() {
      const sidebar = document.getElementById('dashboard-sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.toggle('is-open');
        overlay.classList.toggle('is-visible');
        document.body.classList.toggle('sidebar-open');
      }
    }

    function closeSidebar() {
      const sidebar = document.getElementById('dashboard-sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      if (sidebar && overlay) {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        document.body.classList.remove('sidebar-open');
      }
    }

    // User dropdown toggle
    function toggleUserDropdown() {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown) {
        dropdown.classList.toggle('is-open');
      }
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      const dropdown = document.getElementById('user-dropdown');
      const trigger = document.getElementById('user-dropdown-trigger');
      if (dropdown && trigger && !trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('is-open');
      }
    });

    // Global keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Escape: Close modals, sidebar, and dropdowns
      if (e.key === 'Escape') {
        closeSidebar();
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.remove('is-open');

        // Close any open modals
        document.querySelectorAll('.modal.is-open').forEach(modal => {
          modal.classList.remove('is-open');
          document.body.style.overflow = '';
        });
      }

      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.header-search-input');
        if (searchInput) {
          const searchContainer = document.getElementById('header-search');
          if (searchContainer) searchContainer.style.display = 'flex';
          searchInput.focus();
        }
      }

      // Ctrl/Cmd + N: New screenshot (only on screenshots page)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        const newScreenshotModal = document.getElementById('new-screenshot-modal');
        if (newScreenshotModal) {
          e.preventDefault();
          openNewScreenshotModal();
        }
      }

      // Ctrl/Cmd + Shift + N: New API key (only on api-keys page)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        const createKeyModal = document.getElementById('create-key-modal');
        if (createKeyModal) {
          e.preventDefault();
          openCreateKeyModal();
        }
      }
    });

    // Sign out handler
    async function handleSignOut() {
      try {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');

        // Redirect to login
        window.location.href = '/login';
      } catch (error) {
        console.error('Sign out error:', error);
        showToast('Failed to sign out', 'error');
      }
    }

    // Show error state with retry button
    function showErrorState(containerId, message, retryFn) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = \`
        <div class="error-state">
          <svg class="error-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8v4M12 16h.01"/>
          </svg>
          <h3 class="error-state-title">Something went wrong</h3>
          <p class="error-state-message">\${message || 'Failed to load data. Please try again.'}</p>
          <button class="btn btn-secondary error-state-retry" onclick="\${retryFn}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Try Again
          </button>
        </div>
      \`;
    }

    // Generate skeleton loader
    function showSkeletonLoader(containerId, rows = 5) {
      const container = document.getElementById(containerId);
      if (!container) return;

      let html = '<div class="skeleton-container">';
      for (let i = 0; i < rows; i++) {
        html += \`
          <div class="skeleton-row">
            <div class="skeleton-item skeleton-avatar"></div>
            <div style="flex: 1;">
              <div class="skeleton-item skeleton-text" style="margin-bottom: 0.5rem;"></div>
              <div class="skeleton-item skeleton-text-sm"></div>
            </div>
          </div>
        \`;
      }
      html += '</div>';
      container.innerHTML = html;
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Dashboard initialized');
    });
  `;
}

export default generateDashboardPage;
