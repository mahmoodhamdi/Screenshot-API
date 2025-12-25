/**
 * Code Demo Section
 * Interactive code examples showing API usage with live response preview
 */

interface CodeLanguage {
  id: string;
  name: string;
  icon: string;
}

const languages: CodeLanguage[] = [
  { id: 'curl', name: 'cURL', icon: getCurlIcon() },
  { id: 'nodejs', name: 'Node.js', icon: getNodeIcon() },
  { id: 'python', name: 'Python', icon: getPythonIcon() },
  { id: 'php', name: 'PHP', icon: getPhpIcon() },
];

export function generateCodeDemoSection(): string {
  const tabs = languages
    .map(
      (lang, i) => `
      <button class="code-tab ${i === 0 ? 'active' : ''}" data-lang="${lang.id}" aria-selected="${i === 0}">
        <span class="code-tab-icon">${lang.icon}</span>
        <span class="code-tab-name">${lang.name}</span>
      </button>
    `
    )
    .join('');

  return `
    <section class="code-demo-section section" id="code-demo">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header" data-animate>
          <div class="section-badge">
            <span class="badge-dot"></span>
            <span>Developer Experience</span>
          </div>
          <h2 class="section-title">Simple Integration, <span class="gradient-text">Powerful Results</span></h2>
          <p class="section-description">
            Get started in minutes with our well-documented API. We provide SDKs for popular languages and comprehensive examples.
          </p>
        </div>

        <div class="code-demo-layout">
          <!-- Left Side - Code Editor -->
          <div class="code-demo-editor" data-animate data-delay="100">
            <!-- Window Chrome -->
            <div class="code-editor-chrome">
              <div class="window-controls">
                <span class="window-dot dot-red"></span>
                <span class="window-dot dot-yellow"></span>
                <span class="window-dot dot-green"></span>
              </div>
              <div class="window-title">
                <span class="file-icon">${getFileIcon()}</span>
                <span>screenshot-api.sh</span>
              </div>
              <button class="copy-button" id="copy-code-btn" aria-label="Copy code">
                <span class="copy-icon">${getCopyIcon()}</span>
                <span class="copy-text">Copy</span>
              </button>
            </div>

            <!-- Language Tabs -->
            <div class="code-editor-header">
              <div class="code-tabs" role="tablist">
                ${tabs}
              </div>
            </div>

            <!-- Code Content with Line Numbers -->
            <div class="code-editor-content">
              <div class="code-panel active" id="code-curl" role="tabpanel">
                <div class="line-numbers" aria-hidden="true">${generateLineNumbers(10)}</div>
                <pre><code>${getCurlExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-nodejs" role="tabpanel">
                <div class="line-numbers" aria-hidden="true">${generateLineNumbers(15)}</div>
                <pre><code>${getNodejsExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-python" role="tabpanel">
                <div class="line-numbers" aria-hidden="true">${generateLineNumbers(14)}</div>
                <pre><code>${getPythonExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-php" role="tabpanel">
                <div class="line-numbers" aria-hidden="true">${generateLineNumbers(15)}</div>
                <pre><code>${getPhpExample()}</code></pre>
              </div>
            </div>
          </div>

          <!-- Right Side - Response Preview -->
          <div class="code-demo-response" data-animate data-delay="200">
            <!-- Response Chrome -->
            <div class="response-chrome">
              <div class="window-controls">
                <span class="window-dot dot-red"></span>
                <span class="window-dot dot-yellow"></span>
                <span class="window-dot dot-green"></span>
              </div>
              <div class="window-title">
                <span class="response-status">
                  <span class="status-dot status-success"></span>
                  <span>200 OK</span>
                </span>
              </div>
              <div class="response-time-badge">
                <span class="time-icon">${getClockIcon()}</span>
                <span class="response-time">1.2s</span>
              </div>
            </div>

            <!-- Response Content -->
            <div class="response-content">
              <div class="response-header">
                <span class="response-label">Response</span>
                <span class="response-type">application/json</span>
              </div>

              <!-- JSON Response with Typing Animation -->
              <div class="response-body">
                <pre><code id="response-json" class="typing-animation">${getJsonResponse()}</code></pre>
              </div>

              <!-- Screenshot Preview -->
              <div class="screenshot-preview">
                <div class="preview-header">
                  <span class="preview-label">Screenshot Preview</span>
                  <span class="preview-size">1920 × 1080</span>
                </div>
                <div class="preview-thumbnail">
                  <div class="thumbnail-placeholder">
                    <div class="thumbnail-browser">
                      <div class="thumbnail-bar"></div>
                      <div class="thumbnail-content">
                        <div class="thumbnail-header"></div>
                        <div class="thumbnail-line"></div>
                        <div class="thumbnail-line short"></div>
                        <div class="thumbnail-blocks">
                          <div class="thumbnail-block"></div>
                          <div class="thumbnail-block"></div>
                          <div class="thumbnail-block"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="preview-overlay">
                    <span class="preview-badge">
                      ${getImageIcon()}
                      <span>PNG</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature Highlights -->
        <div class="code-demo-features" data-animate data-delay="300">
          <div class="feature-highlight">
            <span class="feature-icon">${getCheckCircleIcon()}</span>
            <span>RESTful API</span>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">${getCheckCircleIcon()}</span>
            <span>JSON Responses</span>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">${getCheckCircleIcon()}</span>
            <span>Webhook Support</span>
          </div>
          <div class="feature-highlight">
            <span class="feature-icon">${getCheckCircleIcon()}</span>
            <span>Multiple SDKs</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function generateLineNumbers(count: number): string {
  return Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join('');
}

// Icon helpers
function getCurlIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 17l6-6-6-6"/>
    <path d="M12 19h8"/>
  </svg>`;
}

function getNodeIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.985c-.275 0-.532-.074-.772-.202l-2.439-1.448c-.365-.203-.182-.277-.072-.314.496-.165.588-.201 1.101-.493.056-.037.129-.02.185.017l1.87 1.12c.074.036.166.036.221 0l7.319-4.237c.074-.036.11-.11.11-.202V7.768c0-.091-.036-.165-.11-.201l-7.319-4.219c-.073-.037-.165-.037-.221 0L4.552 7.566c-.073.036-.11.129-.11.201v8.457c0 .073.037.166.11.202l2 1.157c1.082.548 1.762-.095 1.762-.735V8.502c0-.11.091-.221.22-.221h.936c.108 0 .22.092.22.221v8.347c0 1.449-.788 2.294-2.164 2.294-.422 0-.752 0-1.688-.46l-1.925-1.099a1.55 1.55 0 0 1-.771-1.34V7.786c0-.55.293-1.064.771-1.339l7.316-4.237a1.637 1.637 0 0 1 1.544 0l7.317 4.237c.479.274.771.789.771 1.339v8.458c0 .549-.293 1.063-.771 1.34l-7.317 4.236c-.241.11-.516.165-.773.165z"/>
  </svg>`;
}

function getPythonIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.852 0 6.182 2.633 6.182 2.633l.007 2.73h5.925v.82H4.455S0 5.702 0 11.869s3.886 5.947 3.886 5.947h2.32v-2.862s-.125-3.886 3.823-3.886h6.587s3.702.06 3.702-3.578V3.912S20.852 0 12 0zm-2.79 2.258c.655 0 1.188.532 1.188 1.188 0 .655-.533 1.188-1.188 1.188-.656 0-1.188-.533-1.188-1.188 0-.656.532-1.188 1.188-1.188z"/>
    <path d="M12 24c6.148 0 5.818-2.633 5.818-2.633l-.007-2.73h-5.925v-.82h7.659S24 18.298 24 12.131s-3.886-5.947-3.886-5.947h-2.32v2.862s.125 3.886-3.823 3.886H7.384s-3.702-.06-3.702 3.578v3.578S3.148 24 12 24zm2.79-2.258c-.655 0-1.188-.532-1.188-1.188 0-.655.533-1.188 1.188-1.188.656 0 1.188.533 1.188 1.188 0 .656-.532 1.188-1.188 1.188z"/>
  </svg>`;
}

function getPhpIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="currentColor">
    <ellipse cx="12" cy="12" rx="12" ry="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="12" y="14" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor">php</text>
  </svg>`;
}

function getFileIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>`;
}

function getCopyIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;
}

function getClockIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`;
}

function getImageIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>`;
}

function getCheckCircleIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`;
}

function getCurlExample(): string {
  return `<span class="code-comment"># Capture a screenshot with cURL</span>
