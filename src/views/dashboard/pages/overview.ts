/**
 * Overview Page
 * Dashboard home with stats, recent activity, and quick actions
 */

import type { DashboardUser, DashboardPageConfig } from '../index';
import { generateStatCard } from '../components/stat-card';

export interface OverviewData {
  stats: {
    screenshotsThisMonth: number;
    screenshotsLimit: number;
    apiCallsToday: number;
    successRate: number;
    avgResponseTime: number;
  };
  recentScreenshots: Array<{
    id: string;
    url: string;
    thumbnailUrl?: string;
    status: 'completed' | 'pending' | 'failed';
    createdAt: string;
  }>;
  usageByDay: Array<{
    date: string;
    count: number;
  }>;
  plan: {
    name: string;
    screenshotsRemaining: number;
    daysUntilReset: number;
  };
}

export function generateOverviewPage(config: DashboardPageConfig): string {
  const { user } = config;
  const firstName = user.name.split(' ')[0];
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!-- Welcome Section -->
    ${generateWelcomeSection(firstName, currentDate)}

    <!-- Quick Actions -->
    ${generateQuickActionsBar()}

    <!-- Stats Grid -->
    ${generateStatsSection()}

    <!-- Main Content Grid -->
    <div class="overview-grid">
      <!-- Recent Activity -->
      <div class="overview-main">
        ${generateRecentActivitySection()}
        ${generateUsageChartSection()}
      </div>

      <!-- Sidebar -->
      <div class="overview-sidebar">
        ${generateQuickCaptureCard()}
        ${generatePlanStatusCard(user)}
        ${generateQuickLinksCard()}
      </div>
    </div>
  `;
}

function generateWelcomeSection(firstName: string, date: string): string {
  return `
    <section class="overview-welcome">
      <div class="overview-welcome-content">
        <h2 class="overview-welcome-title">Welcome back, ${firstName}!</h2>
        <p class="overview-welcome-date">${date}</p>
      </div>
    </section>
  `;
}

function generateQuickActionsBar(): string {
  return `
    <section class="overview-actions-bar">
      <button class="btn btn-primary" onclick="openNewScreenshotModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        New Screenshot
      </button>
      <a href="/dashboard/api-keys" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
        </svg>
        View API Keys
      </a>
      <a href="/developer" class="btn btn-ghost" target="_blank">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        API Docs
      </a>
    </section>
  `;
}

function generateStatsSection(): string {
  const screenshotsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>`;

  const apiCallsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>`;

  const successIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`;

  const speedIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`;

  return `
    <section class="overview-stats">
      <div class="stats-grid" id="stats-grid">
        ${generateStatCard({
          icon: screenshotsIcon,
          label: 'Screenshots This Month',
          value: '—',
          progress: { current: 0, max: 100 },
        })}
        ${generateStatCard({
          icon: apiCallsIcon,
          label: 'API Calls Today',
          value: '—',
          change: { value: 0, label: 'vs yesterday' },
        })}
        ${generateStatCard({
          icon: successIcon,
          label: 'Success Rate',
          value: '—',
          variant: 'success',
        })}
        ${generateStatCard({
          icon: speedIcon,
          label: 'Avg Response Time',
          value: '—',
        })}
      </div>
    </section>
  `;
}

function generateRecentActivitySection(): string {
  return `
    <section class="overview-section">
      <div class="overview-section-header">
        <h3 class="overview-section-title">Recent Screenshots</h3>
        <a href="/dashboard/screenshots" class="overview-section-link">
          View All
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>
      </div>
      <div class="recent-screenshots" id="recent-screenshots">
        <div class="overview-loading">
          <div class="overview-loading-spinner"></div>
          <span>Loading recent screenshots...</span>
        </div>
      </div>
    </section>
  `;
}

function generateUsageChartSection(): string {
  return `
    <section class="overview-section">
      <div class="overview-section-header">
        <h3 class="overview-section-title">Usage (Last 7 Days)</h3>
        <a href="/dashboard/usage" class="overview-section-link">
          View Analytics
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </a>
      </div>
      <div class="usage-chart" id="usage-chart">
        <div class="usage-chart-bars">
          ${Array.from({ length: 7 })
            .map(
              (_, i) => `
            <div class="usage-chart-bar-wrapper" data-day="${i}">
              <div class="usage-chart-bar" style="height: 0%"></div>
              <span class="usage-chart-label">${getDayLabel(i)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </section>
  `;
}

function getDayLabel(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - (6 - daysAgo));
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function generateQuickCaptureCard(): string {
  return `
    <div class="overview-card">
      <h4 class="overview-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
        Quick Capture
      </h4>
      <p class="overview-card-description">Capture a screenshot instantly</p>
      <form class="quick-capture-form" id="quick-capture-form" onsubmit="handleQuickCapture(event)">
        <div class="quick-capture-input-group">
          <input
            type="url"
            id="quick-capture-url"
            class="quick-capture-input"
            placeholder="https://example.com"
            required
          />
          <button type="submit" class="btn btn-primary quick-capture-btn" id="quick-capture-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Capture
          </button>
        </div>
      </form>
    </div>
  `;
}

function generatePlanStatusCard(user: DashboardUser): string {
  const planNames: Record<string, string> = {
    free: 'Free Plan',
    starter: 'Starter Plan',
    professional: 'Professional Plan',
    enterprise: 'Enterprise Plan',
  };

  const planLimits: Record<string, number> = {
    free: 100,
    starter: 1000,
    professional: 10000,
    enterprise: 100000,
  };

  return `
    <div class="overview-card plan-status-card">
      <h4 class="overview-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Your Plan
      </h4>
      <div class="plan-status-info">
        <span class="plan-status-name" id="plan-name">${planNames[user.plan]}</span>
        <span class="plan-status-badge badge-${user.plan === 'free' ? 'secondary' : 'primary'}">${user.plan.toUpperCase()}</span>
      </div>
      <div class="plan-status-usage" id="plan-usage">
        <div class="plan-status-progress">
          <div class="plan-status-progress-bar">
            <div class="plan-status-progress-fill" style="width: 0%"></div>
          </div>
          <span class="plan-status-progress-text">— / ${planLimits[user.plan]} screenshots</span>
        </div>
        <span class="plan-status-reset">Resets in — days</span>
      </div>
      ${
        user.plan !== 'enterprise'
          ? `
        <a href="/dashboard/billing" class="btn btn-primary btn-sm plan-upgrade-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          Upgrade Plan
        </a>
      `
          : ''
      }
    </div>
  `;
}

function generateQuickLinksCard(): string {
  return `
    <div class="overview-card">
      <h4 class="overview-card-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        Quick Links
      </h4>
      <nav class="quick-links">
        <a href="/developer" class="quick-link" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
          API Documentation
        </a>
        <a href="/docs" class="quick-link" target="_blank">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          Swagger UI
        </a>
        <a href="/dashboard/settings" class="quick-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Account Settings
        </a>
        <a href="mailto:support@screenshot-api.dev" class="quick-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Get Help
        </a>
      </nav>
    </div>
  `;
}

export function getOverviewStyles(): string {
  return `
    /* Overview Welcome */
    .overview-welcome {
      margin-bottom: 1.5rem;
    }

    .overview-welcome-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .overview-welcome-date {
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    /* Quick Actions Bar */
    .overview-actions-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .overview-actions-bar .btn svg {
      width: 18px;
      height: 18px;
    }

    /* Stats Section */
    .overview-stats {
      margin-bottom: 1.5rem;
    }

    /* Overview Grid */
    .overview-grid {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
    }

    .overview-main {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      min-width: 0;
    }

    .overview-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Overview Section */
    .overview-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .overview-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .overview-section-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .overview-section-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--accent-primary);
      transition: color var(--transition-fast);
    }

    .overview-section-link:hover {
      color: var(--accent-secondary);
    }

    .overview-section-link svg {
      width: 16px;
      height: 16px;
    }

    /* Loading State */
    .overview-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .overview-loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Recent Screenshots */
    .recent-screenshots-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .recent-screenshot-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all var(--transition-fast);
    }

    .recent-screenshot-item:hover {
      background: var(--bg-hover);
      transform: translateX(4px);
    }

    .recent-screenshot-thumbnail {
      width: 64px;
      height: 48px;
      border-radius: 6px;
      background: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    }

    .recent-screenshot-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .recent-screenshot-thumbnail svg {
      width: 24px;
      height: 24px;
      color: var(--text-muted);
    }

    .recent-screenshot-info {
      flex: 1;
      min-width: 0;
    }

    .recent-screenshot-url {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    .recent-screenshot-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .recent-screenshot-date {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .recent-screenshot-status {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .status-completed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .status-failed {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .recent-screenshots-empty {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .recent-screenshots-empty svg {
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }

    .recent-screenshots-empty h4 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .recent-screenshots-empty p {
      font-size: 0.8125rem;
      margin-bottom: 1rem;
    }

    /* Usage Chart */
    .usage-chart {
      padding: 1rem 0;
    }

    .usage-chart-bars {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 120px;
      gap: 0.5rem;
    }

    .usage-chart-bar-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .usage-chart-bar {
      width: 100%;
      max-width: 40px;
      background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 4px 4px 0 0;
      transition: height 0.5s ease;
      margin-top: auto;
    }

    .usage-chart-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }

    /* Overview Card */
    .overview-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }

    .overview-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .overview-card-title svg {
      width: 18px;
      height: 18px;
      color: var(--accent-primary);
    }

    .overview-card-description {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    /* Quick Capture Form */
    .quick-capture-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .quick-capture-input {
      flex: 1;
      padding: 0.625rem 0.875rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .quick-capture-input:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .quick-capture-input::placeholder {
      color: var(--text-muted);
    }

    .quick-capture-btn {
      flex-shrink: 0;
    }

    .quick-capture-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Plan Status Card */
    .plan-status-card {
      border-left: 3px solid var(--accent-primary);
    }

    .plan-status-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .plan-status-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .plan-status-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }

    .badge-secondary {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .badge-primary {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .plan-status-usage {
      margin-bottom: 1rem;
    }

    .plan-status-progress {
      margin-bottom: 0.5rem;
    }

    .plan-status-progress-bar {
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 0.375rem;
    }

    .plan-status-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .plan-status-progress-text {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .plan-status-reset {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .plan-upgrade-btn {
      width: 100%;
    }

    .plan-upgrade-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Quick Links */
    .quick-links {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .quick-link {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0.75rem;
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      transition: all var(--transition-fast);
    }

    .quick-link:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .quick-link svg {
      width: 16px;
      height: 16px;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }

      .overview-sidebar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    }

    @media (max-width: 640px) {
      .overview-welcome-title {
        font-size: 1.5rem;
      }

      .overview-actions-bar {
        flex-direction: column;
      }

      .overview-actions-bar .btn {
        width: 100%;
      }

      .quick-capture-input-group {
        flex-direction: column;
      }

      .quick-capture-btn {
        width: 100%;
      }
    }
  `;
}

export function getOverviewScripts(): string {
  return `
    // Overview page initialization
    async function initOverview() {
      await Promise.all([
        loadOverviewStats(),
        loadRecentScreenshots(),
        loadUsageChart(),
        loadPlanStatus(),
      ]);
    }

    // Load overview stats
    async function loadOverviewStats() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          console.log('No auth token, using demo data');
          updateStatsWithDemoData();
          return;
        }

        const response = await fetch('/api/v1/analytics/overview', {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load stats');
        }

        const data = await response.json();
        updateStatsDisplay(data.data);
      } catch (error) {
        console.error('Error loading stats:', error);
        updateStatsWithDemoData();
      }
    }

    function updateStatsWithDemoData() {
      // Demo data for unauthenticated or error states
      const demoData = {
        screenshotsThisMonth: 45,
        screenshotsLimit: 100,
        apiCallsToday: 156,
        apiCallsChange: 12,
        successRate: 98.5,
        avgResponseTime: 1.2,
      };
      updateStatsDisplay(demoData);
    }

    function updateStatsDisplay(data) {
      const statsGrid = document.getElementById('stats-grid');
      if (!statsGrid) return;

      const cards = statsGrid.querySelectorAll('.stat-card');

      // Screenshots this month
      if (cards[0]) {
        const value = cards[0].querySelector('.stat-card-value');
        const progressFill = cards[0].querySelector('.stat-card-progress-fill');
        const progressText = cards[0].querySelector('.stat-card-progress-text');

        if (value) value.textContent = data.screenshotsThisMonth || 0;
        if (progressFill) {
          const percent = ((data.screenshotsThisMonth || 0) / (data.screenshotsLimit || 100)) * 100;
          progressFill.style.width = Math.min(percent, 100) + '%';
        }
        if (progressText) {
          progressText.textContent = (data.screenshotsThisMonth || 0) + ' / ' + (data.screenshotsLimit || 100);
        }
      }

      // API calls today
      if (cards[1]) {
        const value = cards[1].querySelector('.stat-card-value');
        const change = cards[1].querySelector('.stat-card-change span');

        if (value) value.textContent = data.apiCallsToday || 0;
        if (change && data.apiCallsChange !== undefined) {
          const changeEl = cards[1].querySelector('.stat-card-change');
          if (changeEl) {
            changeEl.className = 'stat-card-change ' + (data.apiCallsChange >= 0 ? 'positive' : 'negative');
          }
          change.textContent = (data.apiCallsChange >= 0 ? '+' : '') + data.apiCallsChange + '%';
        }
      }

      // Success rate
      if (cards[2]) {
        const value = cards[2].querySelector('.stat-card-value');
        if (value) value.textContent = (data.successRate || 0).toFixed(1) + '%';
      }

      // Avg response time
      if (cards[3]) {
        const value = cards[3].querySelector('.stat-card-value');
        if (value) value.textContent = (data.avgResponseTime || 0).toFixed(1) + 's';
      }
    }

    // Load recent screenshots
    async function loadRecentScreenshots() {
      const container = document.getElementById('recent-screenshots');
      if (!container) return;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showEmptyScreenshots(container);
          return;
        }

        const response = await fetch('/api/v1/screenshots?limit=5', {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load screenshots');
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
          showEmptyScreenshots(container);
          return;
        }

        renderRecentScreenshots(container, data.data);
      } catch (error) {
        console.error('Error loading screenshots:', error);
        showEmptyScreenshots(container);
      }
    }

    function showEmptyScreenshots(container) {
      container.innerHTML = \`
        <div class="recent-screenshots-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <h4>No screenshots yet</h4>
          <p>Capture your first screenshot to see it here</p>
          <button class="btn btn-primary btn-sm" onclick="openNewScreenshotModal()">
            Capture Screenshot
          </button>
        </div>
      \`;
    }

    function renderRecentScreenshots(container, screenshots) {
      const html = \`
        <div class="recent-screenshots-list">
          \${screenshots.map(s => \`
            <a href="/dashboard/screenshots/\${s._id || s.id}" class="recent-screenshot-item">
              <div class="recent-screenshot-thumbnail">
                \${s.result?.url
                  ? \`<img src="\${s.result.url}" alt="Screenshot" loading="lazy" />\`
                  : \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>\`
                }
              </div>
              <div class="recent-screenshot-info">
                <span class="recent-screenshot-url">\${s.options?.url || s.url || 'Unknown URL'}</span>
                <div class="recent-screenshot-meta">
                  <span class="recent-screenshot-date">\${formatDate(s.createdAt)}</span>
                  <span class="recent-screenshot-status status-\${s.status}">\${s.status}</span>
                </div>
              </div>
            </a>
          \`).join('')}
        </div>
      \`;
      container.innerHTML = html;
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
      if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
      if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';

      return date.toLocaleDateString();
    }

    // Load usage chart
    async function loadUsageChart() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

        // Generate demo data for now
        const demoData = [];
        for (let i = 6; i >= 0; i--) {
          demoData.push({
            date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 20) + 5,
          });
        }

        renderUsageChart(demoData);
      } catch (error) {
        console.error('Error loading usage chart:', error);
      }
    }

    function renderUsageChart(data) {
      const maxCount = Math.max(...data.map(d => d.count), 1);

      data.forEach((item, index) => {
        const bar = document.querySelector(\`.usage-chart-bar-wrapper[data-day="\${index}"] .usage-chart-bar\`);
        if (bar) {
          const height = (item.count / maxCount) * 100;
          setTimeout(() => {
            bar.style.height = height + '%';
          }, index * 100);
        }
      });
    }

    // Load plan status
    async function loadPlanStatus() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          updatePlanDisplay({ screenshotsUsed: 45, screenshotsLimit: 100, daysUntilReset: 23 });
          return;
        }

        const response = await fetch('/api/v1/subscriptions/usage', {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load plan status');
        }

        const data = await response.json();
        updatePlanDisplay(data.data);
      } catch (error) {
        console.error('Error loading plan status:', error);
        updatePlanDisplay({ screenshotsUsed: 45, screenshotsLimit: 100, daysUntilReset: 23 });
      }
    }

    function updatePlanDisplay(data) {
      const progressFill = document.querySelector('.plan-status-progress-fill');
      const progressText = document.querySelector('.plan-status-progress-text');
      const resetText = document.querySelector('.plan-status-reset');

      if (progressFill) {
        const percent = ((data.screenshotsUsed || 0) / (data.screenshotsLimit || 100)) * 100;
        progressFill.style.width = Math.min(percent, 100) + '%';
      }

      if (progressText) {
        progressText.textContent = (data.screenshotsUsed || 0) + ' / ' + (data.screenshotsLimit || 100) + ' screenshots';
      }

      if (resetText) {
        resetText.textContent = 'Resets in ' + (data.daysUntilReset || 30) + ' days';
      }
    }

    // Quick capture form
    async function handleQuickCapture(event) {
      event.preventDefault();

      const urlInput = document.getElementById('quick-capture-url');
      const submitBtn = document.getElementById('quick-capture-btn');
      const url = urlInput.value.trim();

      if (!url) return;

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="overview-loading-spinner"></span> Capturing...';

        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showToast('Please log in to capture screenshots', 'warning');
          window.location.href = '/login?redirect=/dashboard';
          return;
        }

        const response = await fetch('/api/v1/screenshots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to capture screenshot');
        }

        const data = await response.json();
        showToast('Screenshot captured successfully!', 'success');
        urlInput.value = '';

        // Reload recent screenshots
        await loadRecentScreenshots();
        await loadOverviewStats();
      } catch (error) {
        console.error('Quick capture error:', error);
        showToast(error.message || 'Failed to capture screenshot', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = \`
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          Capture
        \`;
      }
    }

    // Placeholder for new screenshot modal
    function openNewScreenshotModal() {
      // Will be implemented in Phase 3
      showToast('New Screenshot modal coming soon!', 'info');
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initOverview);
  `;
}
