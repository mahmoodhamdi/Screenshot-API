/**
 * Reset Password Page
 * Create new password after receiving reset link
 */

import { icons } from '../components/form-input';
import { generateFormButton } from '../components/form-button';

export interface ResetPasswordPageConfig {
  baseUrl?: string;
  token?: string;
  error?: string;
}

/**
 * Generate reset password form HTML
 */
export function generateResetPasswordForm(config: ResetPasswordPageConfig = {}): string {
  const { token = '' } = config;

  const submitButton = generateFormButton({
    text: 'Reset Password',
    type: 'submit',
    variant: 'primary',
    fullWidth: true,
    id: 'reset-submit',
  });

  return `
    <div class="auth-card auth-card-centered">
      <!-- State 1: Validating Token -->
      <div id="reset-validating-state" class="auth-state">
        <div class="auth-card-header">
          <div class="auth-loading-icon">
            <svg class="spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Validating reset link...</h2>
          <p class="auth-card-subtitle">Please wait while we verify your reset token</p>
        </div>
      </div>

      <!-- State 2: Valid Token - Show Form -->
      <div id="reset-form-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <path d="M12 17v-3"/>
              <path d="M10 14l2 2 2-2"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Create new password</h2>
          <p class="auth-card-subtitle">Enter a new secure password for your account</p>
        </div>

        <div class="auth-card-content">
          <!-- Error Alert -->
          <div id="reset-error" class="auth-alert auth-alert-error" role="alert" style="display: none;">
            <span class="auth-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <span id="reset-error-text"></span>
          </div>

          <!-- Reset Password Form -->
          <form id="reset-form" novalidate>
            <input type="hidden" id="reset-token" name="token" value="${token}">

            <!-- New Password -->
            <div class="form-group" id="password-group">
              <label for="password" class="form-label">
                New Password
                <span class="required-indicator" aria-hidden="true">*</span>
              </label>
              <div class="input-wrapper has-icon has-toggle">
                <span class="input-icon" aria-hidden="true">${icons.lock}</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  class="form-input"
                  placeholder="Create a strong password"
                  required
                  autocomplete="new-password"
                  onblur="this.classList.add('touched')"
                  oninput="updatePasswordStrength(this.value)"
                />
                <button
                  type="button"
                  class="password-toggle"
                  onclick="togglePasswordVisibility('password', this)"
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
              </div>

              <!-- Password Strength Indicator -->
              <div class="password-strength" id="password-strength">
                <div class="strength-bar">
                  <div class="strength-fill" id="strength-fill"></div>
                </div>
                <span class="strength-text" id="strength-text"></span>
              </div>

              <div id="password-error" class="form-error" role="alert" style="display: none;"></div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                Confirm Password
                <span class="required-indicator" aria-hidden="true">*</span>
              </label>
              <div class="input-wrapper has-icon has-toggle">
                <span class="input-icon" aria-hidden="true">${icons.lock}</span>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  class="form-input"
                  placeholder="Confirm your password"
                  required
                  autocomplete="new-password"
                  onblur="this.classList.add('touched')"
                />
                <button
                  type="button"
                  class="password-toggle"
                  onclick="togglePasswordVisibility('confirmPassword', this)"
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
              </div>
              <div id="confirmPassword-error" class="form-error" role="alert" style="display: none;"></div>
            </div>

            <div class="btn-group">
              ${submitButton}
            </div>
          </form>
        </div>
      </div>

      <!-- State 3: Success -->
      <div id="reset-success-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline class="check-mark" points="22 4 12 14.01 9 11.01" stroke-dasharray="30" stroke-dashoffset="30"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Password reset successful</h2>
          <p class="auth-card-subtitle">Your password has been updated successfully</p>
        </div>

        <div class="auth-card-content">
          <div class="btn-group">
            <a href="/login" class="form-btn form-btn-primary form-btn-full">
              <span class="btn-content">
                <span class="btn-text">Sign in with new password</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- State 4: Invalid/Expired Token -->
      <div id="reset-invalid-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Invalid or expired link</h2>
          <p class="auth-card-subtitle">This password reset link is no longer valid</p>
        </div>

        <div class="auth-card-content">
          <div class="auth-info-box auth-info-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p>Password reset links expire after 1 hour for security. Please request a new link.</p>
          </div>

          <div class="btn-group">
            <a href="/forgot-password" class="form-btn form-btn-primary form-btn-full">
              <span class="btn-content">
                <span class="btn-text">Request new reset link</span>
              </span>
            </a>
          </div>
        </div>

        <div class="auth-card-footer">
          <a href="/login" class="auth-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to login
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Get reset password page specific styles
 */
export function getResetPasswordStyles(): string {
  return `
    /* Centered Card */
    .auth-card-centered {
      max-width: 420px;
      text-align: center;
    }

    .auth-card-centered .auth-card-header {
      text-align: center;
    }

    .auth-card-centered .form-label {
      text-align: left;
    }

    /* Loading Icon */
    .auth-loading-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 50%;
      color: var(--accent-primary);
    }

    .auth-loading-icon .spinner {
      animation: spin 1.5s linear infinite;
    }

    /* Auth Icon Wrapper */
    .auth-icon-wrapper {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 50%;
      color: var(--accent-primary);
    }

    .auth-icon-wrapper.auth-icon-success {
      background: rgba(16, 185, 129, 0.1);
      color: var(--success);
    }

    .auth-icon-wrapper.auth-icon-error {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    /* Check mark animation */
    .auth-icon-success .check-mark {
      animation: drawCheck 0.5s ease forwards 0.3s;
    }

    @keyframes drawCheck {
      to {
        stroke-dashoffset: 0;
      }
    }

    /* State transitions */
    .auth-state {
      animation: fadeIn 0.3s ease;
    }

    /* Back to login link */
    .auth-back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      transition: color var(--transition-fast);
    }

    .auth-back-link:hover {
      color: var(--accent-primary);
    }

    .auth-back-link svg {
      transition: transform var(--transition-fast);
    }

    .auth-back-link:hover svg {
      transform: translateX(-2px);
    }

    /* Info Box */
    .auth-info-box {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 10px;
      margin-bottom: 1.5rem;
      text-align: left;
    }

    .auth-info-box.auth-info-warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
    }

    .auth-info-box.auth-info-warning svg {
      color: var(--warning);
    }

    .auth-info-box svg {
      flex-shrink: 0;
      color: var(--accent-primary);
    }

    .auth-info-box p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    /* Password Strength Indicator */
    .password-strength {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .strength-bar {
      flex: 1;
      height: 4px;
      background: var(--bg-hover);
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      width: 0%;
      border-radius: 2px;
      transition: all var(--transition-normal);
    }

    .strength-fill.weak {
      width: 33%;
      background: var(--error);
    }

    .strength-fill.medium {
      width: 66%;
      background: var(--warning);
    }

    .strength-fill.strong {
      width: 100%;
      background: var(--success);
    }

    .strength-text {
      font-size: 0.75rem;
      font-weight: 500;
      min-width: 60px;
      text-align: right;
    }

    .strength-text.weak { color: var(--error); }
    .strength-text.medium { color: var(--warning); }
    .strength-text.strong { color: var(--success); }
  `;
}

/**
 * Get reset password page JavaScript
 */
export function getResetPasswordScripts(): string {
  return `
    // State elements
    const validatingState = document.getElementById('reset-validating-state');
    const formState = document.getElementById('reset-form-state');
    const successState = document.getElementById('reset-success-state');
    const invalidState = document.getElementById('reset-invalid-state');

    // Form elements
    const resetForm = document.getElementById('reset-form');
    const tokenInput = document.getElementById('reset-token');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('reset-submit');
    const errorAlert = document.getElementById('reset-error');
    const errorText = document.getElementById('reset-error-text');

    // Password strength elements
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Update password strength indicator
    function updatePasswordStrength(password) {
      const checks = {
        length: password.length >= 8,
        number: /\\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        uppercase: /[A-Z]/.test(password),
      };

      const metCount = Object.values(checks).filter(Boolean).length;

      strengthFill.classList.remove('weak', 'medium', 'strong');
      strengthText.classList.remove('weak', 'medium', 'strong');

      if (password.length === 0) {
        strengthFill.style.width = '0%';
        strengthText.textContent = '';
        return;
      }

      if (metCount <= 1) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak';
      } else if (metCount <= 3) {
        strengthFill.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium';
      } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong';
      }
    }

    // Show specific state
    function showState(stateName) {
      [validatingState, formState, successState, invalidState].forEach(el => {
        if (el) el.style.display = 'none';
      });

      switch(stateName) {
        case 'validating':
          if (validatingState) validatingState.style.display = 'block';
          break;
        case 'form':
          if (formState) formState.style.display = 'block';
          if (passwordInput) passwordInput.focus();
          break;
        case 'success':
          if (successState) successState.style.display = 'block';
          break;
        case 'invalid':
          if (invalidState) invalidState.style.display = 'block';
          break;
      }
    }

    // Validate token on page load
    async function validateToken() {
      if (!token) {
        showState('invalid');
        return;
      }

      // Set token in hidden field
      if (tokenInput) tokenInput.value = token;

      try {
        const response = await fetch('/api/v1/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          showState('form');
        } else {
          showState('invalid');
        }
      } catch (error) {
        // If endpoint doesn't exist, just show the form
        showState('form');
      }
    }

    // Validation
    const validators = {
      password: {
        validate: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 8) return 'Password must be at least 8 characters';
          return null;
        }
      },
      confirmPassword: {
        validate: (value) => {
          if (!value) return 'Please confirm your password';
          if (value !== passwordInput.value) return 'Passwords do not match';
          return null;
        }
      }
    };

    function validateField(input) {
      const fieldName = input.name || input.id;
      const value = input.value;
      const validator = validators[fieldName];

      if (!validator) return true;

      const error = validator.validate(value);
      const formGroup = input.closest('.form-group');
      const errorEl = document.getElementById(fieldName + '-error');

      if (error) {
        if (formGroup) formGroup.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.textContent = error;
          errorEl.style.display = 'flex';
        }
        return false;
      } else {
        if (formGroup) formGroup.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
        }
        return true;
      }
    }

    function validateForm() {
      let isValid = true;
      [passwordInput, confirmPasswordInput].forEach(input => {
        if (input) {
          input.classList.add('touched');
          if (!validateField(input)) isValid = false;
        }
      });
      return isValid;
    }

    // Loading state
    function setLoading(isLoading) {
      if (submitBtn) {
        submitBtn.classList.toggle('is-loading', isLoading);
        submitBtn.disabled = isLoading;
      }
      if (passwordInput) passwordInput.disabled = isLoading;
      if (confirmPasswordInput) confirmPasswordInput.disabled = isLoading;
    }

    // Show/hide error
    function showError(message) {
      if (errorText) errorText.textContent = message;
      if (errorAlert) {
        errorAlert.style.display = 'flex';
        errorAlert.style.animation = 'shake 0.4s ease-in-out';
        setTimeout(() => { errorAlert.style.animation = ''; }, 400);
      }
    }

    function hideError() {
      if (errorAlert) errorAlert.style.display = 'none';
      if (errorText) errorText.textContent = '';
    }

    // Handle form submission
    async function handleSubmit(e) {
      e.preventDefault();
      hideError();

      if (!validateForm()) {
        const firstError = document.querySelector('.form-group.has-error input');
        if (firstError) firstError.focus();
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/v1/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token,
            password: passwordInput.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400 && data.error?.message?.includes('expired')) {
            showState('invalid');
            return;
          }
          throw new Error(data.error?.message || data.message || 'Failed to reset password');
        }

        showState('success');

      } catch (error) {
        console.error('Reset password error:', error);
        showError(error.message || 'An error occurred. Please try again.');
        setLoading(false);
      }
    }

    // Event listeners
    if (resetForm) {
      resetForm.addEventListener('submit', handleSubmit);
    }

    [passwordInput, confirmPasswordInput].forEach(input => {
      if (input) {
        input.addEventListener('blur', function() {
          this.classList.add('touched');
          validateField(this);
        });

        input.addEventListener('input', function() {
          if (this.classList.contains('touched')) {
            validateField(this);
          }
          hideError();
        });
      }
    });

    // Validate confirm password when password changes
    if (passwordInput) {
      passwordInput.addEventListener('input', function() {
        if (confirmPasswordInput && confirmPasswordInput.classList.contains('touched')) {
          validateField(confirmPasswordInput);
        }
      });
    }

    // Start validation on page load
    validateToken();
  `;
}

export default {
  generateResetPasswordForm,
  getResetPasswordStyles,
  getResetPasswordScripts,
};
