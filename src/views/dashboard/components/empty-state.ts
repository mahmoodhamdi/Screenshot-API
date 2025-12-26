/**
 * Empty State Component
 * Placeholder for empty data states
 */

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onclick: string;
    variant?: 'primary' | 'secondary';
  };
}

export function generateEmptyState(props: EmptyStateProps): string {
  const { icon, title, description, action } = props;

  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        ${icon}
      </div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-description">${description}</p>
      ${
        action
          ? `
        <button
          class="btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}"
          onclick="${action.onclick}"
        >
          ${action.label}
        </button>
      `
          : ''
      }
    </div>
  `;
}

export function getEmptyStateStyles(): string {
  return `
    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
    }

    .empty-state-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin-bottom: 1.5rem;
      background: var(--bg-tertiary);
      border-radius: 50%;
      color: var(--text-muted);
    }

    .empty-state-icon svg {
      width: 40px;
      height: 40px;
    }

    .empty-state-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      max-width: 320px;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .empty-state .btn {
      min-width: 160px;
    }

    /* Variants */
    .empty-state-sm {
      padding: 2rem 1.5rem;
    }

    .empty-state-sm .empty-state-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
    }

    .empty-state-sm .empty-state-icon svg {
      width: 32px;
      height: 32px;
    }

    .empty-state-sm .empty-state-title {
      font-size: 1rem;
    }

    .empty-state-sm .empty-state-description {
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .empty-state-sm .btn {
      min-width: auto;
    }

    /* Inline empty state for tables */
    .empty-state-inline {
      padding: 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }
  `;
}
