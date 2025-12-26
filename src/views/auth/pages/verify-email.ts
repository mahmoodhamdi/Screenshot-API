/**
 * Verify Email Page
 * Email verification with auto-verify on load
 */

import { generateFormInput, icons } from '../components/form-input';
import { generateFormButton } from '../components/form-button';

export interface VerifyEmailPageConfig {
  baseUrl?: string;
  token?: string;
  email?: string;
}

/**
 * Generate verify email page HTML
 */
export function generateVerifyEmailForm(config: VerifyEmailPageConfig = {}): string {
  const { token = '', email = '' } = config;

  const emailInput = generateFormInput({
    id: 'resend-email',
    name: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
    autocomplete: 'email',
    icon: icons.email,
    value: email,
  });

  const resendButton = generateFormButton({
    text: 'Resend Verification Email',
    type: 'submit',
    variant: 'primary',
    fullWidth: true,
    id: 'resend-submit',
  });

  return `
    <div class="auth-card auth-card-centered">
      <!-- State 1: Verifying -->
      <div id="verify-loading-state" class="auth-state" ${!token ? 'style="display: none;"' : ''}>
        <div class="auth-card-header">
          <div class="auth-loading-icon">
            <svg class="spinner" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Verifying your email...</h2>
          <p class="auth-card-subtitle">Please wait while we confirm your email address</p>
        </div>
      </div>

      <!-- State 2: Success -->
      <div id="verify-success-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
              <path class="check-mark" d="M9 12l2 2 4-4" stroke-dasharray="20" stroke-dashoffset="20"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Email Verified!</h2>
          <p class="auth-card-subtitle">Your email has been successfully verified</p>
        </div>

        <div class="auth-card-content">
          <div class="auth-info-box auth-info-success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>You can now access all features of your account.</p>
          </div>

          <div class="btn-group">
            <a href="/login" class="form-btn form-btn-primary form-btn-full">
              <span class="btn-content">
                <span class="btn-text">Continue to Sign In</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- State 3: Already Verified -->
      <div id="verify-already-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Already Verified</h2>
          <p class="auth-card-subtitle">This email has already been verified</p>
        </div>

        <div class="auth-card-content">
          <div class="btn-group">
            <a href="/login" class="form-btn form-btn-primary form-btn-full">
              <span class="btn-content">
                <span class="btn-text">Go to Sign In</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <!-- State 4: Invalid/Expired Token -->
      <div id="verify-invalid-state" class="auth-state" style="display: none;">
        <div class="auth-card-header">
          <div class="auth-icon-wrapper auth-icon-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Verification Failed</h2>
          <p class="auth-card-subtitle">This verification link is invalid or has expired</p>
        </div>

        <div class="auth-card-content">
          <!-- Error Alert -->
          <div id="resend-error" class="auth-alert auth-alert-error" role="alert" style="display: none;">
            <span class="auth-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <span id="resend-error-text"></span>
          </div>

          <!-- Success Alert for Resend -->
          <div id="resend-success" class="auth-alert auth-alert-success" role="alert" style="display: none;">
            <span class="auth-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            <span id="resend-success-text">Verification email sent! Check your inbox.</span>
          </div>

          <div class="auth-info-box auth-info-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p>Verification links expire after 24 hours. Enter your email below to receive a new verification link.</p>
          </div>

          <!-- Resend Form -->
          <form id="resend-form" novalidate>
            ${emailInput}

            <div class="btn-group">
              ${resendButton}
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

      <!-- State 5: Pending Verification (no token, just registered) -->
      <div id="verify-pending-state" class="auth-state" ${token ? 'style="display: none;"' : ''}>
        <div class="auth-card-header">
          <div class="auth-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 class="auth-card-title">Verify Your Email</h2>
          <p class="auth-card-subtitle">We've sent a verification link to<br><strong id="pending-email">${email}</strong></p>
        </div>

        <div class="auth-card-content">
          <!-- Success Alert for Resend -->
          <div id="pending-resend-success" class="auth-alert auth-alert-success" role="alert" style="display: none;">
            <span class="auth-alert-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </span>
            <span>Verification email sent!</span>
          </div>

          <div class="auth-info-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p>Click the link in your email to verify your account. Check your spam folder if you don't see it.</p>
          </div>

          <div class="btn-group">
            <button type="button" class="form-btn form-btn-secondary form-btn-full" id="pending-resend-btn" onclick="resendPendingEmail()">
              <span class="btn-content">
                <span class="btn-text">Resend verification email</span>
                <span class="resend-countdown" id="pending-countdown" style="display: none;"></span>
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
 * Get verify email page specific styles
 */
export function getVerifyEmailStyles(): string {
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

    .auth-info-box.auth-info-success {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }

    .auth-info-box.auth-info-success svg {
      color: var(--success);
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

    /* Pending email strong */
    #pending-email {
      color: var(--text-primary);
    }

    /* Resend countdown */
    .resend-countdown {
      margin-left: 0.5rem;
      color: var(--text-muted);
    }
  `;
}

/**
 * Get verify email page JavaScript
 */
