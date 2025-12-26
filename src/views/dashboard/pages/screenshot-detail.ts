/**
 * Screenshot Detail Page
 * View screenshot details, preview, and actions
 */

export function generateScreenshotDetailPage(): string {
  return `
    <!-- Page Header -->
    <div class="detail-header">
      <a href="/dashboard/screenshots" class="detail-back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Screenshots
      </a>
    </div>

    <!-- Loading State -->
    <div id="detail-loading" class="detail-loading">
      <div class="detail-loading-spinner"></div>
      <span>Loading screenshot details...</span>
    </div>

    <!-- Error State -->
    <div id="detail-error" class="detail-error" style="display: none;">
      <div class="detail-error-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3>Screenshot Not Found</h3>
      <p>The screenshot you're looking for doesn't exist or has been deleted.</p>
      <a href="/dashboard/screenshots" class="btn btn-primary">Back to Screenshots</a>
    </div>

    <!-- Main Content -->
    <div id="detail-content" class="detail-content" style="display: none;">
      <!-- Title Row -->
      <div class="detail-title-row">
        <div class="detail-title-info">
          <h2 class="detail-title" id="detail-title">Loading...</h2>
          <span class="detail-status" id="detail-status"></span>
        </div>
        <div class="detail-actions">
          <button class="btn btn-secondary" id="copy-url-btn" onclick="copyImageUrl()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy URL
          </button>
          <button class="btn btn-secondary" id="download-btn" onclick="downloadScreenshot()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download
          </button>
          <button class="btn btn-secondary" id="retry-btn" onclick="retryScreenshot()" style="display: none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Retry
          </button>
          <button class="btn btn-danger" onclick="openDeleteModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Delete
          </button>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="detail-grid">
        <!-- Preview Section -->
        <div class="detail-preview-section">
          <div class="detail-preview-card">
            <div class="detail-preview" id="detail-preview">
              <div class="detail-preview-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            </div>
            <div class="detail-preview-actions">
              <button class="btn btn-ghost btn-sm" onclick="zoomIn()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                Zoom In
              </button>
              <button class="btn btn-ghost btn-sm" onclick="zoomOut()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
                Zoom Out
              </button>
              <button class="btn btn-ghost btn-sm" onclick="resetZoom()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3.5 3.5L20.5 20.5M20.5 3.5L3.5 20.5"/>
                </svg>
                Reset
              </button>
              <button class="btn btn-ghost btn-sm" onclick="openFullscreen()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                Fullscreen
              </button>
            </div>
          </div>
        </div>

        <!-- Info Section -->
        <div class="detail-info-section">
          <!-- Screenshot Info Card -->
          <div class="detail-card">
            <h3 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Screenshot Info
            </h3>
            <div class="detail-card-content">
              <div class="detail-info-row">
                <span class="detail-info-label">URL</span>
                <span class="detail-info-value detail-info-url" id="info-url">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Status</span>
                <span class="detail-info-value" id="info-status">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Format</span>
                <span class="detail-info-value" id="info-format">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Dimensions</span>
                <span class="detail-info-value" id="info-dimensions">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">File Size</span>
                <span class="detail-info-value" id="info-filesize">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Created</span>
                <span class="detail-info-value" id="info-created">—</span>
              </div>
              <div class="detail-info-row">
                <span class="detail-info-label">Capture Time</span>
                <span class="detail-info-value" id="info-duration">—</span>
              </div>
            </div>
          </div>

          <!-- Options Used Card -->
          <div class="detail-card">
            <h3 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Options Used
            </h3>
            <div class="detail-card-content">
              <div class="detail-options-grid" id="options-grid">
                <div class="detail-option">
                  <span class="detail-option-label">Full Page</span>
                  <span class="detail-option-value" id="option-fullpage">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Dark Mode</span>
                  <span class="detail-option-value" id="option-darkmode">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Block Ads</span>
                  <span class="detail-option-value" id="option-blockads">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Delay</span>
                  <span class="detail-option-value" id="option-delay">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Selector</span>
                  <span class="detail-option-value" id="option-selector">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Quality</span>
                  <span class="detail-option-value" id="option-quality">—</span>
                </div>
                <div class="detail-option">
                  <span class="detail-option-label">Wait Until</span>
                  <span class="detail-option-value" id="option-waituntil">—</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata Card (shown if available) -->
          <div class="detail-card" id="metadata-card" style="display: none;">
            <h3 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Page Metadata
            </h3>
            <div class="detail-card-content">
              <div class="detail-info-row" id="meta-title-row">
                <span class="detail-info-label">Page Title</span>
                <span class="detail-info-value" id="meta-title">—</span>
              </div>
              <div class="detail-info-row" id="meta-description-row">
                <span class="detail-info-label">Description</span>
                <span class="detail-info-value detail-info-description" id="meta-description">—</span>
              </div>
              <div class="detail-info-row" id="meta-favicon-row">
                <span class="detail-info-label">Favicon</span>
                <span class="detail-info-value" id="meta-favicon">
                  <img id="meta-favicon-img" src="" alt="Favicon" style="display: none; width: 16px; height: 16px;" />
                </span>
              </div>
            </div>
          </div>

          <!-- Error Details (shown if failed) -->
          <div class="detail-card detail-card-error" id="error-card" style="display: none;">
            <h3 class="detail-card-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Error Details
            </h3>
            <div class="detail-card-content">
              <div class="detail-error-message" id="error-message">—</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" id="delete-modal" onclick="handleModalOverlayClick(event)">
      <div class="modal modal-sm" role="dialog" aria-labelledby="delete-modal-title" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title" id="delete-modal-title">Delete Screenshot</h3>
          <button class="modal-close" onclick="closeDeleteModal()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="delete-modal-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p class="delete-modal-text">
            Are you sure you want to delete this screenshot? This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" id="confirm-delete-btn" onclick="confirmDelete()">
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Fullscreen Modal -->
    <div class="fullscreen-overlay" id="fullscreen-modal" onclick="closeFullscreen()">
      <button class="fullscreen-close" onclick="closeFullscreen()" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <img id="fullscreen-image" src="" alt="Screenshot fullscreen view" />
    </div>
  `;
}

