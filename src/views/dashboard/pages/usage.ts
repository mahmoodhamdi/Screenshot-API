/**
 * Usage & Analytics Page
 * View usage statistics, charts, and API performance metrics
 */

import {
  generateBarChart,
  generateDonutChart,
  BarChartData,
  DonutChartData,
} from '../components/chart';

export function generateUsagePage(): string {
  // Sample data for initial render (will be replaced by API data)
  const screenshotsOverTime: BarChartData[] = [
    { label: 'Mon', value: 45 },
    { label: 'Tue', value: 62 },
    { label: 'Wed', value: 38 },
    { label: 'Thu', value: 85 },
    { label: 'Fri', value: 72 },
    { label: 'Sat', value: 28 },
    { label: 'Sun', value: 15 },
  ];

  const formatDistribution: DonutChartData[] = [
    { label: 'PNG', value: 245, color: '#6366f1' },
    { label: 'JPEG', value: 128, color: '#8b5cf6' },
    { label: 'WebP', value: 67, color: '#06b6d4' },
    { label: 'PDF', value: 23, color: '#10b981' },
  ];

  const statusDistribution: DonutChartData[] = [
    { label: 'Completed', value: 423, color: '#10b981' },
    { label: 'Failed', value: 40, color: '#ef4444' },
  ];

  const totalScreenshots = formatDistribution.reduce((sum, item) => sum + item.value, 0);

  return `
    <div class="usage-page">
      <!-- Header -->
      <div class="page-header">
        <div class="page-header-content">
          <h1>Usage & Analytics</h1>
          <div class="page-header-actions">
            <!-- Date Range Picker -->
            <div class="date-range-picker">
              <button class="date-range-btn active" data-range="7">Last 7 days</button>
              <button class="date-range-btn" data-range="30">Last 30 days</button>
              <button class="date-range-btn" data-range="90">Last 90 days</button>
              <button class="date-range-btn" data-range="custom">Custom</button>
            </div>
            <!-- Export Button -->
            <button class="btn btn-secondary" onclick="exportAnalytics()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Date Range Modal -->
      <div class="date-picker-modal" id="date-picker-modal" style="display: none;">
        <div class="date-picker-content">
          <h3>Select Date Range</h3>
          <div class="date-picker-inputs">
            <div class="form-group">
              <label for="start-date">Start Date</label>
              <input type="date" id="start-date" name="startDate">
            </div>
            <div class="form-group">
              <label for="end-date">End Date</label>
              <input type="date" id="end-date" name="endDate">
            </div>
          </div>
          <div class="date-picker-actions">
            <button class="btn btn-secondary" onclick="closeDatePicker()">Cancel</button>
            <button class="btn btn-primary" onclick="applyDateRange()">Apply</button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="usage-stats-grid" id="usage-stats">
        <div class="usage-stat-card">
          <div class="usage-stat-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--accent-primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </div>
          <div class="usage-stat-content">
            <span class="usage-stat-label">Total Screenshots</span>
            <span class="usage-stat-value" id="stat-total">463</span>
            <span class="usage-stat-change positive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              12% from last period
            </span>
          </div>
        </div>

        <div class="usage-stat-card">
          <div class="usage-stat-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--success);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="usage-stat-content">
            <span class="usage-stat-label">Successful</span>
            <span class="usage-stat-value" id="stat-successful">423</span>
            <span class="usage-stat-change positive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              8% from last period
            </span>
          </div>
        </div>

        <div class="usage-stat-card">
          <div class="usage-stat-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--error);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="usage-stat-content">
            <span class="usage-stat-label">Failed</span>
            <span class="usage-stat-value" id="stat-failed">40</span>
            <span class="usage-stat-change negative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              5% from last period
            </span>
          </div>
        </div>

        <div class="usage-stat-card">
          <div class="usage-stat-icon" style="background: rgba(139, 92, 246, 0.15); color: var(--accent-secondary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20V10"/>
              <path d="M18 20V4"/>
              <path d="M6 20v-4"/>
            </svg>
          </div>
          <div class="usage-stat-content">
            <span class="usage-stat-label">Success Rate</span>
            <span class="usage-stat-value" id="stat-rate">91.4%</span>
            <span class="usage-stat-change positive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"/>
              </svg>
              2.3% from last period
            </span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="usage-charts-grid">
        <!-- Screenshots Over Time -->
        <div class="usage-chart-card">
          <div class="chart-card-header">
            <h3>Screenshots Over Time</h3>
            <div class="chart-toggle">
              <button class="chart-toggle-btn active" data-view="daily">Daily</button>
              <button class="chart-toggle-btn" data-view="weekly">Weekly</button>
              <button class="chart-toggle-btn" data-view="monthly">Monthly</button>
            </div>
          </div>
          <div class="chart-card-body" id="screenshots-chart-container">
            ${generateBarChart({
              id: 'screenshots-bar-chart',
              data: screenshotsOverTime,
              height: 220,
              showLabels: true,
              showValues: true,
              animated: true,
            })}
          </div>
        </div>

        <!-- Format Distribution -->
        <div class="usage-chart-card">
          <div class="chart-card-header">
            <h3>Format Distribution</h3>
          </div>
          <div class="chart-card-body">
            ${generateDonutChart({
              id: 'format-donut-chart',
              data: formatDistribution,
              size: 160,
              thickness: 20,
              showLegend: true,
              showCenter: true,
              centerValue: totalScreenshots.toString(),
              centerLabel: 'Total',
            })}
          </div>
        </div>
      </div>

      <!-- Second Charts Row -->
      <div class="usage-charts-grid">
        <!-- Status Distribution -->
        <div class="usage-chart-card usage-chart-card-sm">
          <div class="chart-card-header">
            <h3>Status Distribution</h3>
          </div>
          <div class="chart-card-body">
            ${generateDonutChart({
              id: 'status-donut-chart',
              data: statusDistribution,
              size: 140,
              thickness: 18,
              showLegend: true,
              showCenter: true,
              centerValue: '91.4%',
              centerLabel: 'Success',
            })}
          </div>
        </div>

        <!-- API Performance -->
        <div class="usage-chart-card">
          <div class="chart-card-header">
            <h3>API Performance</h3>
          </div>
          <div class="chart-card-body">
            <div class="api-metrics-grid">
              <div class="api-metric">
                <div class="api-metric-header">
                  <span class="api-metric-label">Average Response Time</span>
                  <span class="api-metric-value" id="avg-response-time">1.24s</span>
                </div>
                <div class="api-metric-bar">
                  <div class="api-metric-fill" style="width: 62%; background: var(--accent-primary);"></div>
                </div>
                <span class="api-metric-hint">Target: < 2s</span>
              </div>
              <div class="api-metric">
                <div class="api-metric-header">
                  <span class="api-metric-label">API Calls Today</span>
                  <span class="api-metric-value" id="api-calls-today">847</span>
                </div>
                <div class="api-metric-bar">
                  <div class="api-metric-fill" style="width: 42%; background: var(--accent-secondary);"></div>
                </div>
                <span class="api-metric-hint">Limit: 2,000/day</span>
              </div>
              <div class="api-metric">
                <div class="api-metric-header">
                  <span class="api-metric-label">Error Rate</span>
                  <span class="api-metric-value" id="error-rate">2.1%</span>
                </div>
                <div class="api-metric-bar">
                  <div class="api-metric-fill" style="width: 21%; background: var(--warning);"></div>
                </div>
                <span class="api-metric-hint">Target: < 5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top URLs Section -->
      <div class="usage-section">
        <div class="section-header">
          <h3>Top Captured URLs</h3>
          <span class="section-hint">Most frequently captured URLs in the selected period</span>
        </div>
        <div class="usage-table-container">
          <table class="usage-table" id="top-urls-table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Count</th>
                <th>Success Rate</th>
                <th>Avg. Time</th>
                <th>Last Captured</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="url-cell">
                  <span class="url-text">https://example.com</span>
                </td>
                <td>89</td>
                <td><span class="rate-badge rate-good">98%</span></td>
                <td>1.1s</td>
                <td class="date-cell">2 hours ago</td>
              </tr>
              <tr>
                <td class="url-cell">
                  <span class="url-text">https://github.com/features</span>
                </td>
                <td>67</td>
                <td><span class="rate-badge rate-good">95%</span></td>
                <td>1.8s</td>
                <td class="date-cell">5 hours ago</td>
              </tr>
              <tr>
                <td class="url-cell">
                  <span class="url-text">https://docs.stripe.com/api</span>
                </td>
                <td>45</td>
                <td><span class="rate-badge rate-warning">87%</span></td>
                <td>2.3s</td>
                <td class="date-cell">1 day ago</td>
              </tr>
              <tr>
                <td class="url-cell">
                  <span class="url-text">https://tailwindcss.com/docs</span>
                </td>
                <td>38</td>
                <td><span class="rate-badge rate-good">100%</span></td>
                <td>0.9s</td>
                <td class="date-cell">3 hours ago</td>
              </tr>
              <tr>
                <td class="url-cell">
                  <span class="url-text">https://vercel.com/dashboard</span>
                </td>
                <td>31</td>
                <td><span class="rate-badge rate-bad">72%</span></td>
                <td>3.1s</td>
                <td class="date-cell">6 hours ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Usage by API Key Section -->
      <div class="usage-section">
        <div class="section-header">
          <h3>Usage by API Key</h3>
          <span class="section-hint">Breakdown of usage per API key</span>
        </div>
        <div class="usage-table-container">
          <table class="usage-table" id="api-key-usage-table">
            <thead>
              <tr>
                <th>Key Name</th>
                <th>Screenshots</th>
                <th>API Calls</th>
                <th>Bandwidth</th>
                <th>Last Used</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="key-name-cell">
                  <span class="key-name">Production API Key</span>
                  <span class="key-preview">ss_prod_...x7f2</span>
                </td>
                <td>312</td>
                <td>1,247</td>
                <td>45.2 MB</td>
                <td class="date-cell">5 minutes ago</td>
                <td><span class="status-badge status-badge-active"><span class="status-dot"></span>Active</span></td>
              </tr>
              <tr>
                <td class="key-name-cell">
                  <span class="key-name">Development Key</span>
                  <span class="key-preview">ss_dev_...k9m3</span>
                </td>
                <td>89</td>
                <td>356</td>
                <td>12.8 MB</td>
                <td class="date-cell">2 hours ago</td>
                <td><span class="status-badge status-badge-active"><span class="status-dot"></span>Active</span></td>
              </tr>
              <tr>
                <td class="key-name-cell">
                  <span class="key-name">Testing Key</span>
                  <span class="key-preview">ss_test_...p4q8</span>
                </td>
                <td>62</td>
                <td>248</td>
                <td>8.4 MB</td>
                <td class="date-cell">1 day ago</td>
                <td><span class="status-badge status-badge-active"><span class="status-dot"></span>Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- API Endpoints Usage -->
      <div class="usage-section">
        <div class="section-header">
          <h3>API Endpoints Usage</h3>
          <span class="section-hint">Breakdown by endpoint</span>
        </div>
        <div class="endpoints-grid">
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="endpoint-method post">POST</span>
              <span class="endpoint-path">/api/v1/screenshots</span>
            </div>
            <div class="endpoint-stats">
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">463</span>
                <span class="endpoint-stat-label">Calls</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">1.24s</span>
                <span class="endpoint-stat-label">Avg Time</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">8.6%</span>
                <span class="endpoint-stat-label">Error Rate</span>
              </div>
            </div>
          </div>
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="endpoint-method get">GET</span>
              <span class="endpoint-path">/api/v1/screenshots</span>
            </div>
            <div class="endpoint-stats">
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">1,284</span>
                <span class="endpoint-stat-label">Calls</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">0.08s</span>
                <span class="endpoint-stat-label">Avg Time</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">0.2%</span>
                <span class="endpoint-stat-label">Error Rate</span>
              </div>
            </div>
          </div>
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="endpoint-method get">GET</span>
              <span class="endpoint-path">/api/v1/screenshots/:id</span>
            </div>
            <div class="endpoint-stats">
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">892</span>
                <span class="endpoint-stat-label">Calls</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">0.05s</span>
                <span class="endpoint-stat-label">Avg Time</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">1.1%</span>
                <span class="endpoint-stat-label">Error Rate</span>
              </div>
            </div>
          </div>
          <div class="endpoint-card">
            <div class="endpoint-header">
              <span class="endpoint-method delete">DELETE</span>
              <span class="endpoint-path">/api/v1/screenshots/:id</span>
            </div>
            <div class="endpoint-stats">
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">47</span>
                <span class="endpoint-stat-label">Calls</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">0.12s</span>
                <span class="endpoint-stat-label">Avg Time</span>
              </div>
              <div class="endpoint-stat">
                <span class="endpoint-stat-value">0%</span>
                <span class="endpoint-stat-label">Error Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function getUsageStyles(): string {
  return `
    /* Usage Page */
    .usage-page {
      max-width: 1400px;
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

    .page-header-content h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }

    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    /* Date Range Picker */
    .date-range-picker {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .date-range-btn {
      padding: 0.5rem 0.875rem;
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      border-right: 1px solid var(--border-color);
    }

    .date-range-btn:last-child {
      border-right: none;
    }

    .date-range-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .date-range-btn.active {
      background: var(--accent-primary);
      color: white;
    }

    /* Date Picker Modal */
    .date-picker-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.5rem;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }

    .date-picker-modal h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .date-picker-inputs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .date-picker-inputs .form-group {
      flex: 1;
    }

    .date-picker-inputs label {
      display: block;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 0.375rem;
    }

    .date-picker-inputs input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .date-picker-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    /* Usage Stats Grid */
    .usage-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1024px) {
      .usage-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .usage-stats-grid {
        grid-template-columns: 1fr;
      }
    }

    .usage-stat-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
    }

    .usage-stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 10px;
      flex-shrink: 0;
    }

    .usage-stat-icon svg {
      width: 24px;
      height: 24px;
    }

    .usage-stat-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .usage-stat-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .usage-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .usage-stat-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      margin-top: 0.375rem;
    }

    .usage-stat-change svg {
      width: 14px;
      height: 14px;
    }

    .usage-stat-change.positive {
      color: var(--success);
    }

    .usage-stat-change.negative {
      color: var(--error);
    }

    /* Charts Grid */
    .usage-charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1024px) {
      .usage-charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .usage-chart-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }

    .usage-chart-card-sm {
      max-width: 400px;
    }

    .chart-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .chart-card-header h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      margin: 0;
    }

    .chart-toggle {
      display: flex;
      background: var(--bg-tertiary);
      border-radius: 6px;
      overflow: hidden;
    }

    .chart-toggle-btn {
      padding: 0.375rem 0.75rem;
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .chart-toggle-btn:hover {
      color: var(--text-secondary);
    }

    .chart-toggle-btn.active {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .chart-card-body {
      padding: 1.25rem;
    }

    /* API Metrics */
    .api-metrics-grid {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .api-metric {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .api-metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .api-metric-label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .api-metric-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .api-metric-bar {
      height: 6px;
      background: var(--bg-tertiary);
      border-radius: 3px;
      overflow: hidden;
    }

    .api-metric-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;
    }

    .api-metric-hint {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    /* Usage Section */
    .usage-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      overflow: hidden;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .section-header h3 {
      font-size: 0.9375rem;
      font-weight: 600;
      margin: 0;
    }

    .section-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    /* Usage Table */
    .usage-table-container {
      overflow-x: auto;
    }

    .usage-table {
      width: 100%;
      border-collapse: collapse;
    }

    .usage-table th {
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

    .usage-table td {
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
      color: var(--text-primary);
      border-bottom: 1px solid var(--border-color);
    }

    .usage-table tbody tr:hover {
      background: var(--bg-hover);
    }

    .usage-table tbody tr:last-child td {
      border-bottom: none;
    }

    .url-cell {
      max-width: 300px;
    }

    .url-text {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--accent-primary);
    }

    .date-cell {
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .key-name-cell {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .key-name {
      font-weight: 500;
    }

    .key-preview {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .rate-badge {
      display: inline-flex;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 4px;
    }

    .rate-good {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .rate-warning {
      background: rgba(245, 158, 11, 0.15);
      color: var(--warning);
    }

    .rate-bad {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    /* Status Badge */
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

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    /* Endpoints Grid */
    .endpoints-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      padding: 1.25rem;
    }

    @media (max-width: 768px) {
      .endpoints-grid {
        grid-template-columns: 1fr;
      }
    }

    .endpoint-card {
      padding: 1rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.875rem;
    }

    .endpoint-method {
      padding: 0.25rem 0.5rem;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
    }

    .endpoint-method.get {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }

    .endpoint-method.post {
      background: rgba(99, 102, 241, 0.15);
      color: var(--accent-primary);
    }

    .endpoint-method.delete {
      background: rgba(239, 68, 68, 0.15);
      color: var(--error);
    }

    .endpoint-path {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      color: var(--text-primary);
    }

    .endpoint-stats {
      display: flex;
      gap: 1.5rem;
    }

    .endpoint-stat {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .endpoint-stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .endpoint-stat-label {
      font-size: 0.6875rem;
      color: var(--text-muted);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-header-actions {
        width: 100%;
        flex-direction: column;
      }

      .date-range-picker {
        width: 100%;
      }

      .date-range-btn {
        flex: 1;
        text-align: center;
      }
    }
  `;
}

export function getUsageScripts(): string {
  return `
    // Usage page state
    let currentDateRange = '7';
    let analyticsData = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
      initDateRangePicker();
      initChartToggles();
      loadAnalytics();
    });

    // Date range picker
    function initDateRangePicker() {
      const buttons = document.querySelectorAll('.date-range-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', function() {
          const range = this.getAttribute('data-range');

          if (range === 'custom') {
            openDatePicker();
            return;
          }

          buttons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          currentDateRange = range;
          loadAnalytics();
        });
      });
    }

    function openDatePicker() {
      const modal = document.getElementById('date-picker-modal');
      if (modal) modal.style.display = 'block';
    }

    function closeDatePicker() {
      const modal = document.getElementById('date-picker-modal');
      if (modal) modal.style.display = 'none';
    }

    function applyDateRange() {
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;

      if (!startDate || !endDate) {
        showToast('Please select both start and end dates', 'error');
        return;
      }

      // Update button states
      document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-range') === 'custom') {
          btn.classList.add('active');
        }
      });

      currentDateRange = 'custom';
      closeDatePicker();
      loadAnalytics(startDate, endDate);
    }

    // Chart toggles
    function initChartToggles() {
      const toggles = document.querySelectorAll('.chart-toggle');
      toggles.forEach(toggle => {
        const buttons = toggle.querySelectorAll('.chart-toggle-btn');
        buttons.forEach(btn => {
          btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.getAttribute('data-view');
            updateChartView(view);
          });
        });
      });
    }

    function updateChartView(view) {
      // This would update the chart data based on daily/weekly/monthly view
      console.log('Switching to view:', view);
      // In a real implementation, this would fetch new data and re-render the chart
    }

    // Load analytics data
    async function loadAnalytics(startDate, endDate) {
      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        let url = '/api/v1/analytics/overview?range=' + currentDateRange;

        if (startDate && endDate) {
          url = '/api/v1/analytics/overview?startDate=' + startDate + '&endDate=' + endDate;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // Use sample data if API fails
          console.log('Using sample analytics data');
          return;
        }

        const data = await response.json();
        analyticsData = data.data;
        updateAnalyticsUI(analyticsData);
      } catch (error) {
        console.error('Error loading analytics:', error);
        // Keep using sample data
      }
    }

    // Update UI with analytics data
    function updateAnalyticsUI(data) {
      if (!data) return;

      // Update stat cards
      if (data.total !== undefined) {
        document.getElementById('stat-total').textContent = formatNumber(data.total);
      }
      if (data.successful !== undefined) {
        document.getElementById('stat-successful').textContent = formatNumber(data.successful);
      }
      if (data.failed !== undefined) {
        document.getElementById('stat-failed').textContent = formatNumber(data.failed);
      }
      if (data.successRate !== undefined) {
        document.getElementById('stat-rate').textContent = data.successRate.toFixed(1) + '%';
      }

      // Update API metrics
      if (data.avgResponseTime !== undefined) {
        document.getElementById('avg-response-time').textContent = data.avgResponseTime.toFixed(2) + 's';
      }
      if (data.apiCallsToday !== undefined) {
        document.getElementById('api-calls-today').textContent = formatNumber(data.apiCallsToday);
      }
      if (data.errorRate !== undefined) {
        document.getElementById('error-rate').textContent = data.errorRate.toFixed(1) + '%';
      }
    }

    // Format number helper
    function formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      }
      return num.toString();
    }

    // Export analytics
    async function exportAnalytics() {
      showToast('Preparing export...', 'success');

      try {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const response = await fetch('/api/v1/analytics/export?format=csv&range=' + currentDateRange, {
          headers: {
            'Authorization': 'Bearer ' + token
          }
        });

        if (!response.ok) {
          throw new Error('Export failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'analytics-' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Export downloaded successfully', 'success');
      } catch (error) {
        console.error('Export error:', error);
        showToast('Export failed. Please try again.', 'error');
      }
    }

    // Initialize chart interactions
    document.addEventListener('DOMContentLoaded', function() {
      if (typeof initBarChartInteractions === 'function') {
        initBarChartInteractions('screenshots-bar-chart');
      }
      if (typeof initDonutChartInteractions === 'function') {
        initDonutChartInteractions('format-donut-chart');
        initDonutChartInteractions('status-donut-chart');
      }
    });
  `;
}