export function getVerifyEmailScripts(): string {
  return `
    // State elements
    const loadingState = document.getElementById('verify-loading-state');
    const successState = document.getElementById('verify-success-state');
    const alreadyState = document.getElementById('verify-already-state');
    const invalidState = document.getElementById('verify-invalid-state');
    const pendingState = document.getElementById('verify-pending-state');

    // Resend form elements
    const resendForm = document.getElementById('resend-form');
    const resendEmailInput = document.getElementById('resend-email');
    const resendSubmitBtn = document.getElementById('resend-submit');
    const resendError = document.getElementById('resend-error');
    const resendErrorText = document.getElementById('resend-error-text');
    const resendSuccess = document.getElementById('resend-success');

    // Pending resend elements
    const pendingResendBtn = document.getElementById('pending-resend-btn');
    const pendingCountdown = document.getElementById('pending-countdown');
    const pendingResendSuccess = document.getElementById('pending-resend-success');

    // Get token and email from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const emailParam = urlParams.get('email');

    let resendCooldown = 0;

    // Show specific state
    function showState(stateName) {
      [loadingState, successState, alreadyState, invalidState, pendingState].forEach(el => {
        if (el) el.style.display = 'none';
      });

      switch(stateName) {
        case 'loading':
          if (loadingState) loadingState.style.display = 'block';
          break;
        case 'success':
          if (successState) successState.style.display = 'block';
          break;
        case 'already':
          if (alreadyState) alreadyState.style.display = 'block';
          break;
        case 'invalid':
          if (invalidState) invalidState.style.display = 'block';
          break;
        case 'pending':
          if (pendingState) pendingState.style.display = 'block';
          break;
      }
    }

    // Verify email with token
    async function verifyEmail() {
      if (!token) {
        showState('pending');
        return;
      }

      showState('loading');

      try {
        const response = await fetch('/api/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          showState('success');
        } else if (response.status === 400 && data.error?.message?.includes('already verified')) {
          showState('already');
        } else {
          showState('invalid');
          if (emailParam && resendEmailInput) {
            resendEmailInput.value = emailParam;
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        showState('invalid');
      }
    }

    // Resend verification email (from invalid state)
    async function handleResendSubmit(e) {
      e.preventDefault();

      if (!resendEmailInput) return;

      const email = resendEmailInput.value.trim();
      if (!email) {
        showResendError('Please enter your email address');
        return;
      }

      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        showResendError('Please enter a valid email address');
        return;
      }

      setResendLoading(true);

      try {
        const response = await fetch('/api/v1/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        // Show success regardless (don't reveal if email exists)
        hideResendError();
        if (resendSuccess) resendSuccess.style.display = 'flex';

        setResendLoading(false);
        startCooldown(resendSubmitBtn, null);

      } catch (error) {
        console.error('Resend error:', error);
        if (resendSuccess) resendSuccess.style.display = 'flex';
        setResendLoading(false);
        startCooldown(resendSubmitBtn, null);
      }
    }

    // Resend for pending state
    async function resendPendingEmail() {
      if (resendCooldown > 0) return;

      const email = emailParam || '';
      if (!email) return;

      pendingResendBtn.disabled = true;

      try {
        await fetch('/api/v1/auth/resend-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (pendingResendSuccess) pendingResendSuccess.style.display = 'flex';
        startCooldown(pendingResendBtn, pendingCountdown);

      } catch (error) {
        console.error('Resend error:', error);
        if (pendingResendSuccess) pendingResendSuccess.style.display = 'flex';
        startCooldown(pendingResendBtn, pendingCountdown);
      }
    }

    // Start cooldown timer
    function startCooldown(btn, countdownEl) {
      resendCooldown = 60;
      btn.disabled = true;

      const interval = setInterval(() => {
        resendCooldown--;
        if (countdownEl) {
          countdownEl.textContent = '(' + resendCooldown + 's)';
          countdownEl.style.display = 'inline';
        }

        if (resendCooldown <= 0) {
          clearInterval(interval);
          btn.disabled = false;
          if (countdownEl) countdownEl.style.display = 'none';
        }
      }, 1000);

      if (countdownEl) {
        countdownEl.textContent = '(' + resendCooldown + 's)';
        countdownEl.style.display = 'inline';
      }
    }

    // Loading state
    function setResendLoading(isLoading) {
      if (resendSubmitBtn) {
        resendSubmitBtn.classList.toggle('is-loading', isLoading);
        resendSubmitBtn.disabled = isLoading;
      }
      if (resendEmailInput) resendEmailInput.disabled = isLoading;
    }

    // Error handling
    function showResendError(message) {
      if (resendErrorText) resendErrorText.textContent = message;
      if (resendError) resendError.style.display = 'flex';
      if (resendSuccess) resendSuccess.style.display = 'none';
    }

    function hideResendError() {
      if (resendError) resendError.style.display = 'none';
      if (resendErrorText) resendErrorText.textContent = '';
    }

    // Event listeners
    if (resendForm) {
      resendForm.addEventListener('submit', handleResendSubmit);
    }

    // Verify on page load
    verifyEmail();
  `;
}

export default {
  generateVerifyEmailForm,
  getVerifyEmailStyles,
  getVerifyEmailScripts,
};
