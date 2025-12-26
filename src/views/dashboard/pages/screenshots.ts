/**
 * Screenshots Page
 * List, manage, and create screenshots
 */

import { generateDataTable } from '../components/data-table';
import { generatePagination } from '../components/pagination';
import { generateEmptyState } from '../components/empty-state';

export function generateScreenshotsPage(): string {
  const tableColumns = [
    { key: 'thumbnail', label: '', width: '80px' },
    { key: 'url', label: 'URL', sortable: true },
    { key: 'format', label: 'Format', width: '100px' },
    { key: 'dimensions', label: 'Dimensions', width: '120px' },
    { key: 'status', label: 'Status', width: '120px', sortable: true },
    { key: 'createdAt', label: 'Created', width: '150px', sortable: true },
    { key: 'actions', label: '', width: '120px', align: 'right' as const },
  ];

  const emptyIcon = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  `;

  return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h2 class="page-title">Screenshots</h2>
        <span class="page-subtitle" id="screenshots-count">Loading...</span>
      </div>
      <div class="page-header-right">
        <button class="btn btn-primary" onclick="openNewScreenshotModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Screenshot
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="screenshots-filters">
      <div class="screenshots-search">
        <svg class="screenshots-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          id="screenshots-search"
          class="screenshots-search-input"
          placeholder="Search by URL..."
          oninput="handleScreenshotSearch(this.value)"
        />
      </div>

      <div class="screenshots-filter-group">
        <select
          id="filter-status"
          class="screenshots-filter-select"
          onchange="handleFilterChange()"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>

        <select
          id="filter-format"
          class="screenshots-filter-select"
          onchange="handleFilterChange()"
        >
          <option value="">All Formats</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="pdf">PDF</option>
        </select>

        <button class="btn btn-ghost btn-sm" onclick="clearFilters()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          Clear
        </button>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div class="data-table-bulk-actions" id="screenshots-table-bulk-actions">
      <span class="data-table-bulk-count" id="screenshots-table-bulk-count">0 selected</span>
      <button class="data-table-bulk-btn danger" onclick="handleBulkDelete()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        Delete Selected
      </button>
    </div>

    <!-- Screenshots Table -->
    <div id="screenshots-table-wrapper">
      ${generateDataTable({
        id: 'screenshots-table',
        columns: tableColumns,
        selectable: true,
        loadingRows: 5,
      })}
    </div>

    <!-- Empty State (hidden by default) -->
    <div id="screenshots-empty" style="display: none;">
      ${generateEmptyState({
        icon: emptyIcon,
        title: 'No screenshots yet',
        description:
          'Capture your first screenshot to see it here. You can capture any public website.',
        action: {
          label: 'Capture Screenshot',
          onclick: 'openNewScreenshotModal()',
        },
      })}
    </div>

    <!-- Pagination -->
    <div id="screenshots-pagination">
      ${generatePagination({
        id: 'screenshots-pagination',
        totalItems: 0,
        itemsPerPage: 10,
      })}
    </div>

    <!-- New Screenshot Modal -->
    ${generateNewScreenshotModal()}

    <!-- Delete Confirmation Modal -->
    ${generateDeleteModal()}
  `;
}

