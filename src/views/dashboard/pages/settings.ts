/**
 * Settings Page
 * Account settings, profile, security, notifications, and danger zone
 */

export function generateSettingsPage(): string {
  return `
    <div class="settings-page">
      <div class="page-header">
        <h1>Settings</h1>
        <p class="page-description">Manage your account settings and preferences</p>
      </div>

      <div class="settings-layout">
        <!-- Settings Navigation -->
        <nav class="settings-nav">
          <a href="#profile" class="settings-nav-item active" data-section="profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </a>
          <a href="#security" class="settings-nav-item" data-section="security">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Security
          </a>
          <a href="#notifications" class="settings-nav-item" data-section="notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            Notifications
          </a>
          <a href="#danger" class="settings-nav-item danger" data-section="danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Danger Zone
          </a>
        </nav>

        <!-- Settings Content -->
        <div class="settings-content">
          <!-- Profile Section -->
          <section id="profile" class="settings-section">
            <div class="section-header">
              <h2>Profile</h2>
              <p>Manage your personal information</p>
            </div>

            <form id="profile-form" onsubmit="handleProfileUpdate(event)">
              <div class="profile-avatar-section">
                <div class="avatar-container">
                  <div class="avatar" id="user-avatar">
                    <span class="avatar-initials" id="avatar-initials">JD</span>
                  </div>
                  <button type="button" class="avatar-upload-btn" onclick="triggerAvatarUpload()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </button>
                  <input type="file" id="avatar-input" accept="image/*" style="display: none;" onchange="handleAvatarChange(event)">
                </div>
                <div class="avatar-info">
                  <p>Upload a new avatar</p>
                  <span>JPG, PNG or GIF. Max 2MB.</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="profile-name">Full Name</label>
                  <input type="text" id="profile-name" name="name" value="John Doe" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="profile-email">Email Address</label>
                  <div class="input-with-action">
                    <input type="email" id="profile-email" name="email" value="john@example.com" readonly>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="openChangeEmailModal()">
                      Change
                    </button>
                  </div>
                  <span class="form-hint">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Email verified
                  </span>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="save-profile-btn">
                  <span class="btn-text">Save Changes</span>
                  <span class="btn-loader" style="display: none;">
                    <svg class="spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </section>

          <!-- Security Section -->
          <section id="security" class="settings-section">
            <div class="section-header">
              <h2>Security</h2>
              <p>Manage your password and security settings</p>
            </div>

            <!-- Change Password -->
            <div class="settings-card">
              <div class="settings-card-header">
                <div class="settings-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div class="settings-card-info">
                  <h3>Change Password</h3>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
              </div>

              <form id="password-form" onsubmit="handlePasswordChange(event)">
                <div class="form-group">
                  <label for="current-password">Current Password</label>
                  <div class="password-input">
                    <input type="password" id="current-password" name="currentPassword" required>
                    <button type="button" class="password-toggle" onclick="togglePasswordVisibility('current-password')">
                      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label for="new-password">New Password</label>
                  <div class="password-input">
                    <input type="password" id="new-password" name="newPassword" required oninput="checkPasswordStrength(this.value)">
                    <button type="button" class="password-toggle" onclick="togglePasswordVisibility('new-password')">
                      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    </button>
                  </div>
                  <div class="password-strength" id="password-strength">
                    <div class="strength-bar">
                      <div class="strength-fill" id="strength-fill"></div>
                    </div>
                    <span class="strength-text" id="strength-text">Enter a password</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="confirm-password">Confirm New Password</label>
                  <div class="password-input">
                    <input type="password" id="confirm-password" name="confirmPassword" required>
                    <button type="button" class="password-toggle" onclick="togglePasswordVisibility('confirm-password')">
                      <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      <svg class="eye-off-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" id="update-password-btn">
                    <span class="btn-text">Update Password</span>
                    <span class="btn-loader" style="display: none;">
                      <svg class="spinner" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Two-Factor Authentication -->
            <div class="settings-card">
              <div class="settings-card-header">
                <div class="settings-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div class="settings-card-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="2fa-toggle" onchange="handle2FAToggle(this.checked)">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <div class="twofa-setup" id="2fa-setup" style="display: none;">
                <div class="twofa-qr">
                  <div class="qr-placeholder" id="qr-code">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <p>Scan this QR code with your authenticator app</p>
                </div>
                <div class="twofa-verify">
                  <label for="2fa-code">Enter verification code</label>
                  <input type="text" id="2fa-code" placeholder="000000" maxlength="6" pattern="[0-9]{6}">
                  <button class="btn btn-primary" onclick="verify2FA()">Verify & Enable</button>
                </div>
              </div>
            </div>

            <!-- Active Sessions -->
            <div class="settings-card">
              <div class="settings-card-header">
                <div class="settings-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                </div>
                <div class="settings-card-info">
                  <h3>Active Sessions</h3>
                  <p>Manage devices where you're currently logged in</p>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="signOutAllDevices()">
                  Sign out all devices
                </button>
              </div>
              <div class="sessions-list" id="sessions-list">
                <div class="session-item current">
                  <div class="session-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div class="session-info">
                    <div class="session-device">
                      <span class="device-name">Chrome on Windows</span>
                      <span class="session-badge">Current</span>
                    </div>
                    <div class="session-details">
                      <span>Cairo, Egypt</span>
                      <span class="separator">•</span>
                      <span>Active now</span>
                    </div>
                  </div>
                </div>
                <div class="session-item">
                  <div class="session-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="5" y="2" width="14" height="20" rx="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  </div>
                  <div class="session-info">
                    <div class="session-device">
                      <span class="device-name">Safari on iPhone</span>
                    </div>
                    <div class="session-details">
                      <span>Cairo, Egypt</span>
                      <span class="separator">•</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="signOutSession('session_2')">
                    Sign out
                  </button>
                </div>
                <div class="session-item">
                  <div class="session-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div class="session-info">
                    <div class="session-device">
                      <span class="device-name">Firefox on macOS</span>
                    </div>
                    <div class="session-details">
                      <span>Alexandria, Egypt</span>
                      <span class="separator">•</span>
                      <span>3 days ago</span>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-sm" onclick="signOutSession('session_3')">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Notifications Section -->
          <section id="notifications" class="settings-section">
            <div class="section-header">
              <h2>Notifications</h2>
              <p>Manage your email notification preferences</p>
            </div>

            <div class="settings-card">
              <div class="notifications-list">
                <div class="notification-item">
                  <div class="notification-info">
                    <h4>Weekly Usage Report</h4>
                    <p>Receive a weekly summary of your API usage and statistics</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" name="notifications" value="weekly_report" checked onchange="updateNotificationPref(this)">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="notification-item">
                  <div class="notification-info">
                    <h4>Screenshot Failures</h4>
                    <p>Get notified when a screenshot capture fails</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" name="notifications" value="screenshot_failures" checked onchange="updateNotificationPref(this)">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="notification-item">
                  <div class="notification-info">
                    <h4>Account Updates</h4>
                    <p>Important notifications about your account and billing</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" name="notifications" value="account_updates" checked onchange="updateNotificationPref(this)">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="notification-item">
                  <div class="notification-info">
                    <h4>Product Updates</h4>
                    <p>News about new features and improvements</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" name="notifications" value="product_updates" onchange="updateNotificationPref(this)">
                    <span class="toggle-slider"></span>
                  </label>
                </div>

                <div class="notification-item">
                  <div class="notification-info">
                    <h4>Marketing Emails</h4>
                    <p>Tips, special offers, and promotional content</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" name="notifications" value="marketing" onchange="updateNotificationPref(this)">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- Danger Zone Section -->
          <section id="danger" class="settings-section">
            <div class="section-header danger">
              <h2>Danger Zone</h2>
              <p>Irreversible actions that affect your account</p>
            </div>

            <div class="settings-card danger-card">
              <div class="danger-item">
                <div class="danger-info">
                  <h4>Delete Account</h4>
                  <p>Permanently delete your account and all associated data. This action cannot be undone.</p>
                </div>
                <button class="btn btn-danger" onclick="openDeleteAccountModal()">
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- Change Email Modal -->
      <div class="modal-overlay" id="change-email-modal" style="display: none;">
        <div class="modal">
          <div class="modal-header">
            <h2>Change Email Address</h2>
            <button class="modal-close" onclick="closeChangeEmailModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form id="change-email-form" onsubmit="handleEmailChange(event)">
            <div class="modal-body">
              <div class="form-group">
                <label for="new-email">New Email Address</label>
                <input type="email" id="new-email" name="newEmail" required>
              </div>
              <div class="form-group">
                <label for="email-password">Current Password</label>
                <input type="password" id="email-password" name="password" required>
                <span class="form-hint">We'll send a verification link to your new email</span>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeChangeEmailModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">Send Verification</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete Account Modal -->
      <div class="modal-overlay" id="delete-account-modal" style="display: none;">
        <div class="modal modal-danger">
          <div class="modal-header">
            <h2>Delete Account</h2>
            <button class="modal-close" onclick="closeDeleteAccountModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form id="delete-account-form" onsubmit="handleDeleteAccount(event)">
            <div class="modal-body">
              <div class="delete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div>
                  <p><strong>This action is permanent and cannot be undone.</strong></p>
                  <p>All your data, including screenshots, API keys, and usage history will be permanently deleted.</p>
                </div>
              </div>

              <div class="form-group">
                <label for="delete-confirmation">Type <strong>DELETE</strong> to confirm</label>
                <input type="text" id="delete-confirmation" name="confirmation" required pattern="DELETE" placeholder="DELETE">
              </div>

              <div class="form-group">
                <label for="delete-password">Enter your password</label>
                <input type="password" id="delete-password" name="password" required>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeDeleteAccountModal()">Cancel</button>
              <button type="submit" class="btn btn-danger" id="confirm-delete-account-btn">
                <span class="btn-text">Delete My Account</span>
                <span class="btn-loader" style="display: none;">
                  <svg class="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                  </svg>
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function getSettingsStyles(): string {
  return `
    /* Settings Page */
    .settings-page {
      max-width: 1200px;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .page-description {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin: 0;
    }

    /* Settings Layout */
    .settings-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .settings-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Settings Navigation */
    .settings-nav {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      position: sticky;
      top: calc(var(--header-height) + 24px);
      height: fit-content;
    }

    @media (max-width: 768px) {
      .settings-nav {
        flex-direction: row;
        overflow-x: auto;
        position: static;
        padding-bottom: 0.5rem;
        gap: 0.5rem;
      }
    }

    .settings-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      border-radius: 8px;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    .settings-nav-item svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .settings-nav-item:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .settings-nav-item.active {
      background: var(--bg-card);
      color: var(--accent-primary);
    }

    .settings-nav-item.danger {
      color: var(--error);
    }

    .settings-nav-item.danger:hover {
      background: rgba(239, 68, 68, 0.1);
    }

    .settings-nav-item.danger.active {
      background: rgba(239, 68, 68, 0.15);
    }

    /* Settings Content */
    .settings-content {
      min-width: 0;
    }

    .settings-section {
      margin-bottom: 2.5rem;
    }

    .section-header {
      margin-bottom: 1.25rem;
    }

    .section-header h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .section-header p {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    .section-header.danger h2 {
      color: var(--error);
    }

    /* Settings Card */
    .settings-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .settings-card:last-child {
      margin-bottom: 0;
    }

    .settings-card-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .settings-card-header:last-child {
      margin-bottom: 0;
    }

    .settings-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: var(--bg-tertiary);
      border-radius: 10px;
      color: var(--accent-primary);
      flex-shrink: 0;
    }

    .settings-card-icon svg {
      width: 22px;
      height: 22px;
    }

    .settings-card-info {
      flex: 1;
      min-width: 0;
    }

    .settings-card-info h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .settings-card-info p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Profile Avatar */
    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .avatar-container {
      position: relative;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-initials {
      font-size: 1.75rem;
      font-weight: 600;
      color: white;
    }

    .avatar-upload-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 28px;
      height: 28px;
      background: var(--bg-card);
      border: 2px solid var(--bg-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-primary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .avatar-upload-btn:hover {
      background: var(--accent-primary);
      color: white;
    }

    .avatar-upload-btn svg {
      width: 14px;
      height: 14px;
    }

    .avatar-info p {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 0.25rem;
    }

    .avatar-info span {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    /* Form Styles */
    .form-row {
      margin-bottom: 1.25rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-group input[type="text"],
    .form-group input[type="email"],
    .form-group input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
    }

    .form-group input:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .form-group input[readonly] {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      cursor: not-allowed;
    }

    .form-hint {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: var(--success);
      margin-top: 0.375rem;
    }

    .form-hint svg {
      width: 14px;
      height: 14px;
    }

    .input-with-action {
      display: flex;
      gap: 0.5rem;
    }

    .input-with-action input {
      flex: 1;
    }

    .form-actions {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    /* Password Input */
    .password-input {
      position: relative;
    }

    .password-input input {
      padding-right: 44px;
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .password-toggle:hover {
      color: var(--text-primary);
    }

    .password-toggle svg {
      width: 18px;
      height: 18px;
    }

    /* Password Strength */
    .password-strength {
      margin-top: 0.5rem;
    }

    .strength-bar {
      height: 4px;
      background: var(--bg-tertiary);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 0.375rem;
    }

    .strength-fill {
      height: 100%;
      width: 0;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .strength-fill.weak { width: 25%; background: var(--error); }
    .strength-fill.fair { width: 50%; background: var(--warning); }
    .strength-fill.good { width: 75%; background: #84cc16; }
    .strength-fill.strong { width: 100%; background: var(--success); }

    .strength-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .strength-text.weak { color: var(--error); }
    .strength-text.fair { color: var(--warning); }
    .strength-text.good { color: #84cc16; }
    .strength-text.strong { color: var(--success); }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      transition: all var(--transition-fast);
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 2px;
      bottom: 2px;
      background: white;
      border-radius: 50%;
      transition: all var(--transition-fast);
    }

    .toggle-switch input:checked + .toggle-slider {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .toggle-switch input:checked + .toggle-slider:before {
      transform: translateX(20px);
    }

    .toggle-switch input:focus + .toggle-slider {
      box-shadow: var(--focus-ring);
    }

    /* 2FA Setup */
    .twofa-setup {
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
      margin-top: 1rem;
    }

    .twofa-qr {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .qr-placeholder {
      width: 160px;
      height: 160px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.75rem;
      color: var(--text-muted);
    }

    .qr-placeholder svg {
      width: 48px;
      height: 48px;
    }

    .twofa-qr p {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .twofa-verify {
      max-width: 280px;
      margin: 0 auto;
      text-align: center;
    }

    .twofa-verify label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    .twofa-verify input {
      width: 100%;
      padding: 0.75rem;
      text-align: center;
      font-size: 1.25rem;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.5em;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .twofa-verify input:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    /* Sessions List */
    .sessions-list {
      border-top: 1px solid var(--border-color);
      margin-top: 1rem;
      padding-top: 1rem;
    }

    .session-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .session-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .session-icon {
      width: 40px;
      height: 40px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .session-icon svg {
      width: 20px;
      height: 20px;
    }

    .session-info {
      flex: 1;
      min-width: 0;
    }

    .session-device {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
    }

    .device-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .session-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border-radius: 4px;
      text-transform: uppercase;
    }

    .session-details {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .session-details .separator {
      margin: 0 0.375rem;
    }

    /* Notifications */
    .notifications-list {
      display: flex;
      flex-direction: column;
    }

    .notification-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .notification-item:first-child {
      padding-top: 0;
    }

    .notification-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .notification-info {
      flex: 1;
    }

    .notification-info h4 {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-primary);
      margin: 0 0 0.25rem;
    }

    .notification-info p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Danger Zone */
    .danger-card {
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.05);
    }

    .danger-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .danger-info h4 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--error);
      margin: 0 0 0.25rem;
    }

    .danger-info p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 440px;
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-header h2 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .modal-close {
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .modal-close:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .modal-close svg {
      width: 18px;
      height: 18px;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }

    .modal-danger .delete-warning {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      margin-bottom: 1.25rem;
    }

    .modal-danger .delete-warning svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--error);
    }

    .modal-danger .delete-warning p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .modal-danger .delete-warning p + p {
      margin-top: 0.25rem;
    }

    /* Button loader */
    .btn-loader {
      display: inline-flex;
    }

    .spinner {
      width: 18px;
      height: 18px;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 640px) {
      .profile-avatar-section {
        flex-direction: column;
        text-align: center;
      }

      .danger-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .danger-item .btn {
        width: 100%;
      }

      .session-item {
        flex-wrap: wrap;
      }

      .session-item .btn {
        margin-left: auto;
      }
    }
  `;
}

export function getSettingsScripts(): string {
  return `
    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      initSettingsNav();
      loadUserProfile();
    });

    // Settings navigation
    function initSettingsNav() {
      const navItems = document.querySelectorAll('.settings-nav-item');
      const sections = document.querySelectorAll('.settings-section');

      navItems.forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const sectionId = this.getAttribute('data-section');

          // Update active state
          navItems.forEach(nav => nav.classList.remove('active'));
          this.classList.add('active');

          // Scroll to section
          const section = document.getElementById(sectionId);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Update active nav on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            navItems.forEach(nav => {
              nav.classList.toggle('active', nav.getAttribute('data-section') === sectionId);
            });
          }
        });
      }, { threshold: 0.3 });

      sections.forEach(section => observer.observe(section));
    }

    // Load user profile
    async function loadUserProfile() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/me', {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data;

          // Update form fields
          document.getElementById('profile-name').value = user.name || '';
          document.getElementById('profile-email').value = user.email || '';

          // Update avatar initials
          const initials = getInitials(user.name || 'User');
          document.getElementById('avatar-initials').textContent = initials;

          // Update avatar image if available
          if (user.avatar) {
            const avatarEl = document.getElementById('user-avatar');
            avatarEl.innerHTML = '<img src="' + user.avatar + '" alt="Avatar">';
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }

    function getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Avatar upload
    function triggerAvatarUpload() {
      document.getElementById('avatar-input').click();
    }

    async function handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showToast('File size must be less than 2MB', 'error');
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onload = function(e) {
        const avatarEl = document.getElementById('user-avatar');
        avatarEl.innerHTML = '<img src="' + e.target.result + '" alt="Avatar">';
      };
      reader.readAsDataURL(file);

      // Upload would happen here
      showToast('Avatar updated successfully', 'success');
    }

    // Profile update
    async function handleProfileUpdate(event) {
      event.preventDefault();
      const btn = document.getElementById('save-profile-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const name = document.getElementById('profile-name').value;

        const response = await fetch('/api/v1/auth/profile', {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name })
        });

        if (!response.ok) {
          throw new Error('Failed to update profile');
        }

        showToast('Profile updated successfully', 'success');
      } catch (error) {
        console.error('Profile update error:', error);
        showToast('Failed to update profile', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Password visibility toggle
    function togglePasswordVisibility(inputId) {
      const input = document.getElementById(inputId);
      const button = input.parentElement.querySelector('.password-toggle');
      const eyeIcon = button.querySelector('.eye-icon');
      const eyeOffIcon = button.querySelector('.eye-off-icon');

      if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        input.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    }

    // Password strength checker
    function checkPasswordStrength(password) {
      const fill = document.getElementById('strength-fill');
      const text = document.getElementById('strength-text');

      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^a-zA-Z0-9]/)) strength++;

      fill.className = 'strength-fill';
      text.className = 'strength-text';

      if (password.length === 0) {
        text.textContent = 'Enter a password';
      } else if (strength <= 1) {
        fill.classList.add('weak');
        text.classList.add('weak');
        text.textContent = 'Weak password';
      } else if (strength === 2) {
        fill.classList.add('fair');
        text.classList.add('fair');
        text.textContent = 'Fair password';
      } else if (strength === 3) {
        fill.classList.add('good');
        text.classList.add('good');
        text.textContent = 'Good password';
      } else {
        fill.classList.add('strong');
        text.classList.add('strong');
        text.textContent = 'Strong password';
      }
    }

    // Password change
    async function handlePasswordChange(event) {
      event.preventDefault();
      const btn = document.getElementById('update-password-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/change-password', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPassword, newPassword })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to change password');
        }

        showToast('Password changed successfully', 'success');
        document.getElementById('password-form').reset();
        checkPasswordStrength('');
      } catch (error) {
        console.error('Password change error:', error);
        showToast(error.message || 'Failed to change password', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // 2FA toggle
    function handle2FAToggle(enabled) {
      const setup = document.getElementById('2fa-setup');
      if (enabled) {
        setup.style.display = 'block';
        // Would fetch QR code from API
      } else {
        setup.style.display = 'none';
      }
    }

    async function verify2FA() {
      const code = document.getElementById('2fa-code').value;
      if (code.length !== 6) {
        showToast('Please enter a 6-digit code', 'error');
        return;
      }

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/2fa/verify', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code })
        });

        if (!response.ok) {
          throw new Error('Invalid verification code');
        }

        showToast('Two-factor authentication enabled', 'success');
        document.getElementById('2fa-setup').style.display = 'none';
      } catch (error) {
        showToast(error.message, 'error');
      }
    }

    // Session management
    async function signOutSession(sessionId) {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        await fetch('/api/v1/auth/sessions/' + sessionId, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        showToast('Session signed out', 'success');
        // Remove from UI
        const sessionEl = document.querySelector('[data-session="' + sessionId + '"]');
        if (sessionEl) sessionEl.remove();
      } catch (error) {
        showToast('Failed to sign out session', 'error');
      }
    }

    async function signOutAllDevices() {
      if (!confirm('Are you sure you want to sign out of all devices?')) return;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        await fetch('/api/v1/auth/sessions', {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + token }
        });
        showToast('Signed out of all devices', 'success');
        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } catch (error) {
        showToast('Failed to sign out', 'error');
      }
    }

    // Notification preferences
    async function updateNotificationPref(checkbox) {
      const pref = checkbox.value;
      const enabled = checkbox.checked;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        await fetch('/api/v1/auth/notifications', {
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ [pref]: enabled })
        });
        showToast('Notification preference updated', 'success');
      } catch (error) {
        showToast('Failed to update preference', 'error');
        checkbox.checked = !enabled; // Revert
      }
    }

    // Email change modal
    function openChangeEmailModal() {
      document.getElementById('change-email-modal').style.display = 'flex';
    }

    function closeChangeEmailModal() {
      document.getElementById('change-email-modal').style.display = 'none';
      document.getElementById('change-email-form').reset();
    }

    async function handleEmailChange(event) {
      event.preventDefault();
      const newEmail = document.getElementById('new-email').value;
      const password = document.getElementById('email-password').value;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/change-email', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newEmail, password })
        });

        if (!response.ok) {
          throw new Error('Failed to send verification');
        }

        showToast('Verification email sent to ' + newEmail, 'success');
        closeChangeEmailModal();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }

    // Delete account modal
    function openDeleteAccountModal() {
      document.getElementById('delete-account-modal').style.display = 'flex';
    }

    function closeDeleteAccountModal() {
      document.getElementById('delete-account-modal').style.display = 'none';
      document.getElementById('delete-account-form').reset();
    }

    async function handleDeleteAccount(event) {
      event.preventDefault();
      const confirmation = document.getElementById('delete-confirmation').value;
      const password = document.getElementById('delete-password').value;

      if (confirmation !== 'DELETE') {
        showToast('Please type DELETE to confirm', 'error');
        return;
      }

      const btn = document.getElementById('confirm-delete-account-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/account', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        showToast('Account deleted successfully', 'success');
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/';
        }, 1500);
      } catch (error) {
        showToast(error.message, 'error');
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Close modals on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeChangeEmailModal();
        closeDeleteAccountModal();
      }
    });
  `;
}