export function getScreenshotDetailStyles(): string {
  return `
    /* Detail Header */
    .detail-header {
      margin-bottom: 1.5rem;
    }

    .detail-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      transition: color var(--transition-fast);
    }

    .detail-back-btn:hover {
      color: var(--text-primary);
    }

    .detail-back-btn svg {
      width: 18px;
      height: 18px;
    }

    /* Loading State */
    .detail-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
      gap: 1rem;
    }

    .detail-loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Error State */
    .detail-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .detail-error-icon {
      width: 64px;
      height: 64px;
      margin-bottom: 1.5rem;
      color: var(--error);
    }

    .detail-error-icon svg {
      width: 100%;
      height: 100%;
    }

    .detail-error h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .detail-error p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    /* Title Row */
    .detail-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .detail-title-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .detail-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      word-break: break-all;
    }

    .detail-status {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      text-transform: uppercase;
    }

    .detail-status.status-completed {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .detail-status.status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .detail-status.status-failed {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .detail-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .detail-actions .btn svg {
      width: 16px;
      height: 16px;
    }

    /* Main Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
    }

    /* Preview Section */
    .detail-preview-section {
      min-width: 0;
    }

    .detail-preview-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .detail-preview {
      position: relative;
      min-height: 400px;
      max-height: 600px;
      overflow: auto;
      background: var(--bg-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-preview img {
      max-width: 100%;
      height: auto;
      display: block;
      transition: transform 0.2s ease;
    }

    .detail-preview-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 400px;
      color: var(--text-muted);
    }

    .detail-preview-placeholder svg {
      width: 64px;
      height: 64px;
    }

    .detail-preview-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-secondary);
    }

    .detail-preview-actions .btn svg {
      width: 16px;
      height: 16px;
    }

    /* Info Section */
    .detail-info-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .detail-card-error {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .detail-card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .detail-card-title svg {
      width: 18px;
      height: 18px;
      color: var(--accent-primary);
    }

    .detail-card-error .detail-card-title svg {
      color: var(--error);
    }

    .detail-card-content {
      padding: 1rem 1.25rem;
    }

    /* Info Rows */
    .detail-info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--border-color);
    }

    .detail-info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .detail-info-row:first-child {
      padding-top: 0;
    }

    .detail-info-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      flex-shrink: 0;
    }

    .detail-info-value {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-primary);
      text-align: right;
      word-break: break-all;
      max-width: 60%;
    }

    .detail-info-url {
      font-family: monospace;
      font-size: 0.75rem;
    }

    .detail-info-description {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    /* Options Grid */
    .detail-options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .detail-option {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: var(--bg-tertiary);
      border-radius: 8px;
    }

    .detail-option-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-option-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .detail-option-value.yes {
      color: var(--success);
    }

    .detail-option-value.no {
      color: var(--text-muted);
    }

    /* Error Message */
    .detail-error-message {
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 8px;
      color: var(--error);
      font-family: monospace;
      font-size: 0.8125rem;
      word-break: break-all;
    }

    /* Modal styles - reused from screenshots page */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast);
      padding: 1rem;
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform var(--transition-fast);
    }

    .modal-overlay.open .modal {
      transform: scale(1) translateY(0);
    }

    .modal-sm {
      max-width: 400px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .modal-close:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .modal-close svg {
      width: 20px;
      height: 20px;
    }

    .modal-body {
      padding: 1.5rem;
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

    .delete-modal-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 50%;
      color: var(--error);
    }

    .delete-modal-icon svg {
      width: 32px;
      height: 32px;
    }

    .delete-modal-text {
      text-align: center;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    /* Fullscreen Modal */
    .fullscreen-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transition-fast);
      cursor: zoom-out;
    }

    .fullscreen-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .fullscreen-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .fullscreen-close:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .fullscreen-close svg {
      width: 24px;
      height: 24px;
    }

    .fullscreen-overlay img {
      max-width: 95vw;
      max-height: 95vh;
      object-fit: contain;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .detail-grid {
        grid-template-columns: 1fr;
      }

      .detail-info-section {
        order: -1;
      }
    }

    @media (max-width: 640px) {
      .detail-title-row {
        flex-direction: column;
        align-items: stretch;
      }

      .detail-actions {
        flex-wrap: wrap;
      }

      .detail-actions .btn {
        flex: 1;
        min-width: 120px;
      }

      .detail-options-grid {
        grid-template-columns: 1fr;
      }

      .detail-info-value {
        max-width: 50%;
      }
    }
  `;
}