function generateNewScreenshotModal(): string {
  return `
    <div class="modal-overlay" id="new-screenshot-modal" onclick="handleModalOverlayClick(event, 'new-screenshot-modal')">
      <div class="modal" role="dialog" aria-labelledby="new-screenshot-title" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title" id="new-screenshot-title">New Screenshot</h3>
          <button class="modal-close" onclick="closeNewScreenshotModal()" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form class="modal-body" id="new-screenshot-form" onsubmit="handleCreateScreenshot(event)">
          <!-- URL -->
          <div class="form-group">
            <label for="screenshot-url" class="form-label">
              URL <span class="form-required">*</span>
            </label>
            <input
              type="url"
              id="screenshot-url"
              class="form-input"
              placeholder="https://example.com"
              required
            />
          </div>

          <!-- Dimensions Row -->
          <div class="form-row">
            <div class="form-group">
              <label for="screenshot-width" class="form-label">Width</label>
              <input
                type="number"
                id="screenshot-width"
                class="form-input"
                placeholder="1280"
                min="320"
                max="7680"
                value="1280"
              />
            </div>
            <div class="form-group">
              <label for="screenshot-height" class="form-label">Height</label>
              <input
                type="number"
                id="screenshot-height"
                class="form-input"
                placeholder="720"
                min="240"
                max="4320"
                value="720"
              />
            </div>
          </div>

          <!-- Format -->
          <div class="form-group">
            <label for="screenshot-format" class="form-label">Format</label>
            <select id="screenshot-format" class="form-select">
              <option value="png" selected>PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <!-- Toggles Row -->
          <div class="form-toggles">
            <label class="form-toggle">
              <input type="checkbox" id="screenshot-fullpage" />
              <span class="form-toggle-slider"></span>
              <span class="form-toggle-label">Full Page</span>
            </label>
            <label class="form-toggle">
              <input type="checkbox" id="screenshot-darkmode" />
              <span class="form-toggle-slider"></span>
              <span class="form-toggle-label">Dark Mode</span>
            </label>
            <label class="form-toggle">
              <input type="checkbox" id="screenshot-blockads" />
              <span class="form-toggle-slider"></span>
              <span class="form-toggle-label">Block Ads</span>
            </label>
          </div>

          <!-- Advanced Options -->
          <details class="form-details">
            <summary class="form-details-summary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              Advanced Options
            </summary>
            <div class="form-details-content">
              <!-- Quality -->
              <div class="form-group">
                <label for="screenshot-quality" class="form-label">
                  Quality <span class="form-hint">(JPEG/WebP only)</span>
                </label>
                <input
                  type="number"
                  id="screenshot-quality"
                  class="form-input"
                  placeholder="80"
                  min="1"
                  max="100"
                  value="80"
                />
              </div>

              <!-- Delay -->
              <div class="form-group">
                <label for="screenshot-delay" class="form-label">
                  Delay <span class="form-hint">(ms)</span>
                </label>
                <input
                  type="number"
                  id="screenshot-delay"
                  class="form-input"
                  placeholder="0"
                  min="0"
                  max="10000"
                  value="0"
                />
              </div>

              <!-- Selector -->
              <div class="form-group">
                <label for="screenshot-selector" class="form-label">
                  CSS Selector <span class="form-hint">(optional)</span>
                </label>
                <input
                  type="text"
                  id="screenshot-selector"
                  class="form-input"
                  placeholder="#main-content"
                />
              </div>

              <!-- Wait Until -->
              <div class="form-group">
                <label for="screenshot-waituntil" class="form-label">Wait Until</label>
                <select id="screenshot-waituntil" class="form-select">
                  <option value="networkidle2" selected>Network Idle</option>
                  <option value="load">Page Load</option>
                  <option value="domcontentloaded">DOM Ready</option>
                  <option value="networkidle0">Network Idle (strict)</option>
                </select>
              </div>

              <!-- Cookies -->
              <div class="form-group">
                <label for="screenshot-cookies" class="form-label">
                  Cookies <span class="form-hint">(JSON array)</span>
                </label>
                <textarea
                  id="screenshot-cookies"
                  class="form-textarea"
                  placeholder='[{"name": "session", "value": "abc123", "domain": "example.com"}]'
                  rows="3"
                ></textarea>
              </div>

              <!-- Custom Headers -->
              <div class="form-group">
                <label for="screenshot-headers" class="form-label">
                  Custom Headers <span class="form-hint">(JSON object)</span>
                </label>
                <textarea
                  id="screenshot-headers"
                  class="form-textarea"
                  placeholder='{"Authorization": "Bearer token"}'
                  rows="3"
                ></textarea>
              </div>

              <!-- Webhook URL -->
              <div class="form-group">
                <label for="screenshot-webhook" class="form-label">
                  Webhook URL <span class="form-hint">(optional)</span>
                </label>
                <input
                  type="url"
                  id="screenshot-webhook"
                  class="form-input"
                  placeholder="https://your-server.com/webhook"
                />
              </div>
            </div>
          </details>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="closeNewScreenshotModal()">
            Cancel
          </button>
          <button type="submit" form="new-screenshot-form" class="btn btn-primary" id="create-screenshot-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            Capture Screenshot
          </button>
        </div>
      </div>
    </div>
  `;
}