<span class="code-keyword">curl</span> -X POST <span class="code-string">"https://api.screenshot.dev/v1/screenshots"</span> <span class="code-operator">\\</span>
  -H <span class="code-string">"X-API-Key: sk_live_xxxxx"</span> <span class="code-operator">\\</span>
  -H <span class="code-string">"Content-Type: application/json"</span> <span class="code-operator">\\</span>
  -d <span class="code-string">'{
    "url": "https://example.com",
    "format": "png",
    "fullPage": true,
    "viewport": { "width": 1920, "height": 1080 }
  }'</span>`;
}

function getNodejsExample(): string {
  return `<span class="code-comment">// Screenshot API - Node.js SDK</span>
<span class="code-keyword">import</span> { ScreenshotAPI } <span class="code-keyword">from</span> <span class="code-string">'@screenshot-api/sdk'</span>;

<span class="code-keyword">const</span> client = <span class="code-keyword">new</span> <span class="code-function">ScreenshotAPI</span>(<span class="code-string">'sk_live_xxxxx'</span>);

<span class="code-keyword">const</span> screenshot = <span class="code-keyword">await</span> client.<span class="code-function">capture</span>({
  url: <span class="code-string">'https://example.com'</span>,
  format: <span class="code-string">'png'</span>,
  fullPage: <span class="code-boolean">true</span>,
  viewport: {
    width: <span class="code-number">1920</span>,
    height: <span class="code-number">1080</span>
  }
});

console.<span class="code-function">log</span>(screenshot.url);`;
}

function getPythonExample(): string {
  return `<span class="code-comment"># Screenshot API - Python SDK</span>
<span class="code-keyword">from</span> screenshot_api <span class="code-keyword">import</span> ScreenshotAPI

client = <span class="code-function">ScreenshotAPI</span>(<span class="code-string">"sk_live_xxxxx"</span>)

screenshot = client.<span class="code-function">capture</span>(
    url=<span class="code-string">"https://example.com"</span>,
    format=<span class="code-string">"png"</span>,
    full_page=<span class="code-boolean">True</span>,
    viewport={
        <span class="code-string">"width"</span>: <span class="code-number">1920</span>,
        <span class="code-string">"height"</span>: <span class="code-number">1080</span>
    }
)

<span class="code-function">print</span>(screenshot.url)`;
}

function getPhpExample(): string {
  return `<span class="code-comment">// Screenshot API - PHP SDK</span>
<span class="code-keyword">&lt;?php</span>
<span class="code-keyword">use</span> ScreenshotAPI\\<span class="code-class">Client</span>;

<span class="code-variable">$client</span> = <span class="code-keyword">new</span> <span class="code-function">Client</span>(<span class="code-string">'sk_live_xxxxx'</span>);

<span class="code-variable">$screenshot</span> = <span class="code-variable">$client</span>-><span class="code-function">capture</span>([
    <span class="code-string">'url'</span> => <span class="code-string">'https://example.com'</span>,
    <span class="code-string">'format'</span> => <span class="code-string">'png'</span>,
    <span class="code-string">'fullPage'</span> => <span class="code-boolean">true</span>,
    <span class="code-string">'viewport'</span> => [
        <span class="code-string">'width'</span> => <span class="code-number">1920</span>,
        <span class="code-string">'height'</span> => <span class="code-number">1080</span>
    ]
]);

<span class="code-keyword">echo</span> <span class="code-variable">$screenshot</span>->url;`;
}

function getJsonResponse(): string {
  return `{
  <span class="code-key">"success"</span>: <span class="code-boolean">true</span>,
  <span class="code-key">"data"</span>: {
    <span class="code-key">"id"</span>: <span class="code-string">"scr_abc123xyz"</span>,
    <span class="code-key">"url"</span>: <span class="code-string">"https://cdn.screenshot.dev/scr_abc123xyz.png"</span>,
    <span class="code-key">"format"</span>: <span class="code-string">"png"</span>,
    <span class="code-key">"width"</span>: <span class="code-number">1920</span>,
    <span class="code-key">"height"</span>: <span class="code-number">1080</span>,
    <span class="code-key">"fileSize"</span>: <span class="code-number">245632</span>,
    <span class="code-key">"capturedAt"</span>: <span class="code-string">"2024-01-15T10:30:00Z"</span>
  },
  <span class="code-key">"meta"</span>: {
    <span class="code-key">"duration"</span>: <span class="code-number">1.2</span>,
    <span class="code-key">"creditsUsed"</span>: <span class="code-number">1</span>
  }
}`;
}

