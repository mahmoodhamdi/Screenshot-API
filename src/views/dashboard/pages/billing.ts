/**
 * Billing Page
 * Subscription management, plan comparison, payment methods, and billing history
 */

export function generateBillingPage(): string {
  return `
    <div class="billing-page">
      <div class="page-header">
        <h1>Billing</h1>
        <p class="page-description">Manage your subscription and billing information</p>
      </div>

      <div class="billing-grid">
        <!-- Current Plan Section -->
        <div class="billing-card current-plan-card">
          <div class="card-header">
            <h2>Current Plan</h2>
          </div>
          <div class="card-body">
            <div class="plan-info" id="current-plan-info">
              <div class="plan-badge-container">
                <span class="plan-badge plan-badge-free" id="plan-badge">Free</span>
              </div>
              <div class="plan-details">
                <h3 class="plan-name" id="plan-name">Free Plan</h3>
                <p class="plan-price" id="plan-price">
                  <span class="price-amount">$0</span>
                  <span class="price-period">/month</span>
                </p>
                <p class="plan-renewal" id="plan-renewal">Free forever</p>
              </div>
            </div>
            <div class="plan-actions">
              <button class="btn btn-primary" onclick="openUpgradeModal()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 19V5"/>
                  <path d="M5 12l7-7 7 7"/>
                </svg>
                Upgrade Plan
              </button>
              <button class="btn btn-secondary" id="manage-billing-btn" onclick="openBillingPortal()" style="display: none;">
                Manage Billing
              </button>
              <button class="btn btn-ghost text-danger" id="cancel-plan-btn" onclick="openCancelModal()" style="display: none;">
                Cancel Plan
              </button>
            </div>
          </div>
        </div>

        <!-- Usage Summary Section -->
        <div class="billing-card usage-summary-card">
          <div class="card-header">
            <h2>Usage This Period</h2>
            <span class="usage-reset" id="usage-reset">Resets in 23 days</span>
          </div>
          <div class="card-body">
            <div class="usage-items">
              <div class="usage-item">
                <div class="usage-item-header">
                  <span class="usage-label">Screenshots</span>
                  <span class="usage-value" id="screenshots-usage">45 / 100</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" id="screenshots-fill" style="width: 45%;"></div>
                </div>
              </div>
              <div class="usage-item">
                <div class="usage-item-header">
                  <span class="usage-label">API Calls</span>
                  <span class="usage-value" id="api-calls-usage">847 / 2,000</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" id="api-calls-fill" style="width: 42%;"></div>
                </div>
              </div>
              <div class="usage-item">
                <div class="usage-item-header">
                  <span class="usage-label">Storage</span>
                  <span class="usage-value" id="storage-usage">234 MB / 500 MB</span>
                </div>
                <div class="usage-bar">
                  <div class="usage-fill" id="storage-fill" style="width: 47%;"></div>
                </div>
              </div>
            </div>
            <a href="/dashboard/usage" class="view-analytics-link">
              View detailed analytics
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14"/>
                <path d="M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Plan Comparison Section -->
      <div class="billing-card plans-comparison-card">
        <div class="card-header">
          <h2>Compare Plans</h2>
          <p>Choose the plan that's right for you</p>
        </div>
        <div class="card-body">
          <div class="plans-grid">
            <!-- Free Plan -->
            <div class="plan-card" data-plan="free">
              <div class="plan-card-header">
                <h3>Free</h3>
                <div class="plan-card-price">
                  <span class="price">$0</span>
                  <span class="period">/month</span>
                </div>
                <p class="plan-card-desc">Perfect for getting started</p>
              </div>
              <ul class="plan-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  100 screenshots/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  2,000 API calls/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  500 MB storage
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  PNG, JPEG formats
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  1920x1080 max resolution
                </li>
                <li class="disabled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Full page screenshots
                </li>
                <li class="disabled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  PDF export
                </li>
                <li class="disabled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Priority support
                </li>
              </ul>
              <button class="btn btn-secondary btn-block current-plan-indicator" id="free-btn" disabled>
                Current Plan
              </button>
            </div>

            <!-- Starter Plan -->
            <div class="plan-card" data-plan="starter">
              <div class="plan-card-header">
                <h3>Starter</h3>
                <div class="plan-card-price">
                  <span class="price">$19</span>
                  <span class="period">/month</span>
                </div>
                <p class="plan-card-desc">For small projects</p>
              </div>
              <ul class="plan-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  1,000 screenshots/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  20,000 API calls/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  5 GB storage
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  PNG, JPEG, WebP formats
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  2560x1440 max resolution
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Full page screenshots
                </li>
                <li class="disabled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  PDF export
                </li>
                <li class="disabled">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Priority support
                </li>
              </ul>
              <button class="btn btn-primary btn-block" id="starter-btn" onclick="upgradeToPlan('starter')">
                Upgrade to Starter
              </button>
            </div>

            <!-- Professional Plan -->
            <div class="plan-card popular" data-plan="professional">
              <div class="popular-badge">Most Popular</div>
              <div class="plan-card-header">
                <h3>Professional</h3>
                <div class="plan-card-price">
                  <span class="price">$49</span>
                  <span class="period">/month</span>
                </div>
                <p class="plan-card-desc">For growing businesses</p>
              </div>
              <ul class="plan-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  5,000 screenshots/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  100,000 API calls/month
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  25 GB storage
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  All formats including PDF
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  4K resolution (3840x2160)
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Full page screenshots
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Webhooks
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Priority support
                </li>
              </ul>
              <button class="btn btn-primary btn-block" id="professional-btn" onclick="upgradeToPlan('professional')">
                Upgrade to Professional
              </button>
            </div>

            <!-- Enterprise Plan -->
            <div class="plan-card" data-plan="enterprise">
              <div class="plan-card-header">
                <h3>Enterprise</h3>
                <div class="plan-card-price">
                  <span class="price">$199</span>
                  <span class="period">/month</span>
                </div>
                <p class="plan-card-desc">For large organizations</p>
              </div>
              <ul class="plan-features">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Unlimited screenshots
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Unlimited API calls
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  100 GB storage
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  All formats
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  8K resolution
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Custom headers & cookies
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  SSO & Team management
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Dedicated support
                </li>
              </ul>
              <button class="btn btn-primary btn-block" id="enterprise-btn" onclick="upgradeToPlan('enterprise')">
                Upgrade to Enterprise
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Method Section -->
      <div class="billing-card payment-method-card" id="payment-method-section" style="display: none;">
        <div class="card-header">
          <h2>Payment Method</h2>
        </div>
        <div class="card-body">
          <div class="payment-method" id="payment-method">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div class="card-info">
              <span class="card-brand" id="card-brand">Visa</span>
              <span class="card-number" id="card-number">ending in 4242</span>
              <span class="card-expiry" id="card-expiry">Expires 12/2025</span>
            </div>
            <button class="btn btn-secondary" onclick="openBillingPortal()">
              Update
            </button>
          </div>
        </div>
      </div>

      <!-- Billing History Section -->
      <div class="billing-card billing-history-card" id="billing-history-section" style="display: none;">
        <div class="card-header">
          <h2>Billing History</h2>
        </div>
        <div class="card-body">
          <div class="billing-table-container">
            <table class="billing-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody id="billing-history-tbody">
                <tr>
                  <td>Dec 1, 2024</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.00</td>
                  <td><span class="status-badge status-paid">Paid</span></td>
                  <td>
                    <a href="#" class="invoice-link" onclick="downloadInvoice('inv_123')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Nov 1, 2024</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.00</td>
                  <td><span class="status-badge status-paid">Paid</span></td>
                  <td>
                    <a href="#" class="invoice-link" onclick="downloadInvoice('inv_122')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Oct 1, 2024</td>
                  <td>Professional Plan - Monthly</td>
                  <td>$49.00</td>
                  <td><span class="status-badge status-paid">Paid</span></td>
                  <td>
                    <a href="#" class="invoice-link" onclick="downloadInvoice('inv_121')">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="billing-empty" id="billing-empty" style="display: none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <p>No billing history yet</p>
          </div>
        </div>
      </div>

      <!-- Cancel Subscription Modal -->
      <div class="modal-overlay" id="cancel-modal" style="display: none;">
        <div class="modal modal-danger">
          <div class="modal-header">
            <h2>Cancel Subscription</h2>
            <button class="modal-close" onclick="closeCancelModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="cancel-warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <p><strong>Are you sure you want to cancel?</strong></p>
                <p>Your subscription will remain active until the end of the current billing period. After that, you'll be downgraded to the Free plan.</p>
              </div>
            </div>

            <div class="cancel-benefits">
              <h4>You'll lose access to:</h4>
              <ul>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Higher screenshot limits
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  PDF export
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Priority support
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Higher resolution screenshots
                </li>
              </ul>
            </div>

            <div class="form-group">
              <label for="cancel-reason">Help us improve - why are you canceling?</label>
              <select id="cancel-reason" name="reason">
                <option value="">Select a reason (optional)</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_using">Not using it enough</option>
                <option value="missing_features">Missing features I need</option>
                <option value="found_alternative">Found an alternative</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeCancelModal()">Keep Subscription</button>
            <button class="btn btn-danger" id="confirm-cancel-btn" onclick="confirmCancelSubscription()">
              <span class="btn-text">Cancel Subscription</span>
              <span class="btn-loader" style="display: none;">
                <svg class="spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" stroke-dasharray="32" stroke-linecap="round"/>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Upgrade Confirmation Modal -->
      <div class="modal-overlay" id="upgrade-modal" style="display: none;">
        <div class="modal">
          <div class="modal-header">
            <h2>Upgrade Your Plan</h2>
            <button class="modal-close" onclick="closeUpgradeModal()" aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="upgrade-summary">
              <div class="upgrade-from">
                <span class="upgrade-label">Current Plan</span>
                <span class="upgrade-plan" id="upgrade-from-plan">Free</span>
              </div>
              <div class="upgrade-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14"/>
                  <path d="M12 5l7 7-7 7"/>
                </svg>
              </div>
              <div class="upgrade-to">
                <span class="upgrade-label">New Plan</span>
                <span class="upgrade-plan" id="upgrade-to-plan">Professional</span>
                <span class="upgrade-price" id="upgrade-price">$49/month</span>
              </div>
            </div>

            <div class="upgrade-info">
              <p>You'll be redirected to our secure payment page to complete your upgrade.</p>
              <p class="upgrade-note">Your new plan will be active immediately after payment.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeUpgradeModal()">Cancel</button>
            <button class="btn btn-primary" id="confirm-upgrade-btn" onclick="confirmUpgrade()">
              <span class="btn-text">Proceed to Payment</span>
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

export function getBillingStyles(): string {
  return `
    /* Billing Page */
    .billing-page {
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

    /* Billing Grid */
    .billing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .billing-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Billing Card */
    .billing-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .billing-card .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .billing-card .card-header h2 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
    }

    .billing-card .card-header p {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0.25rem 0 0;
    }

    .billing-card .card-body {
      padding: 1.5rem;
    }

    /* Current Plan Section */
    .plan-info {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .plan-badge-container {
      flex-shrink: 0;
    }

    .plan-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .plan-badge-free {
      background: var(--bg-tertiary);
      color: var(--text-secondary);
    }

    .plan-badge-starter {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .plan-badge-professional {
      background: rgba(139, 92, 246, 0.15);
      color: var(--accent-secondary);
    }

    .plan-badge-enterprise {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .plan-details {
      flex: 1;
    }

    .plan-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .plan-price {
      font-size: 1rem;
      margin: 0 0 0.25rem;
    }

    .price-amount {
      font-weight: 600;
      color: var(--text-primary);
    }

    .price-period {
      color: var(--text-muted);
    }

    .plan-renewal {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .plan-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .text-danger {
      color: var(--error);
    }

    /* Usage Summary */
    .usage-reset {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .usage-items {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .usage-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .usage-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .usage-value {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .usage-bar {
      height: 8px;
      background: var(--bg-tertiary);
      border-radius: 4px;
      overflow: hidden;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 4px;
      transition: width 0.6s ease;
    }

    .view-analytics-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      color: var(--accent-primary);
      transition: gap var(--transition-fast);
    }

    .view-analytics-link:hover {
      gap: 0.5rem;
    }

    .view-analytics-link svg {
      width: 16px;
      height: 16px;
    }

    /* Plans Comparison */
    .plans-comparison-card {
      margin-bottom: 1.5rem;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    @media (max-width: 1024px) {
      .plans-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
    }

    .plan-card {
      position: relative;
      padding: 1.5rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      transition: all var(--transition-fast);
    }

    .plan-card:hover {
      border-color: var(--border-hover);
    }

    .plan-card.popular {
      border-color: var(--accent-primary);
      background: rgba(99, 102, 241, 0.05);
    }

    .popular-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      padding: 0.25rem 0.75rem;
      background: var(--accent-primary);
      color: white;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 9999px;
      white-space: nowrap;
    }

    .plan-card-header {
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .plan-card-header h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }

    .plan-card-price {
      margin-bottom: 0.5rem;
    }

    .plan-card-price .price {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .plan-card-price .period {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .plan-card-desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem;
    }

    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.8125rem;
      color: var(--text-primary);
    }

    .plan-features li.disabled {
      color: var(--text-muted);
    }

    .plan-features li svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .plan-features li:not(.disabled) svg {
      color: var(--success);
    }

    .plan-features li.disabled svg {
      color: var(--text-muted);
    }

    .btn-block {
      width: 100%;
    }

    .current-plan-indicator {
      background: var(--bg-hover);
      color: var(--text-secondary);
      cursor: default;
    }

    /* Payment Method */
    .payment-method {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .card-icon {
      width: 48px;
      height: 48px;
      background: var(--bg-tertiary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
    }

    .card-icon svg {
      width: 24px;
      height: 24px;
    }

    .card-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .card-brand {
      font-weight: 600;
      color: var(--text-primary);
    }

    .card-number {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .card-expiry {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    /* Billing Table */
    .billing-table-container {
      overflow-x: auto;
    }

    .billing-table {
      width: 100%;
      border-collapse: collapse;
    }

    .billing-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
    }

    .billing-table td {
      padding: 1rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }

    .billing-table tbody tr:hover {
      background: var(--bg-hover);
    }

    .billing-table tbody tr:last-child td {
      border-bottom: none;
    }

    .status-badge {
      display: inline-flex;
      padding: 0.25rem 0.625rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .status-paid {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .status-failed {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .invoice-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--accent-primary);
      font-size: 0.8125rem;
    }

    .invoice-link svg {
      width: 16px;
      height: 16px;
    }

    .billing-empty {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--text-muted);
    }

    .billing-empty svg {
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .billing-empty p {
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
      max-width: 480px;
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

    /* Cancel Modal */
    .cancel-warning {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      margin-bottom: 1.25rem;
    }

    .cancel-warning svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: var(--error);
    }

    .cancel-warning p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .cancel-warning p + p {
      margin-top: 0.25rem;
    }

    .cancel-benefits {
      margin-bottom: 1.25rem;
    }

    .cancel-benefits h4 {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.75rem;
    }

    .cancel-benefits ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .cancel-benefits li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .cancel-benefits li svg {
      width: 16px;
      height: 16px;
      color: var(--error);
    }

    .form-group {
      margin-bottom: 0;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-group select {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }

    /* Upgrade Modal */
    .upgrade-summary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      padding: 1.5rem;
      background: var(--bg-tertiary);
      border-radius: 12px;
      margin-bottom: 1.25rem;
    }

    .upgrade-from,
    .upgrade-to {
      text-align: center;
    }

    .upgrade-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .upgrade-plan {
      display: block;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .upgrade-price {
      display: block;
      font-size: 0.875rem;
      color: var(--accent-primary);
      margin-top: 0.25rem;
    }

    .upgrade-arrow {
      color: var(--text-muted);
    }

    .upgrade-arrow svg {
      width: 24px;
      height: 24px;
    }

    .upgrade-info {
      text-align: center;
    }

    .upgrade-info p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem;
    }

    .upgrade-note {
      font-size: 0.8125rem;
      color: var(--text-muted);
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
  `;
}

export function getBillingScripts(): string {
  return `
    // Billing page state
    let currentPlan = 'free';
    let selectedPlan = null;
    let subscriptionData = null;

    // Plan pricing
    const planPrices = {
      free: { price: 0, name: 'Free' },
      starter: { price: 19, name: 'Starter' },
      professional: { price: 49, name: 'Professional' },
      enterprise: { price: 199, name: 'Enterprise' }
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      loadSubscription();
      loadUsage();
      loadBillingHistory();
    });

    // Load subscription data
    async function loadSubscription() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions', {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          subscriptionData = data.data;
          updatePlanUI(subscriptionData);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      }
    }

    // Update plan UI
    function updatePlanUI(data) {
      if (!data) return;

      currentPlan = data.plan || 'free';
      const planInfo = planPrices[currentPlan];

      // Update plan badge
      const planBadge = document.getElementById('plan-badge');
      planBadge.textContent = planInfo.name;
      planBadge.className = 'plan-badge plan-badge-' + currentPlan;

      // Update plan name
      document.getElementById('plan-name').textContent = planInfo.name + ' Plan';

      // Update plan price
      const priceEl = document.getElementById('plan-price');
      priceEl.innerHTML = '<span class="price-amount">$' + planInfo.price + '</span><span class="price-period">/month</span>';

      // Update renewal date
      const renewalEl = document.getElementById('plan-renewal');
      if (currentPlan === 'free') {
        renewalEl.textContent = 'Free forever';
      } else if (data.renewalDate) {
        const renewalDate = new Date(data.renewalDate);
        renewalEl.textContent = 'Renews on ' + renewalDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }

      // Show/hide buttons based on plan
      const manageBillingBtn = document.getElementById('manage-billing-btn');
      const cancelPlanBtn = document.getElementById('cancel-plan-btn');

      if (currentPlan !== 'free') {
        manageBillingBtn.style.display = 'inline-flex';
        cancelPlanBtn.style.display = 'inline-flex';
        document.getElementById('payment-method-section').style.display = 'block';
        document.getElementById('billing-history-section').style.display = 'block';
      }

      // Update plan cards
      updatePlanCards();

      // Update payment method if available
      if (data.paymentMethod) {
        updatePaymentMethod(data.paymentMethod);
      }
    }

    // Update plan cards
    function updatePlanCards() {
      const plans = ['free', 'starter', 'professional', 'enterprise'];
      plans.forEach(plan => {
        const btn = document.getElementById(plan + '-btn');
        if (!btn) return;

        if (plan === currentPlan) {
          btn.textContent = 'Current Plan';
          btn.disabled = true;
          btn.className = 'btn btn-secondary btn-block current-plan-indicator';
          btn.onclick = null;
        } else if (planPrices[plan].price < planPrices[currentPlan].price) {
          btn.textContent = 'Downgrade to ' + planPrices[plan].name;
          btn.className = 'btn btn-secondary btn-block';
          btn.disabled = false;
        } else {
          btn.textContent = 'Upgrade to ' + planPrices[plan].name;
          btn.className = 'btn btn-primary btn-block';
          btn.disabled = false;
        }
      });
    }

    // Update payment method
    function updatePaymentMethod(paymentMethod) {
      if (paymentMethod.brand) {
        document.getElementById('card-brand').textContent = paymentMethod.brand;
      }
      if (paymentMethod.last4) {
        document.getElementById('card-number').textContent = 'ending in ' + paymentMethod.last4;
      }
      if (paymentMethod.expMonth && paymentMethod.expYear) {
        document.getElementById('card-expiry').textContent = 'Expires ' + paymentMethod.expMonth + '/' + paymentMethod.expYear;
      }
    }

    // Load usage data
    async function loadUsage() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions/usage', {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          updateUsageUI(data.data);
        }
      } catch (error) {
        console.error('Error loading usage:', error);
      }
    }

    // Update usage UI
    function updateUsageUI(data) {
      if (!data) return;

      // Screenshots
      if (data.screenshots) {
        const used = data.screenshots.used || 0;
        const limit = data.screenshots.limit || 100;
        const percentage = Math.min((used / limit) * 100, 100);
        document.getElementById('screenshots-usage').textContent = used + ' / ' + limit;
        document.getElementById('screenshots-fill').style.width = percentage + '%';
      }

      // API Calls
      if (data.apiCalls) {
        const used = data.apiCalls.used || 0;
        const limit = data.apiCalls.limit || 2000;
        const percentage = Math.min((used / limit) * 100, 100);
        document.getElementById('api-calls-usage').textContent = formatNumber(used) + ' / ' + formatNumber(limit);
        document.getElementById('api-calls-fill').style.width = percentage + '%';
      }

      // Storage
      if (data.storage) {
        const usedMB = data.storage.used || 0;
        const limitMB = data.storage.limit || 500;
        const percentage = Math.min((usedMB / limitMB) * 100, 100);
        document.getElementById('storage-usage').textContent = usedMB + ' MB / ' + limitMB + ' MB';
        document.getElementById('storage-fill').style.width = percentage + '%';
      }

      // Days until reset
      if (data.daysUntilReset !== undefined) {
        document.getElementById('usage-reset').textContent = 'Resets in ' + data.daysUntilReset + ' days';
      }
    }

    // Format number with commas
    function formatNumber(num) {
      return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
    }

    // Load billing history
    async function loadBillingHistory() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions/invoices', {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          updateBillingHistoryUI(data.data);
        }
      } catch (error) {
        console.error('Error loading billing history:', error);
      }
    }

    // Update billing history UI
    function updateBillingHistoryUI(invoices) {
      const tbody = document.getElementById('billing-history-tbody');
      const emptyState = document.getElementById('billing-empty');

      if (!invoices || invoices.length === 0) {
        tbody.style.display = 'none';
        emptyState.style.display = 'block';
        return;
      }

      tbody.innerHTML = invoices.map(invoice => {
        const date = new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusClass = invoice.status === 'paid' ? 'status-paid' : invoice.status === 'pending' ? 'status-pending' : 'status-failed';

        return '<tr>' +
          '<td>' + date + '</td>' +
          '<td>' + invoice.description + '</td>' +
          '<td>$' + (invoice.amount / 100).toFixed(2) + '</td>' +
          '<td><span class="status-badge ' + statusClass + '">' + invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) + '</span></td>' +
          '<td><a href="#" class="invoice-link" onclick="downloadInvoice(\\'' + invoice.id + '\\')">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>' +
              '<polyline points="7 10 12 15 17 10"/>' +
              '<line x1="12" y1="15" x2="12" y2="3"/>' +
            '</svg>Download</a></td>' +
        '</tr>';
      }).join('');
    }

    // Upgrade to plan
    function upgradeToPlan(plan) {
      selectedPlan = plan;
      const planInfo = planPrices[plan];

      document.getElementById('upgrade-from-plan').textContent = planPrices[currentPlan].name;
      document.getElementById('upgrade-to-plan').textContent = planInfo.name;
      document.getElementById('upgrade-price').textContent = '$' + planInfo.price + '/month';

      document.getElementById('upgrade-modal').style.display = 'flex';
    }

    // Open upgrade modal
    function openUpgradeModal() {
      // Default to professional if no plan selected
      if (!selectedPlan) {
        selectedPlan = 'professional';
      }
      upgradeToPlan(selectedPlan);
    }

    // Close upgrade modal
    function closeUpgradeModal() {
      document.getElementById('upgrade-modal').style.display = 'none';
      selectedPlan = null;
    }

    // Confirm upgrade
    async function confirmUpgrade() {
      if (!selectedPlan) return;

      const btn = document.getElementById('confirm-upgrade-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions/checkout', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ plan: selectedPlan })
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const data = await response.json();

        // Redirect to Stripe Checkout
        if (data.data && data.data.url) {
          window.location.href = data.data.url;
        }
      } catch (error) {
        console.error('Checkout error:', error);
        showToast('Failed to start checkout. Please try again.', 'error');
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Open billing portal
    async function openBillingPortal() {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions/portal', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to open billing portal');
        }

        const data = await response.json();

        // Redirect to Stripe Portal
        if (data.data && data.data.url) {
          window.location.href = data.data.url;
        }
      } catch (error) {
        console.error('Portal error:', error);
        showToast('Failed to open billing portal. Please try again.', 'error');
      }
    }

    // Open cancel modal
    function openCancelModal() {
      document.getElementById('cancel-modal').style.display = 'flex';
    }

    // Close cancel modal
    function closeCancelModal() {
      document.getElementById('cancel-modal').style.display = 'none';
    }

    // Confirm cancel subscription
    async function confirmCancelSubscription() {
      const btn = document.getElementById('confirm-cancel-btn');
      const btnText = btn.querySelector('.btn-text');
      const btnLoader = btn.querySelector('.btn-loader');

      const reason = document.getElementById('cancel-reason').value;

      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-flex';
      btn.disabled = true;

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        });

        if (!response.ok) {
          throw new Error('Failed to cancel subscription');
        }

        showToast('Subscription cancelled. You will retain access until the end of your billing period.', 'success');
        closeCancelModal();

        // Reload subscription data
        loadSubscription();
      } catch (error) {
        console.error('Cancel error:', error);
        showToast('Failed to cancel subscription. Please try again.', 'error');
      } finally {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        btn.disabled = false;
      }
    }

    // Download invoice
    async function downloadInvoice(invoiceId) {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/subscriptions/invoices/' + invoiceId + '/download', {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to download invoice');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice-' + invoiceId + '.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        showToast('Failed to download invoice', 'error');
      }
    }

    // Close modals on escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeUpgradeModal();
        closeCancelModal();
      }
    });
  `;
}
