/**
 * Form Button Component
 * Primary and secondary buttons with loading and disabled states
 */

export interface FormButtonOptions {
  text: string;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'text';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  id?: string;
  onclick?: string;
}

/**
 * Generate form button HTML
 */
export function generateFormButton(options: FormButtonOptions): string {
  const {
    text,
    type = 'submit',
    variant = 'primary',
    fullWidth = true,
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    id,
    onclick,
  } = options;

  const classes = [
    'form-btn',
    `form-btn-${variant}`,
    fullWidth ? 'form-btn-full' : '',
    loading ? 'is-loading' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const loadingSpinner = `
    <span class="btn-spinner" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    </span>
  `;

  const iconHtml = icon ? `<span class="btn-icon" aria-hidden="true">${icon}</span>` : '';

  const content =
    iconPosition === 'left'
      ? `${iconHtml}<span class="btn-text">${text}</span>`
      : `<span class="btn-text">${text}</span>${iconHtml}`;

  return `
    <button
      type="${type}"
      class="${classes}"
      ${id ? `id="${id}"` : ''}
      ${disabled || loading ? 'disabled' : ''}
      ${onclick ? `onclick="${onclick}"` : ''}
      ${loading ? 'aria-busy="true"' : ''}
    >
      ${loading ? loadingSpinner : ''}
      <span class="btn-content">${content}</span>
    </button>
  `;
}

/**
 * Get form button styles
 */
export function getFormButtonStyles(): string {
  return `
    /* Base Button */
    .form-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 600;
      line-height: 1;
      text-align: center;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--transition-fast);
      -webkit-tap-highlight-color: transparent;
    }

    .form-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .form-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-btn-full {
      width: 100%;
    }

    /* Button Content */
    .btn-content {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: opacity var(--transition-fast);
    }

    .btn-icon svg {
      width: 18px;
      height: 18px;
    }

    /* Loading State */
    .form-btn.is-loading .btn-content {
      opacity: 0;
    }

    .btn-spinner {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-spinner svg {
      animation: spin 1s linear infinite;
    }

    /* Primary Button - Gradient */
    .form-btn-primary {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .form-btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .form-btn-primary:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(99, 102, 241, 0.3);
    }

    /* Secondary Button - Outline */
    .form-btn-secondary {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .form-btn-secondary:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .form-btn-secondary:active:not(:disabled) {
      background: var(--bg-secondary);
    }

    /* Text Button */
    .form-btn-text {
      background: transparent;
      color: var(--accent-primary);
      padding: 0.5rem 1rem;
    }

    .form-btn-text:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.1);
    }

    .form-btn-text:active:not(:disabled) {
      background: rgba(99, 102, 241, 0.15);
    }

    /* Link Style (for anchor elements) */
    .auth-link {
      color: var(--accent-primary);
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .auth-link:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    /* Button Group */
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .btn-group-row {
      flex-direction: row;
    }

    /* Divider with text */
    .auth-divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-size: 0.8125rem;
    }

    .auth-divider::before,
    .auth-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-color);
    }
  `;
}

export default {
  generateFormButton,
  getFormButtonStyles,
};
