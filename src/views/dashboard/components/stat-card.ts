/**
 * Stat Card Component
 * Displays a statistic with icon, value, label, and optional change indicator
 */

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  progress?: {
    current: number;
    max: number;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
  href?: string;
}

export function generateStatCard(props: StatCardProps): string {
  const { icon, label, value, change, progress, variant = 'default', href } = props;

  const changeHtml = change
    ? `
      <div class="stat-card-change ${change.value >= 0 ? 'positive' : 'negative'}">
        <svg class="stat-card-change-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${change.value >= 0 ? '<path d="M18 15l-6-6-6 6"/>' : '<path d="M6 9l6 6 6-6"/>'}
        </svg>
        <span>${change.value >= 0 ? '+' : ''}${change.value}%</span>
        ${change.label ? `<span class="stat-card-change-label">${change.label}</span>` : ''}
      </div>
    `
    : '';

  const progressHtml = progress
    ? `
      <div class="stat-card-progress">
        <div class="stat-card-progress-bar">
          <div class="stat-card-progress-fill" style="width: ${Math.min((progress.current / progress.max) * 100, 100)}%"></div>
        </div>
        <span class="stat-card-progress-text">${progress.current} / ${progress.max}</span>
      </div>
    `
    : '';

  const content = `
    <div class="stat-card-icon stat-card-icon-${variant}">
      ${icon}
    </div>
    <div class="stat-card-content">
      <span class="stat-card-label">${label}</span>
      <div class="stat-card-value-row">
        <span class="stat-card-value">${value}</span>
        ${changeHtml}
      </div>
      ${progressHtml}
    </div>
  `;

  if (href) {
    return `<a href="${href}" class="stat-card stat-card-${variant} stat-card-link">${content}</a>`;
  }

  return `<div class="stat-card stat-card-${variant}">${content}</div>`;
}

export function getStatCardStyles(): string {
  return `
    /* Stat Card */
    .stat-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all var(--transition-fast);
    }

    .stat-card-link {
      text-decoration: none;
    }

    .stat-card-link:hover {
      border-color: var(--border-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .stat-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      flex-shrink: 0;
      background: rgba(99, 102, 241, 0.1);
    }

    .stat-card-icon svg {
      width: 24px;
      height: 24px;
      color: var(--accent-primary);
    }

    .stat-card-icon-default {
      background: rgba(99, 102, 241, 0.1);
    }

    .stat-card-icon-default svg {
      color: var(--accent-primary);
    }

    .stat-card-icon-success {
      background: rgba(16, 185, 129, 0.1);
    }

    .stat-card-icon-success svg {
      color: var(--success);
    }

    .stat-card-icon-warning {
      background: rgba(245, 158, 11, 0.1);
    }

    .stat-card-icon-warning svg {
      color: var(--warning);
    }

    .stat-card-icon-error {
      background: rgba(239, 68, 68, 0.1);
    }

    .stat-card-icon-error svg {
      color: var(--error);
    }

    .stat-card-content {
      flex: 1;
      min-width: 0;
    }

    .stat-card-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-card-value-row {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .stat-card-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .stat-card-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
    }

    .stat-card-change.positive {
      color: var(--success);
      background: rgba(16, 185, 129, 0.1);
    }

    .stat-card-change.negative {
      color: var(--error);
      background: rgba(239, 68, 68, 0.1);
    }

    .stat-card-change-icon {
      width: 14px;
      height: 14px;
    }

    .stat-card-change-label {
      color: var(--text-muted);
      margin-left: 0.25rem;
    }

    /* Progress Bar */
    .stat-card-progress {
      margin-top: 0.75rem;
    }

    .stat-card-progress-bar {
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
    }

    .stat-card-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .stat-card-progress-text {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.375rem;
    }

    /* Grid Layout */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }

    @media (max-width: 640px) {
      .stat-card {
        padding: 1rem;
      }

      .stat-card-icon {
        width: 40px;
        height: 40px;
      }

      .stat-card-icon svg {
        width: 20px;
        height: 20px;
      }

      .stat-card-value {
        font-size: 1.5rem;
      }
    }
  `;
}