function generateDeleteModal(): string {
  return `
    <div class="modal-overlay" id="delete-modal" onclick="handleModalOverlayClick(event, 'delete-modal')">
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
          <p class="delete-modal-text" id="delete-modal-text">
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
  `;
}

export function getScreenshotsStyles(): string {
  return `
    /* Page Header */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-header-left {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .page-header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header .btn svg {
      width: 18px;
      height: 18px;
    }

    /* Filters */
    .screenshots-filters {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .screenshots-search {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .screenshots-search-icon {
      position: absolute;
      left: 0.875rem;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .screenshots-search-input {
      width: 100%;
      padding: 0.625rem 1rem;
      padding-left: 2.5rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.875rem;
      transition: all var(--transition-fast);
    }

    .screenshots-search-input:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .screenshots-search-input::placeholder {
      color: var(--text-muted);
    }

    .screenshots-filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .screenshots-filter-select {
      padding: 0.625rem 2rem 0.625rem 0.875rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.875rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.5rem center;
      background-size: 16px;
      transition: all var(--transition-fast);
    }

    .screenshots-filter-select:hover {
      border-color: var(--border-hover);
    }

    .screenshots-filter-select:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
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
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
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

    .modal-footer .btn svg {
      width: 16px;
      height: 16px;
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 0.375rem;
    }

    .form-required {
      color: var(--error);
    }

    .form-hint {
      font-weight: 400;
      color: var(--text-muted);
    }

    .form-input,
    .form-select,
    .form-textarea {
      width: 100%;
      padding: 0.625rem 0.875rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.875rem;
      font-family: inherit;
      transition: all var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus,
    .form-textarea:focus {
      border-color: var(--accent-primary);
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .form-input::placeholder,
    .form-textarea::placeholder {
      color: var(--text-muted);
    }

    .form-select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0b0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }

    .form-textarea {
      resize: vertical;
      min-height: 80px;
      font-family: monospace;
      font-size: 0.8125rem;
    }

    /* Form Toggles */
    .form-toggles {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
      background: var(--bg-tertiary);
      border-radius: 8px;
    }

    .form-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .form-toggle input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .form-toggle-slider {
      position: relative;
      width: 36px;
      height: 20px;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      transition: all var(--transition-fast);
    }

    .form-toggle-slider::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      background: var(--text-muted);
      border-radius: 50%;
      transition: all var(--transition-fast);
    }

    .form-toggle input:checked + .form-toggle-slider {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }

    .form-toggle input:checked + .form-toggle-slider::after {
      transform: translateX(16px);
      background: white;
    }

    .form-toggle input:focus + .form-toggle-slider {
      box-shadow: var(--focus-ring);
    }

    .form-toggle-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    /* Form Details (collapsible) */
    .form-details {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .form-details-summary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1rem;
      background: var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: all var(--transition-fast);
    }

    .form-details-summary:hover {
      color: var(--text-primary);
    }

    .form-details-summary svg {
      width: 16px;
      height: 16px;
      transition: transform var(--transition-fast);
    }

    .form-details[open] .form-details-summary svg {
      transform: rotate(90deg);
    }

    .form-details-content {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .form-details-content .form-group:last-child {
      margin-bottom: 0;
    }

    /* Delete Modal */
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

    /* Responsive */
    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .page-header-right {
        justify-content: stretch;
      }

      .page-header-right .btn {
        flex: 1;
      }

      .screenshots-filters {
        flex-direction: column;
        align-items: stretch;
      }

      .screenshots-search {
        max-width: none;
      }

      .screenshots-filter-group {
        flex-wrap: wrap;
      }

      .screenshots-filter-select {
        flex: 1;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .form-toggles {
        flex-direction: column;
      }
    }
  `;
}

