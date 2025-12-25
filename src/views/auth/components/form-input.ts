/**
 * Form Input Component
 * Reusable input with label, icon, error state, and password visibility toggle
 */

export interface FormInputOptions {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  icon?: string;
  value?: string;
  error?: string;
}

/**
 * Generate form input HTML
 */
export function generateFormInput(options: FormInputOptions): string {
  const {
    id,
    name,
    type,
    label,
    placeholder = '',
    required = false,
    autocomplete = '',
    icon,
    value = '',
    error = '',
  } = options;

  const hasError = error.length > 0;
  const isPassword = type === 'password';

  const iconHtml = icon ? `<span class="input-icon" aria-hidden="true">${icon}</span>` : '';

  const passwordToggle = isPassword
    ? `
    <button
      type="button"
      class="password-toggle"
      onclick="togglePasswordVisibility('${id}', this)"
      aria-label="Show password"
    >
      <svg class="icon-show" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      <svg class="icon-hide" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  `
    : '';

  return `
    <div class="form-group${hasError ? ' has-error' : ''}">
      <label for="${id}" class="form-label">
        ${label}
        ${required ? '<span class="required-indicator" aria-hidden="true">*</span>' : ''}
      </label>
      <div class="input-wrapper${icon ? ' has-icon' : ''}${isPassword ? ' has-toggle' : ''}">
        ${iconHtml}
        <input
          type="${type}"
          id="${id}"
          name="${name}"
          class="form-input"
          placeholder="${placeholder}"
          value="${value}"
          ${required ? 'required' : ''}
          ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
          ${hasError ? 'aria-invalid="true"' : ''}
          ${hasError ? `aria-describedby="${id}-error"` : ''}
          onblur="this.classList.add('touched')"
        />
        ${passwordToggle}
      </div>
      <div id="${id}-error" class="form-error" role="alert" ${!hasError ? 'style="display: none;"' : ''}>
        ${error}
      </div>
    </div>
  `;
}

/**
 * Get form input styles
 */
export function getFormInputStyles(): string {
  return `
    /* Form Group */
    .form-group {
      margin-bottom: 1.25rem;
    }

    /* Label */
    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .required-indicator {
      color: var(--error);
      margin-left: 0.25rem;
    }

    /* Input Wrapper */
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    /* Input Icon */
    .input-icon {
      position: absolute;
      left: 1rem;
      color: var(--text-muted);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
    }

    .input-icon svg {
      width: 18px;
      height: 18px;
    }

    .input-wrapper.has-icon .form-input {
      padding-left: 2.75rem;
    }

    /* Input */
    .form-input {
      width: 100%;
      padding: 0.875rem 1rem;
      font-family: inherit;
      font-size: 0.9375rem;
      color: var(--text-primary);
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      transition: all var(--transition-fast);
    }

    .form-input::placeholder {
      color: var(--text-muted);
    }

    /* Focus State */
    .form-input:focus {
      outline: none;
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
    }

    .form-input:focus + .input-icon,
    .input-wrapper:focus-within .input-icon {
      color: var(--accent-primary);
    }

    /* Hover State */
    .form-input:hover:not(:focus):not(:disabled) {
      border-color: var(--border-hover);
    }

    /* Disabled State */
    .form-input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--bg-secondary);
    }

    /* Error State */
    .form-group.has-error .form-input,
    .form-input.has-error {
      border-color: var(--error);
    }

    .form-group.has-error .form-input:focus,
    .form-input.has-error:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .form-group.has-error .input-icon {
      color: var(--error);
    }

    /* Error Message */
    .form-error {
      font-size: 0.8125rem;
      color: var(--error);
      margin-top: 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .form-error::before {
      content: '';
      width: 14px;
      height: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='12'/%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'/%3E%3C/svg%3E");
      background-size: contain;
      flex-shrink: 0;
    }

    /* Password Toggle */
    .input-wrapper.has-toggle .form-input {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 6px;
      transition: all var(--transition-fast);
    }

    .password-toggle:hover {
      color: var(--text-secondary);
      background: var(--bg-hover);
    }

    .password-toggle:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    /* Valid State (after user interaction) */
    .form-input.touched:valid:not(:focus) {
      border-color: var(--success);
    }

    .form-input.touched:valid:not(:focus) + .input-icon,
    .input-wrapper:has(.form-input.touched:valid:not(:focus)) .input-icon {
      color: var(--success);
    }

    /* Autofill Styling */
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus {
      -webkit-text-fill-color: var(--text-primary);
      -webkit-box-shadow: 0 0 0px 1000px var(--bg-input) inset;
      transition: background-color 5000s ease-in-out 0s;
    }
  `;
}

// Icon templates
export const icons = {
  email: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>`,
  lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>`,
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>`,
};

export default {
  generateFormInput,
  getFormInputStyles,
  icons,
};