export function getScreenshotDetailScripts(): string {
  return `
    // Screenshot detail state
    let screenshotData = null;
    let zoomLevel = 1;

    // Initialize detail page
    async function initScreenshotDetail() {
      const pathParts = window.location.pathname.split('/');
      const screenshotId = pathParts[pathParts.length - 1];

      if (!screenshotId || screenshotId === 'screenshots') {
        showError();
        return;
      }

      await loadScreenshotDetails(screenshotId);
    }

    // Load screenshot details
    async function loadScreenshotDetails(id) {
      const loadingEl = document.getElementById('detail-loading');
      const errorEl = document.getElementById('detail-error');
      const contentEl = document.getElementById('detail-content');

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          return;
        }

        const response = await fetch('/api/v1/screenshots/' + id, {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            showError();
            return;
          }
          throw new Error('Failed to load screenshot');
        }

        const result = await response.json();
        screenshotData = result.data;

        loadingEl.style.display = 'none';
        contentEl.style.display = 'block';

        renderScreenshotDetails();
      } catch (error) {
        console.error('Error loading screenshot:', error);
        showError();
      }
    }

    function showError() {
      document.getElementById('detail-loading').style.display = 'none';
      document.getElementById('detail-error').style.display = 'flex';
    }

    function renderScreenshotDetails() {
      if (!screenshotData) return;

      const options = screenshotData.options || {};
      const result = screenshotData.result || {};
      const metadata = screenshotData.metadata || result.metadata || {};

      // Title and status
      const url = options.url || 'Unknown URL';
      const status = screenshotData.status || 'pending';

      document.getElementById('detail-title').textContent = url;

      const statusEl = document.getElementById('detail-status');
      statusEl.textContent = status;
      statusEl.className = 'detail-status status-' + status;

      // Show/hide retry button
      const retryBtn = document.getElementById('retry-btn');
      if (status === 'failed') {
        retryBtn.style.display = 'inline-flex';
      }

      // Preview image
      const previewEl = document.getElementById('detail-preview');
      if (result.url) {
        previewEl.innerHTML = '<img src="' + result.url + '" alt="Screenshot preview" id="preview-image" />';
      }

      // Info section
      document.getElementById('info-url').textContent = url;
      document.getElementById('info-status').innerHTML = '<span class="detail-status status-' + status + '">' + status + '</span>';
      document.getElementById('info-format').textContent = (options.format || 'png').toUpperCase();
      document.getElementById('info-dimensions').textContent = (result.width || options.width || '—') + ' x ' + (result.height || options.height || '—');
      document.getElementById('info-filesize').textContent = result.size ? formatFileSize(result.size) : '—';
      document.getElementById('info-created').textContent = formatDateTime(screenshotData.createdAt);
      document.getElementById('info-duration').textContent = result.duration ? result.duration + 'ms' : '—';

      // Options section
      setOptionValue('option-fullpage', options.fullPage);
      setOptionValue('option-darkmode', options.darkMode);
      setOptionValue('option-blockads', options.blockAds);
      document.getElementById('option-delay').textContent = (options.delay || 0) + 'ms';
      document.getElementById('option-selector').textContent = options.selector || 'None';
      document.getElementById('option-quality').textContent = (options.quality || 80) + '%';
      document.getElementById('option-waituntil').textContent = options.waitUntil || 'networkidle2';

      // Metadata section
      if (metadata.title || metadata.description || metadata.favicon) {
        document.getElementById('metadata-card').style.display = 'block';

        if (metadata.title) {
          document.getElementById('meta-title').textContent = metadata.title;
        }

        if (metadata.description) {
          document.getElementById('meta-description').textContent = metadata.description;
        }

        if (metadata.favicon) {
          const faviconImg = document.getElementById('meta-favicon-img');
          faviconImg.src = metadata.favicon;
          faviconImg.style.display = 'inline';
        }
      }

      // Error section
      if (status === 'failed' && screenshotData.error) {
        document.getElementById('error-card').style.display = 'block';
        document.getElementById('error-message').textContent = screenshotData.error.message || screenshotData.error || 'Unknown error';
      }
    }

    function setOptionValue(elementId, value) {
      const el = document.getElementById(elementId);
      if (value === true) {
        el.textContent = 'Yes';
        el.classList.add('yes');
      } else {
        el.textContent = 'No';
        el.classList.add('no');
      }
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function formatDateTime(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Actions
    function copyImageUrl() {
      if (!screenshotData?.result?.url) {
        showToast('No image URL available', 'error');
        return;
      }

      navigator.clipboard.writeText(screenshotData.result.url).then(() => {
        showToast('URL copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy URL', 'error');
      });
    }

    function downloadScreenshot() {
      if (!screenshotData?.result?.url) {
        showToast('No image available for download', 'error');
        return;
      }

      const link = document.createElement('a');
      link.href = screenshotData.result.url;
      link.download = 'screenshot.' + (screenshotData.options?.format || 'png');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    async function retryScreenshot() {
      if (!screenshotData) return;

      const btn = document.getElementById('retry-btn');
      const originalHtml = btn.innerHTML;

      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="detail-loading-spinner" style="width:16px;height:16px;border-width:2px;"></span> Retrying...';

        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showToast('Please log in', 'warning');
          return;
        }

        // Create new screenshot with same options
        const response = await fetch('/api/v1/screenshots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify(screenshotData.options),
        });

        if (!response.ok) {
          throw new Error('Failed to retry screenshot');
        }

        const result = await response.json();
        showToast('Screenshot retry started!', 'success');

        // Redirect to new screenshot
        window.location.href = '/dashboard/screenshots/' + (result.data._id || result.data.id);
      } catch (error) {
        console.error('Retry error:', error);
        showToast('Failed to retry screenshot', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }

    // Zoom controls
    function zoomIn() {
      zoomLevel = Math.min(zoomLevel + 0.25, 3);
      applyZoom();
    }

    function zoomOut() {
      zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
      applyZoom();
    }

    function resetZoom() {
      zoomLevel = 1;
      applyZoom();
    }

    function applyZoom() {
      const img = document.getElementById('preview-image');
      if (img) {
        img.style.transform = 'scale(' + zoomLevel + ')';
      }
    }

    // Fullscreen
    function openFullscreen() {
      if (!screenshotData?.result?.url) {
        showToast('No image available', 'error');
        return;
      }

      document.getElementById('fullscreen-image').src = screenshotData.result.url;
      document.getElementById('fullscreen-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeFullscreen() {
      document.getElementById('fullscreen-modal').classList.remove('open');
      document.body.style.overflow = '';
    }

    // Delete modal
    function openDeleteModal() {
      document.getElementById('delete-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
      document.getElementById('delete-modal').classList.remove('open');
      document.body.style.overflow = '';
    }

    function handleModalOverlayClick(event) {
      if (event.target.id === 'delete-modal') {
        closeDeleteModal();
      }
    }

    async function confirmDelete() {
      if (!screenshotData) return;

      const btn = document.getElementById('confirm-delete-btn');
      const originalHtml = btn.innerHTML;

      try {
        btn.disabled = true;
        btn.innerHTML = 'Deleting...';

        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showToast('Please log in', 'warning');
          return;
        }

        const id = screenshotData._id || screenshotData.id;
        const response = await fetch('/api/v1/screenshots/' + id, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete screenshot');
        }

        showToast('Screenshot deleted', 'success');
        closeDeleteModal();

        // Redirect to screenshots list
        setTimeout(() => {
          window.location.href = '/dashboard/screenshots';
        }, 500);
      } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete screenshot', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (document.getElementById('fullscreen-modal').classList.contains('open')) {
          closeFullscreen();
        } else if (document.getElementById('delete-modal').classList.contains('open')) {
          closeDeleteModal();
        }
      }
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initScreenshotDetail);
  `;
}
