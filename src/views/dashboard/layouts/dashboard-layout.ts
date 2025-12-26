/**
 * Dashboard Layout
 * Main layout with sidebar and header
 */

import { generateSidebar } from '../components/sidebar';
import { generateHeader } from '../components/header';
import type { DashboardPageType, DashboardUser } from '../index';

export interface DashboardLayoutProps {
  page: DashboardPageType;
  pageTitle: string;
  user: DashboardUser;
  content: string;
}

export function generateDashboardLayout(props: DashboardLayoutProps): string {
  const { page, pageTitle, user, content } = props;

  return `
    <div class="dashboard-layout">
      <!-- Sidebar Overlay (mobile) -->
      <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>

      <!-- Sidebar -->
      ${generateSidebar({ currentPage: page, user })}

      <!-- Main Content Area -->
      <div class="dashboard-main">
        <!-- Header -->
        ${generateHeader({ pageTitle, user })}

        <!-- Content -->
        <main class="dashboard-content" id="main-content" tabindex="-1">
          <div class="dashboard-content-inner">
            ${content}
          </div>
        </main>
      </div>
    </div>
  `;
}

export function getDashboardLayoutStyles(): string {
  return `
    /* Dashboard Layout */
    .dashboard-layout {
      display: flex;
      min-height: 100vh;
    }

    /* Sidebar Overlay */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: 40;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-normal);
    }

    .sidebar-overlay.is-visible {
      opacity: 1;
      visibility: visible;
    }

    /* Main Content Area */
    .dashboard-main {
      flex: 1;
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left var(--transition-normal);
    }

    /* Content Area */
    .dashboard-content {
      flex: 1;
      padding: var(--content-padding);
      padding-top: calc(var(--header-height) + var(--content-padding));
      background: var(--bg-primary);
    }

    .dashboard-content-inner {
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeIn 0.3s ease;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .dashboard-main {
        margin-left: 0;
      }

      .dashboard-content {
        padding: 1rem;
        padding-top: calc(var(--header-height) + 1rem);
      }
    }

    @media (max-width: 640px) {
      .dashboard-content {
        padding: 0.75rem;
        padding-top: calc(var(--header-height) + 0.75rem);
      }
    }

    /* Body when sidebar is open */
    body.sidebar-open {
      overflow: hidden;
    }
  `;
}
