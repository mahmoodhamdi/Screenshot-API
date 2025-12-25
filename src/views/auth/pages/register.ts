/**
 * Register Page
 * Full registration page with password strength indicator and form validation
 */

import { generateFormInput, icons } from '../components/form-input';
import { generateFormButton } from '../components/form-button';

export interface RegisterPageConfig {
  baseUrl?: string;
  error?: string;
}

/**
 * Generate register form HTML
 */
export function generateRegisterForm(config: RegisterPageConfig = {}): string {
  const { error = '' } = config;

  const nameInput = generateFormInput({
    id: 'name',
    name: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
    autocomplete: 'name',
    icon: icons.user,
  });

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

  const passwordInput = `
    <div class="form-group" id="password-group">
      <label for="password" class="form-label">
        Password
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

      <!-- Password Requirements -->
      <div class="password-requirements" id="password-requirements">
        <div class="requirement" id="req-length">
          <span class="req-icon"></span>
          <span>At least 8 characters</span>
        </div>
        <div class="requirement" id="req-number">
          <span class="req-icon"></span>
          <span>Contains a number</span>
        </div>
        <div class="requirement" id="req-special">
          <span class="req-icon"></span>
          <span>Contains a special character</span>
        </div>
        <div class="requirement" id="req-uppercase">
          <span class="req-icon"></span>
          <span>Contains an uppercase letter</span>
        </div>
      </div>

      <div id="password-error" class="form-error" role="alert" style="display: none;"></div>
    </div>
  `;

  const confirmPasswordInput = generateFormInput({
    id: 'confirmPassword',
    name: 'confirmPassword',
    type: 'password',
    label: 'Confirm Password',
    placeholder: 'Confirm your password',
    required: true,
    autocomplete: 'new-password',
    icon: icons.lock,
  });

  const submitButton = generateFormButton({
    text: 'Create Account',
    type: 'submit',
    variant: 'primary',
    fullWidth: true,
    id: 'register-submit',
  });

  return `
    <div class="auth-card">
      <div class="auth-card-header">
        <h2 class="auth-card-title">Create Account</h2>
        <p class="auth-card-subtitle">Get started with 100 free screenshots</p>
      </div>

      <div class="auth-card-content">
        <!-- Error Alert -->
        <div id="register-error" class="auth-alert auth-alert-error" role="alert" style="display: none;">
          <span class="auth-alert-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
          <span id="register-error-text">${error}</span>
        </div>

        <!-- Register Form -->
        <form id="register-form" novalidate>
          ${nameInput}
          ${emailInput}
          ${passwordInput}
          ${confirmPasswordInput}

          <!-- Terms Checkbox -->
          <div class="auth-checkbox-group">
            <label class="auth-checkbox-wrapper">
              <input type="checkbox" name="terms" class="auth-checkbox" id="terms" required>
              <span class="auth-checkbox-custom"></span>
              <span class="auth-checkbox-label">
                I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>
              </span>
            </label>
          </div>
          <div id="terms-error" class="form-error" role="alert" style="display: none;"></div>

          <!-- Submit Button -->
          <div class="btn-group">
            ${submitButton}
          </div>
        </form>

        <!-- Divider -->
        <div class="auth-divider">
          <span>or sign up with</span>
        </div>

        <!-- Social Signup Buttons -->
        <div class="auth-social">
          <button type="button" class="auth-social-btn" onclick="socialSignup('google')">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>
          <button type="button" class="auth-social-btn" onclick="socialSignup('github')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </button>
        </div>
      </div>

      <div class="auth-card-footer">
        <p>Already have an account? <a href="/login" class="auth-link">Sign in</a></p>
      </div>
    </div>
  `;
}

/**
 * Get register page specific styles
 */
export function getRegisterStyles(): string {
  return `
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

    .strength-text.weak {
      color: var(--error);
    }

    .strength-text.medium {
      color: var(--warning);
    }

    .strength-text.strong {
      color: var(--success);
    }

    /* Password Requirements List */
    .password-requirements {
      margin-top: 0.75rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    @media (max-width: 400px) {
      .password-requirements {
        grid-template-columns: 1fr;
      }
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--text-muted);
      transition: color var(--transition-fast);
    }

    .requirement.met {
      color: var(--success);
    }

    .requirement.unmet {
      color: var(--text-muted);
    }

    .req-icon {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1.5px solid currentColor;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }

    .requirement.met .req-icon {
      background: var(--success);
      border-color: var(--success);
    }

    .requirement.met .req-icon::after {
      content: '';
      width: 6px;
      height: 6px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
    }

    /* Terms Checkbox Group */
    .auth-checkbox-group {
      margin-bottom: 0.5rem;
    }

    .auth-checkbox-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
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
      margin-top: 2px;
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

    .auth-checkbox-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .auth-checkbox-label a {
      color: var(--accent-primary);
      transition: color var(--transition-fast);
    }

    .auth-checkbox-label a:hover {
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

    /* Checkbox error state */
    .auth-checkbox-group.has-error .auth-checkbox-custom {
      border-color: var(--error);
    }

    .auth-checkbox-group.has-error + .form-error {
      display: flex !important;
    }

    /* Register card adjustments for more content */
    .auth-card {
      max-width: 440px;
    }

    /* Compact form groups for register */
    #register-form .form-group {
      margin-bottom: 1rem;
    }
  `;
}

/**
 * Get register page JavaScript
 */