export function getCodeDemoStyles(): string {
  return `
    /* Code Demo Section */
    .code-demo-section {
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }

    .code-demo-section::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
      pointer-events: none;
    }

    /* Section Badge */
    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 2rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--accent-primary);
      margin-bottom: 1.5rem;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      background: var(--accent-primary);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    /* Layout */
    .code-demo-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }

    @media (max-width: 1024px) {
      .code-demo-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    /* Window Chrome */
    .window-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .window-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transition: opacity 0.2s;
    }

    .dot-red { background: #ff5f57; }
    .dot-yellow { background: #febc2e; }
    .dot-green { background: #28c840; }

    .window-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.8125rem;
      font-family: var(--font-mono);
    }

    .window-title svg,
    .file-icon svg {
      width: 14px;
      height: 14px;
    }

    /* Code Editor */
    .code-demo-editor {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 20px 50px rgba(0, 0, 0, 0.25);
    }

    .code-editor-chrome {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
    }

    /* Copy Button */
    .copy-button {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .copy-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-hover);
      color: var(--text-primary);
    }

    .copy-button.copied {
      background: rgba(16, 185, 129, 0.2);
      border-color: var(--success);
      color: var(--success);
    }

    .copy-button svg {
      width: 14px;
      height: 14px;
    }

    /* Language Tabs */
    .code-editor-header {
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--border-color);
      padding: 0;
    }

    .code-tabs {
      display: flex;
      overflow-x: auto;
      scrollbar-width: none;
    }

    .code-tabs::-webkit-scrollbar {
      display: none;
    }

    .code-tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.25rem;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      white-space: nowrap;
    }

    .code-tab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
    }

    .code-tab-icon svg {
      width: 100%;
      height: 100%;
    }

    .code-tab:hover {
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.03);
    }

    .code-tab.active {
      color: var(--text-primary);
      background: var(--bg-secondary);
    }

    .code-tab.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    }

    /* Code Content */
    .code-editor-content {
      padding: 0;
      min-height: 320px;
      max-height: 400px;
      overflow-y: auto;
    }

    .code-panel {
      display: none;
    }

    .code-panel.active {
      display: flex;
    }

    /* Line Numbers */
    .line-numbers {
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
      padding-right: 1rem;
      padding-left: 1.25rem;
      border-right: 1px solid var(--border-color);
      background: rgba(0, 0, 0, 0.15);
      text-align: right;
      user-select: none;
      min-width: 50px;
    }

    .line-numbers span {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      line-height: 1.8;
      color: var(--text-muted);
    }

    .code-panel pre {
      margin: 0;
      padding: 1.25rem;
      flex: 1;
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      line-height: 1.8;
      color: var(--text-secondary);
      overflow-x: auto;
    }

    .code-panel code {
      font-family: inherit;
    }

    /* Syntax Highlighting */
    .code-keyword { color: #c792ea; }
    .code-string { color: #c3e88d; }
    .code-number { color: #f78c6c; }
    .code-boolean { color: #ff5370; }
    .code-comment { color: #546e7a; font-style: italic; }
    .code-variable { color: #82aaff; }
    .code-function { color: #82aaff; }
    .code-class { color: #ffcb6b; }
    .code-operator { color: #89ddff; }
    .code-key { color: #89ddff; }

    /* Response Preview */
    .code-demo-response {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow:
        0 4px 6px rgba(0, 0, 0, 0.1),
        0 20px 50px rgba(0, 0, 0, 0.25);
    }

    .response-chrome {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
    }

    .response-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      font-family: var(--font-mono);
      color: var(--success);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-success {
      background: var(--success);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
      animation: pulse 2s ease-in-out infinite;
    }

    .response-time-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 1rem;
      color: var(--accent-tertiary);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .time-icon svg {
      width: 12px;
      height: 12px;
    }

    /* Response Content */
    .response-content {
      padding: 1rem;
    }

    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .response-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .response-type {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .response-body {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .response-body pre {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    /* Typing Animation */
    .typing-animation {
      position: relative;
    }

    .typing-animation::after {
      content: '|';
      position: absolute;
      right: 0;
      color: var(--accent-primary);
      animation: blink 1s step-end infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    .typing-animation.done::after {
      display: none;
    }

    /* Screenshot Preview */
    .screenshot-preview {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .preview-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.875rem;
      border-bottom: 1px solid var(--border-color);
    }

    .preview-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .preview-size {
      font-size: 0.6875rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }

    .preview-thumbnail {
      position: relative;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    }

    .thumbnail-placeholder {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .thumbnail-browser {
      padding: 0.5rem;
    }

    .thumbnail-bar {
      height: 8px;
      background: var(--bg-hover);
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .thumbnail-content {
      padding: 0.5rem;
    }

    .thumbnail-header {
      height: 20px;
      width: 60%;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 4px;
      margin-bottom: 0.5rem;
      opacity: 0.3;
    }

    .thumbnail-line {
      height: 8px;
      background: var(--bg-hover);
      border-radius: 4px;
      margin-bottom: 0.375rem;
    }

    .thumbnail-line.short {
      width: 75%;
    }

    .thumbnail-blocks {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .thumbnail-block {
      flex: 1;
      height: 40px;
      background: var(--bg-hover);
      border-radius: 4px;
    }

    .preview-overlay {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
    }

    .preview-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .preview-badge svg {
      width: 14px;
      height: 14px;
    }

    /* Feature Highlights */
    .code-demo-features {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 3rem;
    }

    .feature-highlight {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
    }

    .feature-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      color: var(--success);
    }

    .feature-icon svg {
      width: 100%;
      height: 100%;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .code-demo-features {
        gap: 1rem;
      }

      .feature-highlight {
        font-size: 0.875rem;
      }

      .code-editor-content,
      .response-body {
        max-height: 300px;
      }

      .line-numbers {
        min-width: 40px;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }

      .code-panel pre {
        padding: 1rem;
        font-size: 0.75rem;
      }
    }

    @media (max-width: 640px) {
      .code-editor-chrome {
        flex-wrap: wrap;
        gap: 0.75rem;
      }

      .window-title {
        order: 3;
        width: 100%;
        justify-content: center;
      }

      .copy-button {
        margin-left: auto;
      }

      .code-demo-features {
        flex-direction: column;
        align-items: center;
      }
    }
  `;
}

