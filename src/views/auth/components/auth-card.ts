/**
 * Auth Card Component
 * Glassmorphism card container for auth forms
 */

/**
 * Get auth card styles
 */
export function getAuthCardStyles(): string {
  return `
    /* Auth Card - Glassmorphism */
    .auth-card {
      background: rgba(26, 26, 36, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      animation: fadeIn 0.5s ease-out;
    }

    /* Card Header */
    .auth-card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-card-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .auth-card-subtitle {
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }

    /* Card Content - Form Container */
    .auth-card-content {
      margin-bottom: 1.5rem;
    }

    /* Card Footer */
    .auth-card-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .auth-card-footer p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .auth-card-footer .auth-link {
      color: var(--accent-primary);
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .auth-card-footer .auth-link:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    /* Alert Messages */
    .auth-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .auth-alert-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .auth-alert-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
    }

    .auth-alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: var(--error);
    }

    .auth-alert-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: var(--warning);
    }

    .auth-alert-info {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: var(--accent-primary);
    }

    /* Social Login Section */
    .auth-social {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .auth-social-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.875rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .auth-social-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .auth-social-btn:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }

    .auth-social-btn svg {
      width: 20px;
      height: 20px;
    }

    /* Remember Me / Terms Checkbox */
    .auth-checkbox-group {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .auth-checkbox {
      width: 18px;
      height: 18px;
      accent-color: var(--accent-primary);
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .auth-checkbox-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      cursor: pointer;
      line-height: 1.5;
    }

    .auth-checkbox-label a {
      color: var(--accent-primary);
      text-decoration: none;
    }

    .auth-checkbox-label a:hover {
      text-decoration: underline;
    }

    /* Forgot Password Link */
    .auth-forgot-link {
      display: block;
      text-align: right;
      font-size: 0.8125rem;
      color: var(--accent-primary);
      margin-top: -0.5rem;
      margin-bottom: 1.5rem;
      transition: color var(--transition-fast);
    }

    .auth-forgot-link:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    /* Success State Card */
    .auth-success-card {
      text-align: center;
      padding: 2rem 1rem;
    }

    .auth-success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 50%;
      color: var(--success);
    }

    .auth-success-icon svg {
      width: 40px;
      height: 40px;
      stroke-dasharray: 100;
      animation: checkmark 0.5s ease-out forwards;
    }

    .auth-success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }

    .auth-success-message {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    /* Loading Overlay */
    .auth-loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(10, 10, 15, 0.8);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      z-index: 10;
    }

    .auth-loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Mobile Adjustments */
    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
        border-radius: 12px;
      }

      .auth-card-title {
        font-size: 1.5rem;
      }

      .auth-card-header {
        margin-bottom: 1.5rem;
      }
    }
  `;
}

/**
 * Generate success card HTML
 */
export function generateSuccessCard(title: string, message: string, actionHtml?: string): string {
  return `
    <div class="auth-card">
      <div class="auth-success-card">
        <div class="auth-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 class="auth-success-title">${title}</h2>
        <p class="auth-success-message">${message}</p>
        ${actionHtml || ''}
      </div>
    </div>
  `;
}

/**
 * Generate alert HTML
 */
export function generateAlert(
  type: 'success' | 'error' | 'warning' | 'info',
  message: string
): string {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
    warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,
  };

  return `
    <div class="auth-alert auth-alert-${type}" role="alert">
      <span class="auth-alert-icon">${icons[type]}</span>
      <span>${message}</span>
    </div>
  `;
}

export default {
  getAuthCardStyles,
  generateSuccessCard,
  generateAlert,
};
