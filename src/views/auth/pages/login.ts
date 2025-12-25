/**
 * Login Page
 * Full login page with form validation and API integration
 */

import { generateFormInput, icons } from '../components/form-input';
import { generateFormButton } from '../components/form-button';

export interface LoginPageConfig {
  baseUrl?: string;
  error?: string;
  email?: string;
}

/**
 * Generate login form HTML
 */
export function generateLoginForm(config: LoginPageConfig = {}): string {
  const { error = '', email = '' } = config;

  const emailInput = generateFormInput({
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
    autocomplete: 'email',
    icon: icons.email,
    value: email,
  });

  const passwordInput = generateFormInput({
    id: 'password',
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    autocomplete: 'current-password',
    icon: icons.lock,
  });

  const submitButton = generateFormButton({
    text: 'Sign In',
    type: 'submit',
    variant: 'primary',
    fullWidth: true,
    id: 'login-submit',
  });

  return `
    <div class="auth-card">
      <div class="auth-card-header">
        <h2 class="auth-card-title">Welcome Back</h2>
        <p class="auth-card-subtitle">Sign in to continue to your account</p>
      </div>

      <div class="auth-card-content">
        <!-- Error Alert -->
        <div id="login-error" class="auth-alert auth-alert-error" role="alert" style="display: none;">
          <span class="auth-alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
          <span id="login-error-text">${error}</span>
        </div>

        <!-- Login Form -->
        <form id="login-form" novalidate>
          ${emailInput}
          ${passwordInput}

          <!-- Remember Me & Forgot Password Row -->
          <div class="auth-form-options">
            <label class="auth-checkbox-wrapper">
              <input type="checkbox" name="remember" class="auth-checkbox" id="remember">
              <span class="auth-checkbox-custom"></span>
              <span class="auth-checkbox-label">Remember me</span>
            </label>
            <a href="/forgot-password" class="auth-forgot-link">Forgot password?</a>
          </div>

          <!-- Submit Button -->
          <div class="btn-group">
            ${submitButton}
          </div>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or continue with</span>
        </div>

        <!-- Social Login Buttons -->
        <div class="auth-social">
          <button type="button" class="auth-social-btn" onclick="socialLogin('google')">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>
          <button type="button" class="auth-social-btn" onclick="socialLogin('github')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>
      </div>

      <div class="auth-card-footer">
        <p>Don't have an account? <a href="/register" class="auth-link">Sign up</a></p>
      </div>
    </div>
  `;
}

/**
 * Get login page specific styles
 */
export function getLoginStyles(): string {
  return `
    /* Form Options Row */
    .auth-form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    /* Custom Checkbox */
    .auth-checkbox-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .auth-checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .auth-checkbox-custom {
      width: 18px;
      height: 18px;
      border: 2px solid var(--border-color);
      border-radius: 4px;
      background: var(--bg-input);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      flex-shrink: 0;
    }

    .auth-checkbox-custom::after {
      content: '';
      width: 10px;
      height: 10px;
      background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E") center/contain no-repeat;
      opacity: 0;
      transform: scale(0);
      transition: all var(--transition-fast);
    }

    .auth-checkbox:checked + .auth-checkbox-custom {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      border-color: var(--accent-primary);
    }

    .auth-checkbox:checked + .auth-checkbox-custom::after {
      opacity: 1;
      transform: scale(1);
    }

    .auth-checkbox:focus-visible + .auth-checkbox-custom {
      box-shadow: var(--focus-ring);
    }

    .auth-checkbox-wrapper:hover .auth-checkbox-custom {
      border-color: var(--border-hover);
    }

    .auth-checkbox-wrapper .auth-checkbox-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    /* Forgot Password Link */
    .auth-form-options .auth-forgot-link {
      font-size: 0.875rem;
      color: var(--accent-primary);
      transition: color var(--transition-fast);
    }

    .auth-form-options .auth-forgot-link:hover {
      color: var(--accent-secondary);
      text-decoration: underline;
    }

    /* Social Buttons Layout */
    .auth-social {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (max-width: 400px) {
      .auth-social {
        grid-template-columns: 1fr;
      }
    }

    /* Form Validation Styles */
    .form-group.has-error .form-input {
      border-color: var(--error);
      animation: shake 0.4s ease-in-out;
    }

    .form-group.has-success .form-input {
      border-color: var(--success);
    }

    .form-group.has-success .input-icon {
      color: var(--success);
    }

    /* Success Icon Animation */
    .auth-success-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 50%;
      margin-bottom: 1rem;
    }

    .auth-success-check svg {
      width: 32px;
      height: 32px;
      color: var(--success);
      stroke-dasharray: 100;
      stroke-dashoffset: 100;
      animation: checkDraw 0.5s ease forwards 0.2s;
    }

    @keyframes checkDraw {
      to {
        stroke-dashoffset: 0;
      }
    }

    /* Loading Overlay for Form */
    .form-loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(10, 10, 15, 0.7);
      backdrop-filter: blur(2px);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      z-index: 10;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast);
    }

    .form-loading-overlay.active {
      opacity: 1;
      visibility: visible;
    }
  `;
}

