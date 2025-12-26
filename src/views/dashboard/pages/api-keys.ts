/**
 * API Keys Page
 * Manage API keys with create, view, copy, revoke, and delete functionality
 */

export function generateApiKeysPage(): string {
  return `
    <div class="api-keys-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-header-title">
            <h1>API Keys</h1>
            <div class="header-tooltip">
              <button class="tooltip-trigger" aria-label="API keys information">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </button>
              <div class="tooltip-content">
                <p>API keys are used to authenticate requests to the Screenshot API.</p>
                <p>Keep your keys secure and never share them publicly.</p>
              </div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="openCreateKeyModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Create New Key
          </button>
        </div>
      </div>

      <!-- Security Notice -->
      <div class="security-notice">
        <div class="security-notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="security-notice-content">
          <h3>Keep your API keys secure</h3>
          <p>
            Do not share your API keys in publicly accessible areas such as GitHub, client-side code, or public repositories.
            If you believe a key has been compromised, revoke it immediately and create a new one.
          </p>
          <a href="/developer#authentication" class="security-notice-link">
            Learn more about API key security
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"/>
              <path d="M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- API Keys Container -->
      <div class="api-keys-container" id="api-keys-container">
        <!-- Loading State -->
        <div class="api-keys-loading" id="api-keys-loading">
          <div class="loading-spinner"></div>
          <p>Loading API keys...</p>
        </div>

        <!-- Empty State (hidden by default) -->
        <div class="api-keys-empty" id="api-keys-empty" style="display: none;">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <h3>No API keys yet</h3>
          <p>Create your first API key to start using the Screenshot API.</p>
          <button class="btn btn-primary" onclick="openCreateKeyModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14"/>
              <path d="M5 12h14"/>
            </svg>
            Create Your First Key
          </button>
        </div>

        <!-- API Keys Table (hidden by default) -->
        <div class="api-keys-table-container" id="api-keys-table-container" style="display: none;">
          <table class="api-keys-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Key</th>
                <th>Permissions</th>
                <th>Created</th>
                <th>Last Used</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="api-keys-tbody">
              <!-- Dynamic rows will be inserted here -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create API Key Modal -->
      <div class="modal-overlay" id="create-key-modal" style="display: none;">
        <div class="modal">
          <div class="modal-header">
            <h2>Create New API Key</h2>
            <button class="modal-close" onclick="closeCreateKeyModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <form id="create-key-form" onsubmit="handleCreateKey(event)">
            <div class="modal-body">
              <!-- Key Name -->
              <div class="form-group">
                <label for="key-name">Key Name <span class="required">*</span></label>
                <input
                  type="text"
                  id="key-name"
                  name="name"
                  placeholder="e.g., Production API Key"
                  required
                  maxlength="50"
                >
                <span class="form-hint">A friendly name to identify this key</span>
              </div>

              <!-- Permissions -->
              <div class="form-group">
                <label>Permissions</label>
                <div class="permissions-grid">
                  <label class="checkbox-label">
                    <input type="checkbox" name="permissions" value="screenshots:read" checked>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                      <strong>screenshots:read</strong>
                      <small>View and list screenshots</small>
                    </span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="permissions" value="screenshots:write" checked>
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                      <strong>screenshots:write</strong>
                      <small>Create new screenshots</small>
                    </span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" name="permissions" value="screenshots:delete">
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                      <strong>screenshots:delete</strong>
                      <small>Delete screenshots</small>
                    </span>
                  </label>
                </div>
              </div>

              <!-- IP Whitelist -->
              <div class="form-group">
                <label for="ip-whitelist">IP Whitelist <span class="optional">(optional)</span></label>
                <input
                  type="text"
                  id="ip-whitelist"
                  name="ipWhitelist"
                  placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                >
                <span class="form-hint">Comma-separated list of IPs or CIDR ranges. Leave empty to allow all IPs.</span>
              </div>

              <!-- Domain Whitelist -->
              <div class="form-group">
                <label for="domain-whitelist">Domain Whitelist <span class="optional">(optional)</span></label>
                <input
                  type="text"
                  id="domain-whitelist"
                  name="domainWhitelist"
                  placeholder="e.g., example.com, *.myapp.com"
                >
                <span class="form-hint">Comma-separated list of allowed domains. Leave empty to allow all domains.</span>
              </div>

              <!-- Expiration -->
              <div class="form-group">
                <label for="expiration">Expiration</label>
                <select id="expiration" name="expiresIn">
                  <option value="">Never expires</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="closeCreateKeyModal()">Cancel</button>
              <button type="submit" class="btn btn-primary" id="create-key-btn">
                <span class="btn-text">Create Key</span>
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

      <!-- New Key Created Modal -->
      <div class="modal-overlay" id="key-created-modal" style="display: none;">
        <div class="modal modal-success">
          <div class="modal-header">
            <div class="modal-success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>API Key Created Successfully</h2>
          </div>
          <div class="modal-body">
            <div class="key-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p><strong>Copy this key now!</strong> You won't be able to see it again.</p>
            </div>

            <div class="key-display">
              <code id="new-key-value"></code>
              <button class="btn btn-icon" onclick="copyNewKey()" aria-label="Copy API key">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>

            <div class="key-copied-message" id="key-copied-message" style="display: none;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Key copied to clipboard!
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-lg" onclick="closeKeyCreatedModal()">
              I've Copied the Key
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal-overlay" id="delete-key-modal" style="display: none;">
        <div class="modal modal-danger">
          <div class="modal-header">
            <h2>Delete API Key</h2>
            <button class="modal-close" onclick="closeDeleteKeyModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="delete-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p><strong>This action cannot be undone.</strong></p>
                <p>Any applications using this key will immediately lose access to the API.</p>
              </div>
            </div>
            <p class="delete-key-name">Delete key: <strong id="delete-key-name-text"></strong></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeDeleteKeyModal()">Cancel</button>
            <button class="btn btn-danger" id="confirm-delete-btn" onclick="confirmDeleteKey()">
              <span class="btn-text">Delete Key</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Revoke Confirmation Modal -->
      <div class="modal-overlay" id="revoke-key-modal" style="display: none;">
        <div class="modal modal-warning">
          <div class="modal-header">
            <h2>Revoke API Key</h2>
            <button class="modal-close" onclick="closeRevokeKeyModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="revoke-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <div>
                <p><strong>This key will be immediately disabled.</strong></p>
                <p>Any applications using this key will lose access to the API until a new key is created.</p>
              </div>
            </div>
            <p class="revoke-key-name">Revoke key: <strong id="revoke-key-name-text"></strong></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeRevokeKeyModal()">Cancel</button>
            <button class="btn btn-warning" id="confirm-revoke-btn" onclick="confirmRevokeKey()">
              <span class="btn-text">Revoke Key</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function getApiKeysStyles(): string {
  return `
    /* API Keys Page */
    .api-keys-page {
      max-width: 1200px;
    }

    /* Page Header */
    .page-header {
      margin-bottom: 1.5rem;
    }

    .page-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header-title h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }

    /* Header Tooltip */
    .header-tooltip {
      position: relative;
    }

    .tooltip-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      transition: color var(--transition-fast);
    }

    .tooltip-trigger:hover {
      color: var(--text-secondary);
    }

    .tooltip-trigger svg {
      width: 18px;
      height: 18px;
    }

    .tooltip-content {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 0.5rem;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      width: 280px;
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast);
    }

    .tooltip-content p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .tooltip-content p + p {
      margin-top: 0.5rem;
    }

    .header-tooltip:hover .tooltip-content,
    .tooltip-trigger:focus + .tooltip-content {
      opacity: 1;
      visibility: visible;
    }

    /* Security Notice */
    .security-notice {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    .security-notice-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(245, 158, 11, 0.15);
      border-radius: 8px;
      color: var(--warning);
    }

    .security-notice-icon svg {
      width: 22px;
      height: 22px;
    }

    .security-notice-content h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--warning);
      margin-bottom: 0.375rem;
    }

    .security-notice-content p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }

    .security-notice-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--warning);
      transition: gap var(--transition-fast);
    }

    .security-notice-link:hover {
      gap: 0.5rem;
    }

    .security-notice-link svg {
      width: 14px;
      height: 14px;
    }

    /* API Keys Container */
    .api-keys-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    /* Loading State */
    .api-keys-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .api-keys-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .api-keys-empty .empty-state-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: var(--bg-tertiary);
      border-radius: 50%;
      color: var(--text-muted);
      margin-bottom: 1.5rem;
    }

    .api-keys-empty .empty-state-icon svg {
      width: 40px;
      height: 40px;
    }

    .api-keys-empty h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .api-keys-empty p {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    /* API Keys Table */
    .api-keys-table-container {
      overflow-x: auto;
    }

    .api-keys-table {
      width: 100%;
      border-collapse: collapse;
    }

    .api-keys-table th {
      text-align: left;
      padding: 0.875rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .api-keys-table td {
      padding: 1rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
      vertical-align: middle;
    }

    .api-keys-table tbody tr:hover {
      background: var(--bg-hover);
    }

    .api-keys-table tbody tr:last-child td {
      border-bottom: none;
    }

    /* Key Name Column */
    .key-name-cell {
      font-weight: 500;
    }

    /* Key Value Column */
    .key-value-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .key-masked {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      background: var(--bg-tertiary);
      padding: 0.375rem 0.625rem;
      border-radius: 6px;
    }

    .key-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .key-toggle-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .key-toggle-btn svg {
      width: 14px;
      height: 14px;
    }

    .key-copy-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .key-copy-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .key-copy-btn svg {
      width: 14px;
      height: 14px;
    }

    /* Permissions Column */
    .permissions-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .permission-badge {
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
      border-radius: 4px;
      white-space: nowrap;
    }

    /* Date Columns */
    .date-cell {
      white-space: nowrap;
      color: var(--text-secondary);
      font-size: 0.8125rem;
    }

    .date-cell .never {
      color: var(--text-muted);
      font-style: italic;
    }

    /* Status Column */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .status-badge-active {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .status-badge-revoked {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .status-badge-expired {
      background: rgba(107, 107, 123, 0.15);
      color: var(--text-muted);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Actions Column */
    .actions-cell {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .action-btn.action-revoke:hover {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.3);
      color: var(--warning);
    }

    .action-btn.action-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: var(--error);
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    /* Modal Styles */
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
      animation: fadeIn 0.2s ease;
    }

    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow: hidden;
      animation: slideUp 0.3s ease;
    }

    .modal-success .modal-header {
      text-align: center;
      padding: 2rem 1.5rem 1rem;
    }

    .modal-success-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: rgba(16, 185, 129, 0.15);
      border-radius: 50%;
      color: var(--success);
      margin-bottom: 1rem;
    }

    .modal-success-icon svg {
      width: 32px;
      height: 32px;
    }

    .modal-danger .modal-body,
    .modal-warning .modal-body {
      padding: 1rem 1.5rem;
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      border-radius: 6px;
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
      max-height: calc(90vh - 140px);
      overflow-y: auto;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-tertiary);
    }

    /* Form Styles */
    .form-group {
      margin-bottom: 1.25rem;
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

    .form-group .required {
      color: var(--error);
    }

    .form-group .optional {
      font-weight: 400;
      color: var(--text-muted);
      font-size: 0.8125rem;
    }

    .form-group input[type="text"],
    .form-group select {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
    }

    .form-group input:focus,
    .form-group select:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .form-group input::placeholder {
      color: var(--text-muted);
    }

    .form-hint {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.375rem;
    }

    /* Permissions Grid */
    .permissions-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      transition: all var(--transition-fast);
    }

    .checkbox-label:hover {
      border-color: var(--border-hover);
    }

    .checkbox-label input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .checkbox-custom {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      background: var(--bg-input);
      border: 2px solid var(--border-color);
      border-radius: 4px;
      transition: all var(--transition-fast);
      position: relative;
    }

    .checkbox-label input:checked + .checkbox-custom {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .checkbox-label input:checked + .checkbox-custom::after {
      content: '';
      position: absolute;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .checkbox-label input:focus + .checkbox-custom {
      box-shadow: var(--focus-ring);
    }

    .checkbox-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .checkbox-text strong {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .checkbox-text small {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    /* Key Display */
    .key-warning {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 8px;
      margin-bottom: 1.25rem;
    }

    .key-warning svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--warning);
    }

    .key-warning p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .key-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .key-display code {
      flex: 1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      color: var(--success);
      word-break: break-all;
    }

    .key-copied-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      color: var(--success);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .key-copied-message svg {
      width: 18px;
      height: 18px;
    }

    /* Delete/Revoke Warning */
    .delete-warning,
    .revoke-warning {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .revoke-warning {
      background: rgba(245, 158, 11, 0.1);
      border-color: rgba(245, 158, 11, 0.2);
    }

    .delete-warning svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--error);
    }

    .revoke-warning svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--warning);
    }

    .delete-warning p,
    .revoke-warning p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .delete-warning p + p,
    .revoke-warning p + p {
      margin-top: 0.25rem;
    }

    .delete-key-name,
    .revoke-key-name {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .delete-key-name strong,
    .revoke-key-name strong {
      color: var(--text-primary);
    }

    /* Button Styles */
    .btn-warning {
      background: var(--warning);
      color: #000;
    }

    .btn-warning:hover {
      filter: brightness(1.1);
    }

    .btn-loader {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      width: 18px;
      height: 18px;
      animation: spin 0.8s linear infinite;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .security-notice {
        flex-direction: column;
        text-align: center;
      }

      .security-notice-icon {
        margin: 0 auto;
      }

      .api-keys-table {
        font-size: 0.8125rem;
      }

      .api-keys-table th,
      .api-keys-table td {
        padding: 0.75rem;
      }

      .api-keys-table th:nth-child(4),
      .api-keys-table td:nth-child(4),
      .api-keys-table th:nth-child(5),
      .api-keys-table td:nth-child(5) {
        display: none;
      }

      .modal {
        max-width: 100%;
        margin: 0.5rem;
      }
    }
  `;
}

export function getApiKeysScripts(): string {
  return `
    // API Keys state
    let apiKeys = [];
    let keyToDelete = null;
    let keyToRevoke = null;
    let newKeyValue = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      loadApiKeys();
    });

    // Fetch API keys
    async function loadApiKeys() {
      const loadingEl = document.getElementById('api-keys-loading');
      const emptyEl = document.getElementById('api-keys-empty');
      const tableEl = document.getElementById('api-keys-table-container');

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/api-keys', {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load API keys');
        }

        const data = await response.json();
        apiKeys = data.data || [];

        // Hide loading
        if (loadingEl) loadingEl.style.display = 'none';

        if (apiKeys.length === 0) {
          // Show empty state
          if (emptyEl) emptyEl.style.display = 'flex';
          if (tableEl) tableEl.style.display = 'none';
        } else {
          // Show table
          if (emptyEl) emptyEl.style.display = 'none';
          if (tableEl) tableEl.style.display = 'block';
          renderApiKeysTable();
        }
      } catch (error) {
        console.error('Error loading API keys:', error);
        if (loadingEl) loadingEl.innerHTML = '<p style="color: var(--error);">Failed to load API keys. Please try again.</p>';
      }
    }

    // Render API keys table
    function renderApiKeysTable() {
      const tbody = document.getElementById('api-keys-tbody');
      if (!tbody) return;

      tbody.innerHTML = apiKeys.map(key => {
        const createdDate = new Date(key.createdAt).toLocaleDateString();
        const lastUsed = key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : '<span class="never">Never</span>';
        const isActive = key.status === 'active' && !key.isRevoked;
        const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();

        let statusClass = 'status-badge-active';
        let statusText = 'Active';
        if (key.isRevoked) {
          statusClass = 'status-badge-revoked';
          statusText = 'Revoked';
        } else if (isExpired) {
          statusClass = 'status-badge-expired';
          statusText = 'Expired';
        }

        const permissions = key.permissions || ['screenshots:read', 'screenshots:write'];
        const permissionBadges = permissions.map(p => '<span class="permission-badge">' + p + '</span>').join('');

        const maskedKey = key.key ? maskApiKey(key.key) : 'ss_' + '*'.repeat(32);

        return '<tr data-key-id="' + key._id + '">' +
          '<td class="key-name-cell">' + escapeHtml(key.name) + '</td>' +
          '<td>' +
            '<div class="key-value-cell">' +
              '<code class="key-masked" id="key-value-' + key._id + '">' + maskedKey + '</code>' +
              '<button class="key-copy-btn" onclick="copyKeyValue(\\'' + key._id + '\\')" title="Copy key">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '</button>' +
            '</div>' +
          '</td>' +
          '<td><div class="permissions-badges">' + permissionBadges + '</div></td>' +
          '<td class="date-cell">' + createdDate + '</td>' +
          '<td class="date-cell">' + lastUsed + '</td>' +
          '<td><span class="status-badge ' + statusClass + '"><span class="status-dot"></span>' + statusText + '</span></td>' +
          '<td>' +
            '<div class="actions-cell">' +
              (isActive ? '<button class="action-btn action-revoke" onclick="openRevokeKeyModal(\\'' + key._id + '\\', \\'' + escapeHtml(key.name) + '\\')" title="Revoke key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>' : '') +
              '<button class="action-btn action-delete" onclick="openDeleteKeyModal(\\'' + key._id + '\\', \\'' + escapeHtml(key.name) + '\\')" title="Delete key"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>' +
            '</div>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    // Mask API key
    function maskApiKey(key) {
      if (!key || key.length < 10) return key;
      return key.substring(0, 6) + '*'.repeat(Math.min(24, key.length - 10)) + key.substring(key.length - 4);
    }

    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Copy key value
    async function copyKeyValue(keyId) {
      const key = apiKeys.find(k => k._id === keyId);
      if (!key || !key.key) {
        showToast('Key value is not available for copying', 'warning');
        return;
      }

      try {
        await navigator.clipboard.writeText(key.key);
        showToast('API key copied to clipboard', 'success');
      } catch (error) {
        showToast('Failed to copy key', 'error');
      }
    }

    // Create Key Modal
    function openCreateKeyModal() {
      const modal = document.getElementById('create-key-modal');
      if (modal) {
        modal.style.display = 'flex';
        document.getElementById('key-name').focus();
      }
    }

    function closeCreateKeyModal() {
      const modal = document.getElementById('create-key-modal');
      const form = document.getElementById('create-key-form');
      if (modal) modal.style.display = 'none';
      if (form) form.reset();
    }

    // Handle create key
    async function handleCreateKey(event) {
      event.preventDefault();

      const form = event.target;
      const btn = document.getElementById('create-key-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      // Get form data
      const name = form.name.value.trim();
      const permissionCheckboxes = form.querySelectorAll('input[name="permissions"]:checked');
      const permissions = Array.from(permissionCheckboxes).map(cb => cb.value);
      const ipWhitelist = form.ipWhitelist.value.trim();
      const domainWhitelist = form.domainWhitelist.value.trim();
      const expiresIn = form.expiresIn.value;

      if (!name) {
        showToast('Please enter a key name', 'error');
        return;
      }

      if (permissions.length === 0) {
        showToast('Please select at least one permission', 'error');
        return;
      }

      // Show loading
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const body = {
          name,
          permissions,
        };

        if (ipWhitelist) {
          body.ipWhitelist = ipWhitelist.split(',').map(ip => ip.trim()).filter(Boolean);
        }
        if (domainWhitelist) {
          body.domainWhitelist = domainWhitelist.split(',').map(d => d.trim()).filter(Boolean);
        }
        if (expiresIn) {
          body.expiresIn = parseInt(expiresIn, 10);
        }

        const response = await fetch('/api/v1/auth/api-keys', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create API key');
        }

        const data = await response.json();
        newKeyValue = data.data.key;

        // Close create modal and open success modal
        closeCreateKeyModal();
        openKeyCreatedModal();

        // Reload keys
        loadApiKeys();
      } catch (error) {
        console.error('Error creating API key:', error);
        showToast(error.message || 'Failed to create API key', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Key Created Modal
    function openKeyCreatedModal() {
      const modal = document.getElementById('key-created-modal');
      const keyValue = document.getElementById('new-key-value');
      const copiedMessage = document.getElementById('key-copied-message');

      if (modal && keyValue && newKeyValue) {
        keyValue.textContent = newKeyValue;
        if (copiedMessage) copiedMessage.style.display = 'none';
        modal.style.display = 'flex';
      }
    }

    function closeKeyCreatedModal() {
      const modal = document.getElementById('key-created-modal');
      if (modal) modal.style.display = 'none';
      newKeyValue = null;
    }

    async function copyNewKey() {
      if (!newKeyValue) return;

      try {
        await navigator.clipboard.writeText(newKeyValue);
        const copiedMessage = document.getElementById('key-copied-message');
        if (copiedMessage) copiedMessage.style.display = 'flex';
      } catch (error) {
        showToast('Failed to copy key', 'error');
      }
    }

    // Delete Key Modal
    function openDeleteKeyModal(keyId, keyName) {
      keyToDelete = keyId;
      const modal = document.getElementById('delete-key-modal');
      const nameText = document.getElementById('delete-key-name-text');

      if (modal && nameText) {
        nameText.textContent = keyName;
        modal.style.display = 'flex';
      }
    }

    function closeDeleteKeyModal() {
      const modal = document.getElementById('delete-key-modal');
      if (modal) modal.style.display = 'none';
      keyToDelete = null;
    }

    async function confirmDeleteKey() {
      if (!keyToDelete) return;

      const btn = document.getElementById('confirm-delete-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/api-keys/' + keyToDelete, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete API key');
        }

        showToast('API key deleted successfully', 'success');
        closeDeleteKeyModal();
        loadApiKeys();
      } catch (error) {
        console.error('Error deleting API key:', error);
        showToast('Failed to delete API key', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Revoke Key Modal
    function openRevokeKeyModal(keyId, keyName) {
      keyToRevoke = keyId;
      const modal = document.getElementById('revoke-key-modal');
      const nameText = document.getElementById('revoke-key-name-text');

      if (modal && nameText) {
        nameText.textContent = keyName;
        modal.style.display = 'flex';
      }
    }

    function closeRevokeKeyModal() {
      const modal = document.getElementById('revoke-key-modal');
      if (modal) modal.style.display = 'none';
      keyToRevoke = null;
    }

    async function confirmRevokeKey() {
      if (!keyToRevoke) return;

      const btn = document.getElementById('confirm-revoke-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/auth/api-keys/' + keyToRevoke + '/revoke', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to revoke API key');
        }

        showToast('API key revoked successfully', 'success');
        closeRevokeKeyModal();
        loadApiKeys();
      } catch (error) {
        console.error('Error revoking API key:', error);
        showToast('Failed to revoke API key', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Close modals on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeCreateKeyModal();
        closeKeyCreatedModal();
        closeDeleteKeyModal();
        closeRevokeKeyModal();
      }
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          overlay.style.display = 'none';
        }
      });
    });
  `;
}