export function getRegisterScripts(): string {
  return `
    // Form elements
    const registerForm = document.getElementById('register-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheckbox = document.getElementById('terms');
    const submitBtn = document.getElementById('register-submit');
    const errorAlert = document.getElementById('register-error');
    const errorText = document.getElementById('register-error-text');

    // Password strength elements
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    const reqLength = document.getElementById('req-length');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    const reqUppercase = document.getElementById('req-uppercase');

    // Password requirements regex
    const requirements = {
      length: (password) => password.length >= 8,
      number: (password) => /\\d/.test(password),
      special: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: (password) => /[A-Z]/.test(password),
    };

    // Update password strength indicator
    function updatePasswordStrength(password) {
      const checks = {
        length: requirements.length(password),
        number: requirements.number(password),
        special: requirements.special(password),
        uppercase: requirements.uppercase(password),
      };

      // Update requirement indicators
      reqLength.classList.toggle('met', checks.length);
      reqLength.classList.toggle('unmet', !checks.length);
      reqNumber.classList.toggle('met', checks.number);
      reqNumber.classList.toggle('unmet', !checks.number);
      reqSpecial.classList.toggle('met', checks.special);
      reqSpecial.classList.toggle('unmet', !checks.special);
      reqUppercase.classList.toggle('met', checks.uppercase);
      reqUppercase.classList.toggle('unmet', !checks.uppercase);

      // Calculate strength
      const metCount = Object.values(checks).filter(Boolean).length;

      // Remove all classes
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

    // Validation rules
    const validators = {
      name: {
        validate: (value) => {
          if (!value) return 'Full name is required';
          if (value.length < 2) return 'Name must be at least 2 characters';
          return null;
        }
      },
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
          if (!/\\d/.test(value)) return 'Password must contain a number';
          if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain a special character';
          return null;
        }
      },
      confirmPassword: {
        validate: (value) => {
          if (!value) return 'Please confirm your password';
          if (value !== passwordInput.value) return 'Passwords do not match';
          return null;
        }
      },
      terms: {
        validate: () => {
          if (!termsCheckbox.checked) return 'You must agree to the terms';
          return null;
        }
      }
    };

    // Validate single field
    function validateField(input) {
      const fieldName = input.name || input.id;
      const value = input.type === 'checkbox' ? null : input.value.trim();
      const validator = validators[fieldName];

      if (!validator) return true;

      const error = validator.validate(value);

      if (input.type === 'checkbox') {
        const group = input.closest('.auth-checkbox-group');
        const errorEl = document.getElementById(fieldName + '-error');

        if (error) {
          if (group) group.classList.add('has-error');
          if (errorEl) {
            errorEl.textContent = error;
            errorEl.style.display = 'flex';
          }
          return false;
        } else {
          if (group) group.classList.remove('has-error');
          if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
          }
          return true;
        }
      }

      const formGroup = input.closest('.form-group');
      const errorEl = document.getElementById(fieldName + '-error');

      if (error) {
        if (formGroup) {
          formGroup.classList.add('has-error');
          formGroup.classList.remove('has-success');
        }
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.textContent = error;
          errorEl.style.display = 'flex';
        }
        return false;
      } else {
        if (formGroup) {
          formGroup.classList.remove('has-error');
          if (input.classList.contains('touched')) {
            formGroup.classList.add('has-success');
          }
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

      [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        if (input) {
          input.classList.add('touched');
          if (!validateField(input)) {
            isValid = false;
          }
        }
      });

      if (!validateField(termsCheckbox)) {
        isValid = false;
      }

      return isValid;
    }

    // Show/hide loading state
    function setLoading(isLoading) {
      if (isLoading) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        [nameInput, emailInput, passwordInput, confirmPasswordInput, termsCheckbox].forEach(input => {
          if (input) input.disabled = true;
        });
      } else {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        [nameInput, emailInput, passwordInput, confirmPasswordInput, termsCheckbox].forEach(input => {
          if (input) input.disabled = false;
        });
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
        const firstError = document.querySelector('.form-group.has-error input, .auth-checkbox-group.has-error input');
        if (firstError) firstError.focus();
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || data.message || 'Registration failed. Please try again.');
        }

        // Check if email verification is required
        if (data.data?.requiresEmailVerification) {
          window.location.href = '/verify-email?email=' + encodeURIComponent(emailInput.value.trim());
        } else {
          // Redirect to login with success message
          window.location.href = '/login?success=' + encodeURIComponent('Account created successfully! Please sign in.');
        }

      } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'An error occurred. Please try again.');
        setLoading(false);
      }
    }

    // Social signup handler
    function socialSignup(provider) {
      // TODO: Implement OAuth flow
      showError(provider.charAt(0).toUpperCase() + provider.slice(1) + ' signup is coming soon!');
    }

    // Event listeners
    if (registerForm) {
      registerForm.addEventListener('submit', handleSubmit);
    }

    // Real-time validation on blur
    [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
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

    // Terms checkbox validation
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', function() {
        validateField(this);
      });
    }

    // Clear errors when typing
    document.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('focus', hideError);
    });

    // Auto-focus name field
    if (nameInput && !nameInput.value) {
      nameInput.focus();
    }

    // Check for error message in URL
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      showError(decodeURIComponent(errorParam));
    }
  `;
}

export default {
  generateRegisterForm,
  getRegisterStyles,
  getRegisterScripts,
};