/**
 * Get login page JavaScript
 */
export function getLoginScripts(): string {
  return `
    // Form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('login-submit');
    const errorAlert = document.getElementById('login-error');
    const errorText = document.getElementById('login-error-text');

    // Validation rules
    const validators = {
      email: {
        validate: (value) => {
          if (!value) return 'Email is required';
          const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          if (!emailRegex.test(value)) return 'Please enter a valid email address';
          return null;
        }
      },
      password: {
        validate: (value) => {
          if (!value) return 'Password is required';
          if (value.length < 8) return 'Password must be at least 8 characters';
          return null;
        }
      }
    };

    // Validate single field
    function validateField(input) {
      const fieldName = input.name;
      const value = input.value.trim();
      const validator = validators[fieldName];

      if (!validator) return true;

      const error = validator.validate(value);
      const formGroup = input.closest('.form-group');
      const errorEl = document.getElementById(fieldName + '-error');

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

    // Validate entire form
    function validateForm() {
      let isValid = true;

      [emailInput, passwordInput].forEach(input => {
        input.classList.add('touched');
        if (!validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    }

    // Show/hide loading state
    function setLoading(isLoading) {
      if (isLoading) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        emailInput.disabled = true;
        passwordInput.disabled = true;
      } else {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        emailInput.disabled = false;
        passwordInput.disabled = false;
      }
    }

    // Show error message
    function showError(message) {
      errorText.textContent = message;
      errorAlert.style.display = 'flex';
      errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Shake animation
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

    // Handle form submission
    async function handleSubmit(e) {
      e.preventDefault();
      hideError();

      // Validate form
      if (!validateForm()) {
        const firstError = document.querySelector('.form-group.has-error input');
        if (firstError) firstError.focus();
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailInput.value.trim(),
            password: passwordInput.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Invalid email or password');
        }

        // Store tokens
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        if (data.data?.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }

        // Store remember me preference
        const rememberMe = document.getElementById('remember').checked;
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to dashboard or intended destination
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/developer';
        window.location.href = redirectUrl;

      } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'An error occurred. Please try again.');
        setLoading(false);
      }
    }

    // Social login handler
    function socialLogin(provider) {
      // TODO: Implement OAuth flow
      showError(provider.charAt(0).toUpperCase() + provider.slice(1) + ' login is coming soon!');
    }

    // Event listeners
    if (loginForm) {
      loginForm.addEventListener('submit', handleSubmit);
    }

    // Real-time validation on blur
    [emailInput, passwordInput].forEach(input => {
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

    // Clear errors when typing
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('focus', hideError);
    });

    // Handle enter key on password field
    if (passwordInput) {
      passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          handleSubmit(e);
        }
      });
    }

    // Auto-focus email field
    if (emailInput && !emailInput.value) {
      emailInput.focus();
    }

    // Check for error message in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      showError(decodeURIComponent(errorParam));
    }

    // Check for success message (e.g., after password reset)
    const successParam = urlParams.get('success');
    if (successParam) {
      const successAlert = document.createElement('div');
      successAlert.className = 'auth-alert auth-alert-success';
      successAlert.setAttribute('role', 'alert');
      successAlert.innerHTML = \`
        <span class="auth-alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </span>
        <span>\${decodeURIComponent(successParam)}</span>
      \`;
      const cardContent = document.querySelector('.auth-card-content');
      if (cardContent) {
        cardContent.insertBefore(successAlert, cardContent.firstChild);
      }
    }
  `;
}

export default {
  generateLoginForm,
  getLoginStyles,
  getLoginScripts,
};
