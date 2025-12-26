/**
 * Dashboard Sidebar Component
 * Navigation sidebar with collapsible mobile menu
 */

import type { DashboardPageType, DashboardUser } from '../index';

export interface SidebarProps {
  currentPage: DashboardPageType;
  user: DashboardUser;
}

interface NavItem {
  id: DashboardPageType;
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>`,
  },
  {
    id: 'screenshots',
    label: 'Screenshots',
    href: '/dashboard/screenshots',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>`,
  },
  {
    id: 'api-keys',
    label: 'API Keys',
    href: '/dashboard/api-keys',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
    </svg>`,
  },
  {
    id: 'usage',
    label: 'Usage & Analytics',
    href: '/dashboard/usage',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 20V10"/>
      <path d="M12 20V4"/>
      <path d="M6 20v-6"/>
    </svg>`,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,
  },
  {
    id: 'billing',
    label: 'Billing',
    href: '/dashboard/billing',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <path d="M1 10h22"/>
    </svg>`,
  },
];

function getPlanBadge(plan: DashboardUser['plan']): { label: string; class: string } {
  const badges: Record<DashboardUser['plan'], { label: string; class: string }> = {
    free: { label: 'Free', class: 'badge-secondary' },
    starter: { label: 'Starter', class: 'badge-primary' },
    professional: { label: 'Pro', class: 'badge-primary' },
    enterprise: { label: 'Enterprise', class: 'badge-success' },
  };
  return badges[plan];
}

export function generateSidebar(props: SidebarProps): string {
  const { currentPage, user } = props;
  const planBadge = getPlanBadge(user.plan);

  const navItemsHtml = NAV_ITEMS.map((item) => {
    const isActive =
      item.id === currentPage || (item.id === 'screenshots' && currentPage === 'screenshot-detail');

    return `
      <li>
        <a
          href="${item.href}"
          class="sidebar-nav-item ${isActive ? 'is-active' : ''}"
          ${isActive ? 'aria-current="page"' : ''}
        >
          <span class="sidebar-nav-icon">${item.icon}</span>
          <span class="sidebar-nav-label">${item.label}</span>
        </a>
      </li>
    `;
  }).join('');

  return `
    <aside class="dashboard-sidebar" id="dashboard-sidebar" role="navigation" aria-label="Main navigation">
      <!-- Logo -->
      <div class="sidebar-header">
        <a href="/" class="sidebar-logo">
          <div class="sidebar-logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="url(#logo-gradient-sidebar)"/>
              <path d="M12 14C12 12.8954 12.8954 12 14 12H26C27.1046 12 28 12.8954 28 14V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V14Z" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="17" r="2" fill="white"/>
              <path d="M12 24L17 20L20 22L25 18L28 21V26C28 27.1046 27.1046 28 26 28H14C12.8954 28 12 27.1046 12 26V24Z" fill="white" fill-opacity="0.3"/>
              <defs>
                <linearGradient id="logo-gradient-sidebar" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#6366f1"/>
                  <stop offset="1" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="sidebar-logo-text">Screenshot API</span>
        </a>

        <!-- Mobile close button -->
        <button class="sidebar-close" onclick="closeSidebar()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Plan Badge -->
      <div class="sidebar-plan">
        <span class="sidebar-plan-badge ${planBadge.class}">${planBadge.label}</span>
        ${
          user.plan === 'free'
            ? `
          <a href="/dashboard/billing" class="sidebar-upgrade-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Upgrade
          </a>
        `
            : ''
        }
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <ul class="sidebar-nav-list">
          ${navItemsHtml}
        </ul>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <a href="/developer" class="sidebar-footer-link" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          <span>API Documentation</span>
        </a>
        <a href="/" class="sidebar-footer-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Back to Home</span>
        </a>
      </div>
    </aside>
  `;
}

export function getSidebarStyles(): string {
  return `
    /* Sidebar */
    .dashboard-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      z-index: 50;
      transition: transform var(--transition-normal);
    }

    /* Sidebar Header */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .sidebar-logo-icon {
      width: 36px;
      height: 36px;
    }

    .sidebar-logo-icon svg {
      width: 100%;
      height: 100%;
    }

    .sidebar-logo-text {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sidebar-close {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      border-radius: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .sidebar-close:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .sidebar-close svg {
      width: 20px;
      height: 20px;
    }

    /* Plan Badge */
    .sidebar-plan {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }

    .sidebar-plan-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-secondary {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .badge-primary {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .sidebar-upgrade-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--warning);
      background: rgba(245, 158, 11, 0.1);
      border-radius: 6px;
      text-decoration: none;
      transition: all var(--transition-fast);
    }

    .sidebar-upgrade-btn:hover {
      background: rgba(245, 158, 11, 0.2);
    }

    .sidebar-upgrade-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .sidebar-nav-list {
      list-style: none;
      padding: 0 0.75rem;
      margin: 0;
    }

    .sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      margin-bottom: 0.25rem;
    }

    .sidebar-nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .sidebar-nav-item.is-active {
      background: rgba(99, 102, 241, 0.1);
      color: var(--accent-primary);
    }

    .sidebar-nav-item.is-active .sidebar-nav-icon {
      color: var(--accent-primary);
    }

    .sidebar-nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .sidebar-nav-icon svg {
      width: 100%;
      height: 100%;
    }

    .sidebar-nav-label {
      white-space: nowrap;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .sidebar-footer-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .sidebar-footer-link:hover {
      background: var(--bg-hover);
      color: var(--text-secondary);
    }

    .sidebar-footer-link svg {
      width: 18px;
      height: 18px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .dashboard-sidebar {
        transform: translateX(-100%);
      }

      .dashboard-sidebar.is-open {
        transform: translateX(0);
      }

      .sidebar-close {
        display: flex;
      }
    }
  `;
}
