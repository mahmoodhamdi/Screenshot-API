/**
 * Dashboard Header Component
 * Top header with page title, search, and user menu
 */

import type { DashboardUser } from '../index';

export interface HeaderProps {
  pageTitle: string;
  user: DashboardUser;
}

function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateHeader(props: HeaderProps): string {
  const { pageTitle, user } = props;
  const initials = getUserInitials(user.name);

  return `
    <header class="dashboard-header">
      <div class="header-left">
        <!-- Mobile menu toggle -->
        <button class="header-menu-toggle" onclick="toggleSidebar()" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        </button>

        <!-- Page title -->
        <h1 class="header-title">${pageTitle}</h1>
      </div>

      <div class="header-right">
        <!-- Search (optional, can be enabled per page) -->
        <div class="header-search" id="header-search" style="display: none;">
          <svg class="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" class="header-search-input" placeholder="Search..." aria-label="Search">
          <kbd class="header-search-kbd">Ctrl+K</kbd>
        </div>

        <!-- User dropdown -->
        <div class="header-user">
          <button
            class="header-user-trigger"
            id="user-dropdown-trigger"
            onclick="toggleUserDropdown()"
            aria-expanded="false"
            aria-haspopup="true"
          >
            <div class="header-user-avatar">
              ${
                user.avatar
                  ? `<img src="${user.avatar}" alt="${user.name}" />`
                  : `<span class="header-user-initials">${initials}</span>`
              }
            </div>
            <span class="header-user-name">${user.name}</span>
            <svg class="header-user-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- Dropdown menu -->
          <div class="header-dropdown" id="user-dropdown" role="menu">
            <div class="header-dropdown-header">
              <div class="header-dropdown-user">
                <div class="header-dropdown-avatar">
                  ${
                    user.avatar
                      ? `<img src="${user.avatar}" alt="${user.name}" />`
                      : `<span class="header-user-initials">${initials}</span>`
                  }
                </div>
                <div class="header-dropdown-info">
                  <span class="header-dropdown-name">${user.name}</span>
                  <span class="header-dropdown-email">${user.email}</span>
                </div>
              </div>
            </div>

            <div class="header-dropdown-divider"></div>

            <nav class="header-dropdown-nav">
              <a href="/dashboard/settings" class="header-dropdown-item" role="menuitem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>Account Settings</span>
              </a>
              <a href="/dashboard/billing" class="header-dropdown-item" role="menuitem">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <path d="M1 10h22"/>
                </svg>
                <span>Billing</span>
              </a>
              <a href="/developer" class="header-dropdown-item" role="menuitem" target="_blank">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <span>API Documentation</span>
                <svg class="header-dropdown-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </nav>

            <div class="header-dropdown-divider"></div>

            <button class="header-dropdown-item header-dropdown-signout" onclick="handleSignOut()" role="menuitem">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function getHeaderStyles(): string {
  return `
    /* Dashboard Header */
    .dashboard-header {
      position: fixed;
      top: 0;
      right: 0;
      left: var(--sidebar-width);
      height: var(--header-height);
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--content-padding);
      z-index: 30;
      transition: left var(--transition-normal);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .header-menu-toggle:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .header-menu-toggle svg {
      width: 20px;
      height: 20px;
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Header Search */
    .header-search {
      position: relative;
      display: flex;
      align-items: center;
    }

    .header-search-icon {
      position: absolute;
      left: 0.875rem;
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .header-search-input {
      width: 280px;
      padding: 0.5rem 1rem;
      padding-left: 2.5rem;
      padding-right: 4rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .header-search-input:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
    }

    .header-search-input::placeholder {
      color: var(--text-muted);
    }

    .header-search-kbd {
      position: absolute;
      right: 0.625rem;
      padding: 0.125rem 0.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: inherit;
    }

    /* User Dropdown */
    .header-user {
      position: relative;
    }

    .header-user-trigger {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.375rem 0.625rem;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .header-user-trigger:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .header-user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-user-initials {
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
    }

    .header-user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .header-user-chevron {
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      transition: transform var(--transition-fast);
    }

    .header-dropdown.is-open + .header-user-trigger .header-user-chevron,
    .header-user-trigger[aria-expanded="true"] .header-user-chevron {
      transform: rotate(180deg);
    }

    /* Dropdown Menu */
    .header-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 280px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all var(--transition-fast);
      z-index: 100;
    }

    .header-dropdown.is-open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .header-dropdown-header {
      padding: 1rem;
    }

    .header-dropdown-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .header-dropdown-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-dropdown-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-dropdown-avatar .header-user-initials {
      font-size: 0.875rem;
    }

    .header-dropdown-info {
      min-width: 0;
    }

    .header-dropdown-name {
      display: block;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-dropdown-email {
      display: block;
      font-size: 0.8125rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-dropdown-divider {
      height: 1px;
      background: var(--border-color);
    }

    .header-dropdown-nav {
      padding: 0.5rem;
    }

    .header-dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.75rem;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      text-align: left;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .header-dropdown-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .header-dropdown-item svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .header-dropdown-external {
      width: 14px;
      height: 14px;
      margin-left: auto;
      color: var(--text-muted);
    }

    .header-dropdown-signout {
      color: var(--error);
    }

    .header-dropdown-signout:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .dashboard-header {
        left: 0;
      }

      .header-menu-toggle {
        display: flex;
      }

      .header-user-name {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .dashboard-header {
        padding: 0 1rem;
      }

      .header-search {
        display: none;
      }

      .header-dropdown {
        position: fixed;
        top: auto;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        border-radius: 16px 16px 0 0;
        transform: translateY(100%);
      }

      .header-dropdown.is-open {
        transform: translateY(0);
      }
    }
  `;
}