export function getScreenshotsScripts(): string {
  return `
    // Screenshots state
    let screenshotsState = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      search: '',
      status: '',
      format: '',
      sortKey: 'createdAt',
      sortDir: 'desc',
      deleteTarget: null,
      deleteBulk: false,
    };

    // Initialize screenshots page
    async function initScreenshots() {
      await loadScreenshots();

      // Listen for pagination changes
      document.addEventListener('pageChange', (e) => {
        if (e.detail.paginationId === 'screenshots-pagination') {
          screenshotsState.page = e.detail.page;
          screenshotsState.limit = e.detail.itemsPerPage;
          loadScreenshots();
        }
      });

      // Listen for sort changes
      document.addEventListener('tableSort', (e) => {
        if (e.detail.tableId === 'screenshots-table') {
          screenshotsState.sortKey = e.detail.key;
          screenshotsState.sortDir = e.detail.dir;
          loadScreenshots();
        }
      });
    }

    // Load screenshots
    async function loadScreenshots() {
      const tableBody = document.getElementById('screenshots-table-body');
      const emptyState = document.getElementById('screenshots-empty');
      const tableWrapper = document.getElementById('screenshots-table-wrapper');
      const pagination = document.getElementById('screenshots-pagination');

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showEmptyState();
          return;
        }

        // Build query params
        const params = new URLSearchParams({
          page: screenshotsState.page.toString(),
          limit: screenshotsState.limit.toString(),
          sortBy: screenshotsState.sortKey,
          sortOrder: screenshotsState.sortDir,
        });

        if (screenshotsState.search) params.append('search', screenshotsState.search);
        if (screenshotsState.status) params.append('status', screenshotsState.status);
        if (screenshotsState.format) params.append('format', screenshotsState.format);

        const response = await fetch('/api/v1/screenshots?' + params.toString(), {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load screenshots');
        }

        const result = await response.json();
        screenshotsState.data = result.data || [];
        screenshotsState.total = result.pagination?.total || 0;

        // Update count
        const countEl = document.getElementById('screenshots-count');
        if (countEl) {
          countEl.textContent = screenshotsState.total + ' screenshots';
        }

        if (screenshotsState.data.length === 0) {
          showEmptyState();
        } else {
          emptyState.style.display = 'none';
          tableWrapper.style.display = 'block';
          pagination.style.display = 'block';
          renderScreenshotsTable();
          updatePagination('screenshots-pagination', {
            currentPage: screenshotsState.page,
            totalPages: Math.ceil(screenshotsState.total / screenshotsState.limit),
            totalItems: screenshotsState.total,
            itemsPerPage: screenshotsState.limit,
          });
        }
      } catch (error) {
        console.error('Error loading screenshots:', error);
        showEmptyState();
      }
    }

    function showEmptyState() {
      const emptyState = document.getElementById('screenshots-empty');
      const tableWrapper = document.getElementById('screenshots-table-wrapper');
      const pagination = document.getElementById('screenshots-pagination');

      emptyState.style.display = 'block';
      tableWrapper.style.display = 'none';
      pagination.style.display = 'none';

      const countEl = document.getElementById('screenshots-count');
      if (countEl) countEl.textContent = '0 screenshots';
    }

    function renderScreenshotsTable() {
      const tableBody = document.getElementById('screenshots-table-body');
      if (!tableBody) return;

      const rows = screenshotsState.data.map(screenshot => {
        const id = screenshot._id || screenshot.id;
        const url = screenshot.options?.url || screenshot.url || '';
        const format = screenshot.options?.format || 'png';
        const width = screenshot.options?.width || screenshot.result?.width || '—';
        const height = screenshot.options?.height || screenshot.result?.height || '—';
        const status = screenshot.status || 'pending';
        const createdAt = formatDate(screenshot.createdAt);
        const thumbnailUrl = screenshot.result?.url;

        return \`
          <tr class="data-table-row clickable" data-id="\${id}" onclick="handleRowClick('\${id}', event)">
            <td class="data-table-td">
              <input
                type="checkbox"
                class="data-table-checkbox"
                onclick="event.stopPropagation(); handleRowSelect('screenshots-table', '\${id}')"
                aria-label="Select screenshot"
              />
            </td>
            <td class="data-table-td">
              <div class="data-table-cell-thumbnail">
                \${thumbnailUrl
                  ? \`<img src="\${thumbnailUrl}" alt="Screenshot" loading="lazy" />\`
                  : \`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <path d="M21 15l-5-5L5 21"/>
                    </svg>\`
                }
              </div>
            </td>
            <td class="data-table-td">
              <div class="data-table-cell-url" title="\${url}">\${url}</div>
            </td>
            <td class="data-table-td">
              <span class="data-table-cell-badge badge-\${format}">\${format.toUpperCase()}</span>
            </td>
            <td class="data-table-td">
              <span class="data-table-cell-dimensions">\${width} x \${height}</span>
            </td>
            <td class="data-table-td">
              <span class="data-table-cell-status status-\${status}">
                <span class="data-table-cell-status-dot"></span>
                \${status}
              </span>
            </td>
            <td class="data-table-td">
              <span class="data-table-cell-date">\${createdAt}</span>
            </td>
            <td class="data-table-td">
              <div class="data-table-actions">
                <button class="data-table-action-btn" onclick="event.stopPropagation(); viewScreenshot('\${id}')" title="View">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                \${thumbnailUrl ? \`
                  <button class="data-table-action-btn" onclick="event.stopPropagation(); downloadScreenshot('\${thumbnailUrl}')" title="Download">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                \` : ''}
                <button class="data-table-action-btn danger" onclick="event.stopPropagation(); openDeleteModal('\${id}')" title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');

      tableBody.innerHTML = rows;
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // Search handling
    let searchTimeout;
    function handleScreenshotSearch(value) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        screenshotsState.search = value;
        screenshotsState.page = 1;
        loadScreenshots();
      }, 300);
    }

    // Filter handling
    function handleFilterChange() {
      screenshotsState.status = document.getElementById('filter-status').value;
      screenshotsState.format = document.getElementById('filter-format').value;
      screenshotsState.page = 1;
      loadScreenshots();
    }

    function clearFilters() {
      document.getElementById('filter-status').value = '';
      document.getElementById('filter-format').value = '';
      document.getElementById('screenshots-search').value = '';
      screenshotsState.search = '';
      screenshotsState.status = '';
      screenshotsState.format = '';
      screenshotsState.page = 1;
      loadScreenshots();
    }

    // Row click handling
    function handleRowClick(id, event) {
      if (event.target.closest('.data-table-checkbox') || event.target.closest('.data-table-actions')) {
        return;
      }
      viewScreenshot(id);
    }

    function viewScreenshot(id) {
      window.location.href = '/dashboard/screenshots/' + id;
    }

    function downloadScreenshot(url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenshot';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Modal handling
    function openNewScreenshotModal() {
      document.getElementById('new-screenshot-modal').classList.add('open');
      document.getElementById('screenshot-url').focus();
      document.body.style.overflow = 'hidden';
    }

    function closeNewScreenshotModal() {
      document.getElementById('new-screenshot-modal').classList.remove('open');
      document.getElementById('new-screenshot-form').reset();
      document.body.style.overflow = '';
    }

    function openDeleteModal(id) {
      screenshotsState.deleteTarget = id;
      screenshotsState.deleteBulk = false;
      document.getElementById('delete-modal-text').textContent =
        'Are you sure you want to delete this screenshot? This action cannot be undone.';
      document.getElementById('delete-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDeleteModal() {
      document.getElementById('delete-modal').classList.remove('open');
      screenshotsState.deleteTarget = null;
      screenshotsState.deleteBulk = false;
      document.body.style.overflow = '';
    }

    function handleModalOverlayClick(event, modalId) {
      if (event.target.id === modalId) {
        if (modalId === 'new-screenshot-modal') closeNewScreenshotModal();
        if (modalId === 'delete-modal') closeDeleteModal();
      }
    }

    // Create screenshot
    async function handleCreateScreenshot(event) {
      event.preventDefault();

      const btn = document.getElementById('create-screenshot-btn');
      const originalHtml = btn.innerHTML;

      try {
        btn.disabled = true;
        btn.innerHTML = '<span class="overview-loading-spinner"></span> Capturing...';

        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (!token) {
          showToast('Please log in to capture screenshots', 'warning');
          window.location.href = '/login?redirect=/dashboard/screenshots';
          return;
        }

        const options = {
          url: document.getElementById('screenshot-url').value,
          width: parseInt(document.getElementById('screenshot-width').value) || 1280,
          height: parseInt(document.getElementById('screenshot-height').value) || 720,
          format: document.getElementById('screenshot-format').value,
          fullPage: document.getElementById('screenshot-fullpage').checked,
          darkMode: document.getElementById('screenshot-darkmode').checked,
          blockAds: document.getElementById('screenshot-blockads').checked,
          quality: parseInt(document.getElementById('screenshot-quality').value) || 80,
          delay: parseInt(document.getElementById('screenshot-delay').value) || 0,
          waitUntil: document.getElementById('screenshot-waituntil').value,
        };

        const selector = document.getElementById('screenshot-selector').value;
        if (selector) options.selector = selector;

        const webhook = document.getElementById('screenshot-webhook').value;
        if (webhook) options.webhookUrl = webhook;

        try {
          const cookies = document.getElementById('screenshot-cookies').value;
          if (cookies) options.cookies = JSON.parse(cookies);
        } catch (e) {
          showToast('Invalid cookies JSON format', 'error');
          return;
        }

        try {
          const headers = document.getElementById('screenshot-headers').value;
          if (headers) options.headers = JSON.parse(headers);
        } catch (e) {
          showToast('Invalid headers JSON format', 'error');
          return;
        }

        const response = await fetch('/api/v1/screenshots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create screenshot');
        }

        showToast('Screenshot captured successfully!', 'success');
        closeNewScreenshotModal();
        await loadScreenshots();
      } catch (error) {
        console.error('Create screenshot error:', error);
        showToast(error.message || 'Failed to capture screenshot', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }

    // Delete screenshot
    async function confirmDelete() {
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

        if (screenshotsState.deleteBulk) {
          const selected = getSelectedItems('screenshots-table');
          for (const id of selected) {
            await fetch('/api/v1/screenshots/' + id, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token },
            });
          }
          showToast(selected.length + ' screenshots deleted', 'success');
          clearSelection('screenshots-table');
        } else {
          await fetch('/api/v1/screenshots/' + screenshotsState.deleteTarget, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token },
          });
          showToast('Screenshot deleted', 'success');
        }

        closeDeleteModal();
        await loadScreenshots();
      } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete screenshot', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }

    function handleBulkDelete() {
      const selected = getSelectedItems('screenshots-table');
      if (selected.length === 0) return;

      screenshotsState.deleteBulk = true;
      document.getElementById('delete-modal-text').textContent =
        'Are you sure you want to delete ' + selected.length + ' screenshot(s)? This action cannot be undone.';
      document.getElementById('delete-modal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Escape closes modals
      if (e.key === 'Escape') {
        if (document.getElementById('new-screenshot-modal').classList.contains('open')) {
          closeNewScreenshotModal();
        }
        if (document.getElementById('delete-modal').classList.contains('open')) {
          closeDeleteModal();
        }
      }

      // Ctrl/Cmd + N opens new screenshot modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openNewScreenshotModal();
      }
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initScreenshots);
  `;
}
