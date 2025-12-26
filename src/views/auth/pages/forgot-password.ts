/**
 * Forgot Password Page
 * Password reset request form with success state
 */

import { generateFormInput, icons } from '../components/form-input';
import { generateFormButton } from '../components/form-button';

export interface ForgotPasswordPageConfig {
  baseUrl?: string;
  error?: string;
}

/**
 * Generate forgot password form HTML
 */
export function generateForgotPasswordForm(config: ForgotPasswordPageConfig = {}): string {
  const { error = '' } = config;

  const emailInput = generateFormInput({
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
    autocomplete: 'email',
    icon: icons.email,
  });

  const submitButton = generateFormButton({
    text: 'Send Reset Link',
    type: 'submit',
    variant: 'primary',
    fullWidth: true,
    id: 'forgot-submit',
  });

  return `
    <div class="auth-card auth-card-centered">
      <!-- State 1: Initial Form -->
      <div id="forgot-form-state" class="auth-state">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M12 16v2"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Forgot your password?</h2>
          <p class="auth-card-subtitle">Enter your email and we'll send you a reset link</p>
        </div>

        <div class="auth-card-content">
          <!-- Error Alert -->
          <div id="forgot-error" class="auth-alert auth-alert-error" role="alert" style="display: none;">
            <span class="auth-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <span id="forgot-error-text">${error}</span>
          </div>

          <!-- Forgot Password Form -->
          <form id="forgot-form" novalidate>
            ${emailInput}

            <div class="btn-group">
              ${submitButton}
            </div>
          </form>
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

      <!-- State 2: Email Sent Success -->
      <div id="forgot-success-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
              <path class="check-mark" d="M9 12l2 2 4-4" stroke-dasharray="20" stroke-dashoffset="20"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Check your email</h2>
          <p class="auth-card-subtitle">We've sent a password reset link to<br><strong id="masked-email"></strong></p>
        </div>

        <div class="auth-card-content">
          <div class="auth-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p>Didn't receive the email? Check your spam folder or request a new link.</p>
          </div>

          <div class="btn-group">
            <button type="button" class="form-btn form-btn-secondary form-btn-full" id="resend-btn" onclick="resendEmail()">
              <span class="btn-content">
                <span class="btn-text">Resend email</span>
                <span class="resend-countdown" id="resend-countdown" style="display: none;"></span>
              </span>
            </button>
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
 * Get forgot password page specific styles
 */
export function getForgotPasswordStyles(): string {
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

    /* Resend Button */
    .resend-countdown {
      margin-left: 0.5rem;
      color: var(--text-muted);
    }

    #resend-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Masked email strong */
    #masked-email {
      color: var(--text-primary);
    }
  `;
}

/**
 * Get forgot password page JavaScript
 */
export function getForgotPasswordScripts(): string {
  return `
    // Form elements
    const forgotForm = document.getElementById('forgot-form');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('forgot-submit');
    const errorAlert = document.getElementById('forgot-error');
    const errorText = document.getElementById('forgot-error-text');

    // State elements
    const formState = document.getElementById('forgot-form-state');
    const successState = document.getElementById('forgot-success-state');
    const maskedEmailEl = document.getElementById('masked-email');
    const resendBtn = document.getElementById('resend-btn');
    const resendCountdown = document.getElementById('resend-countdown');

    // Store email for resend
    let submittedEmail = '';
    let resendCooldown = 0;
    let cooldownInterval = null;

    // Mask email for display
    function maskEmail(email) {
      const [localPart, domain] = email.split('@');
      if (localPart.length <= 2) {
        return localPart[0] + '*@' + domain;
      }
      return localPart[0] + '*'.repeat(Math.min(localPart.length - 2, 5)) + localPart.slice(-1) + '@' + domain;
    }

    // Validation
    function validateEmail(value) {
      if (!value) return 'Email is required';
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
      return null;
    }

    function validateField(input) {
      const value = input.value.trim();
      const error = validateEmail(value);
      const formGroup = input.closest('.form-group');
      const errorEl = document.getElementById(input.id + '-error');

      if (error) {
        formGroup.classList.add('has-error');
        formGroup.classList.remove('has-success');
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.textContent = error;
          errorEl.style.display = 'flex';
        }
        return false;
      } else {
        formGroup.classList.remove('has-error');
        if (input.classList.contains('touched')) {
          formGroup.classList.add('has-success');
        }
        input.removeAttribute('aria-invalid');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.style.display = 'none';
        }
        return true;
      }
    }

    // Show/hide loading state
    function setLoading(isLoading) {
      if (isLoading) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        emailInput.disabled = true;
      } else {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        emailInput.disabled = false;
      }
    }

    // Show error message
    function showError(message) {
      errorText.textContent = message;
      errorAlert.style.display = 'flex';
      errorAlert.style.animation = 'shake 0.4s ease-in-out';
      setTimeout(() => {
        errorAlert.style.animation = '';
      }, 400);
    }

    // Hide error message
    function hideError() {
      errorAlert.style.display = 'none';
      errorText.textContent = '';
    }

    // Switch to success state
    function showSuccessState(email) {
      formState.style.display = 'none';
      successState.style.display = 'block';
      maskedEmailEl.textContent = maskEmail(email);
      startResendCooldown();
    }

    // Start resend cooldown
    function startResendCooldown() {
      resendCooldown = 60;
      resendBtn.disabled = true;
      updateCooldownDisplay();

      cooldownInterval = setInterval(() => {
        resendCooldown--;
        if (resendCooldown <= 0) {
          clearInterval(cooldownInterval);
          resendBtn.disabled = false;
          resendCountdown.style.display = 'none';
        } else {
          updateCooldownDisplay();
        }
      }, 1000);
    }

    function updateCooldownDisplay() {
      resendCountdown.textContent = '(' + resendCooldown + 's)';
      resendCountdown.style.display = 'inline';
    }

    // Handle form submission
    async function handleSubmit(e) {
      e.preventDefault();
      hideError();

      emailInput.classList.add('touched');
      if (!validateField(emailInput)) {
        emailInput.focus();
        return;
      }

      setLoading(true);
      submittedEmail = emailInput.value.trim();

      try {
        const response = await fetch('/api/v1/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: submittedEmail,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Failed to send reset link');
        }

        // Show success state regardless of whether email exists (security best practice)
        showSuccessState(submittedEmail);

      } catch (error) {
        console.error('Forgot password error:', error);
        // For security, show success even on error (don't reveal if email exists)
        showSuccessState(submittedEmail);
      }

      setLoading(false);
    }

    // Resend email
    async function resendEmail() {
      if (resendCooldown > 0) return;

      resendBtn.disabled = true;

      try {
        const response = await fetch('/api/v1/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: submittedEmail,
          }),
        });

        // Start cooldown regardless of response
        startResendCooldown();

      } catch (error) {
        console.error('Resend error:', error);
        startResendCooldown();
      }
    }

    // Event listeners
    if (forgotForm) {
      forgotForm.addEventListener('submit', handleSubmit);
    }

    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        this.classList.add('touched');
        validateField(this);
      });

      emailInput.addEventListener('input', function() {
        if (this.classList.contains('touched')) {
          validateField(this);
        }
        hideError();
      });

      // Auto-focus
      emailInput.focus();
    }

    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      showError(decodeURIComponent(errorParam));
    }
  `;
}

export default {
  generateForgotPasswordForm,
  getForgotPasswordStyles,
  getForgotPasswordScripts,
};