export function getCodeDemoScript(): string {
  return `
    // Code tabs functionality
    const codeTabs = document.querySelectorAll('.code-tab');
    const codePanels = document.querySelectorAll('.code-panel');
    const copyButton = document.getElementById('copy-code-btn');
    const windowTitle = document.querySelector('.code-demo-editor .window-title span:last-child');

    const fileNames = {
      curl: 'screenshot-api.sh',
      nodejs: 'screenshot.js',
      python: 'screenshot.py',
      php: 'screenshot.php'
    };

    codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const lang = tab.dataset.lang;

        // Update tabs
        codeTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        codePanels.forEach(p => p.classList.remove('active'));
        const activePanel = document.getElementById('code-' + lang);
        if (activePanel) {
          activePanel.classList.add('active');
        }

        // Update window title
        if (windowTitle && fileNames[lang]) {
          windowTitle.textContent = fileNames[lang];
        }

        // Reset copy button
        if (copyButton) {
          copyButton.classList.remove('copied');
          copyButton.querySelector('.copy-text').textContent = 'Copy';
        }
      });
    });

    // Copy button functionality
    if (copyButton) {
      copyButton.addEventListener('click', async () => {
        const activePanel = document.querySelector('.code-panel.active code');
        if (activePanel) {
          // Get text content without HTML tags
          const code = activePanel.textContent || activePanel.innerText;

          try {
            await navigator.clipboard.writeText(code);
            copyButton.classList.add('copied');
            copyButton.querySelector('.copy-text').textContent = 'Copied!';

            setTimeout(() => {
              copyButton.classList.remove('copied');
              copyButton.querySelector('.copy-text').textContent = 'Copy';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
          }
        }
      });
    }

    // Typing animation for response
    const responseJson = document.getElementById('response-json');
    if (responseJson) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add done class after animation
            setTimeout(() => {
              responseJson.classList.add('done');
            }, 3000);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(responseJson);
    }

    // Animate response time
    const responseTime = document.querySelector('.response-time');
    if (responseTime) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            let start = 0;
            const end = 1.2;
            const duration = 1500;
            const startTime = performance.now();

            function updateTime(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const current = (progress * end).toFixed(1);
              responseTime.textContent = current + 's';

              if (progress < 1) {
                requestAnimationFrame(updateTime);
              }
            }

            requestAnimationFrame(updateTime);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(responseTime);
    }
  `;
}
