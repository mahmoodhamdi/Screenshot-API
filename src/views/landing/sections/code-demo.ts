/**
 * Code Demo Section
 * Interactive code examples showing API usage
 */

export function generateCodeDemoSection(): string {
  const languages = [
    { id: 'curl', name: 'cURL' },
    { id: 'nodejs', name: 'Node.js' },
    { id: 'python', name: 'Python' },
    { id: 'php', name: 'PHP' },
  ];

  const tabs = languages
    .map(
      (lang, i) => `
      <button class="code-tab ${i === 0 ? 'active' : ''}" data-lang="${lang.id}">
        ${lang.name}
      </button>
    `
    )
    .join('');

  return `
    <section class="code-demo-section section" id="code-demo">
      <div class="container">
        <div class="code-demo-layout">
          <div class="code-demo-info">
            <span class="section-label">Developer Experience</span>
            <h2 class="section-title">Simple Integration, <span class="gradient-text">Powerful Results</span></h2>
            <p class="section-description">
              Get started in minutes with our well-documented API. We provide SDKs for popular languages and comprehensive examples.
            </p>

            <ul class="code-demo-features">
              <li>
                <span class="check-icon">${getCheckIcon()}</span>
                RESTful API with JSON responses
              </li>
              <li>
                <span class="check-icon">${getCheckIcon()}</span>
                SDKs for Node.js, Python, PHP, and more
              </li>
              <li>
                <span class="check-icon">${getCheckIcon()}</span>
                Webhook support for async captures
              </li>
              <li>
                <span class="check-icon">${getCheckIcon()}</span>
                Comprehensive error handling
              </li>
            </ul>
          </div>

          <div class="code-demo-editor" data-animate>
            <div class="code-editor-header">
              <div class="code-tabs">
                ${tabs}
              </div>
            </div>
            <div class="code-editor-content">
              <div class="code-panel active" id="code-curl">
                <pre><code>${getCurlExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-nodejs">
                <pre><code>${getNodejsExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-python">
                <pre><code>${getPythonExample()}</code></pre>
              </div>
              <div class="code-panel" id="code-php">
                <pre><code>${getPhpExample()}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getCheckIcon(): string {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
}

function getCurlExample(): string {
  return `<span class="code-comment"># Capture a screenshot</span>
<span class="code-keyword">curl</span> -X POST <span class="code-string">"https://api.screenshot.dev/v1/screenshots"</span> \\
  -H <span class="code-string">"X-API-Key: sk_live_xxxxx"</span> \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -d <span class="code-string">'{
    "url": "https://example.com",
    "format": "png",
    "fullPage": true,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }'</span>`;
}

function getNodejsExample(): string {
  return `<span class="code-keyword">import</span> { ScreenshotAPI } <span class="code-keyword">from</span> <span class="code-string">'screenshot-api'</span>;

<span class="code-keyword">const</span> client = <span class="code-keyword">new</span> ScreenshotAPI(<span class="code-string">'sk_live_xxxxx'</span>);

<span class="code-keyword">const</span> screenshot = <span class="code-keyword">await</span> client.capture({
  url: <span class="code-string">'https://example.com'</span>,
  format: <span class="code-string">'png'</span>,
  fullPage: <span class="code-keyword">true</span>,
  viewport: {
    width: <span class="code-number">1920</span>,
    height: <span class="code-number">1080</span>
  }
});

console.log(screenshot.url);`;
}

function getPythonExample(): string {
  return `<span class="code-keyword">from</span> screenshot_api <span class="code-keyword">import</span> ScreenshotAPI

client = ScreenshotAPI(<span class="code-string">"sk_live_xxxxx"</span>)

screenshot = client.capture(
    url=<span class="code-string">"https://example.com"</span>,
    format=<span class="code-string">"png"</span>,
    full_page=<span class="code-keyword">True</span>,
    viewport={
        <span class="code-string">"width"</span>: <span class="code-number">1920</span>,
        <span class="code-string">"height"</span>: <span class="code-number">1080</span>
    }
)

<span class="code-keyword">print</span>(screenshot.url)`;
}

function getPhpExample(): string {
  return `<span class="code-keyword">&lt;?php</span>
<span class="code-keyword">use</span> ScreenshotAPI\\Client;

<span class="code-variable">$client</span> = <span class="code-keyword">new</span> Client(<span class="code-string">'sk_live_xxxxx'</span>);

<span class="code-variable">$screenshot</span> = <span class="code-variable">$client</span>->capture([
    <span class="code-string">'url'</span> => <span class="code-string">'https://example.com'</span>,
    <span class="code-string">'format'</span> => <span class="code-string">'png'</span>,
    <span class="code-string">'fullPage'</span> => <span class="code-keyword">true</span>,
    <span class="code-string">'viewport'</span> => [
        <span class="code-string">'width'</span> => <span class="code-number">1920</span>,
        <span class="code-string">'height'</span> => <span class="code-number">1080</span>
    ]
]);

<span class="code-keyword">echo</span> <span class="code-variable">$screenshot</span>->url;`;
}

export function getCodeDemoStyles(): string {
  return `
    /* Code Demo Section */
    .code-demo-section {
      background: var(--bg-primary);
    }

    .code-demo-layout {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 4rem;
      align-items: center;
    }

    @media (max-width: 1024px) {
      .code-demo-layout {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    /* Info Side */
    .code-demo-info .section-label {
      text-align: left;
    }

    .code-demo-info .section-title {
      text-align: left;
      margin-bottom: 1rem;
    }

    .code-demo-info .section-description {
      text-align: left;
      margin-bottom: 2rem;
    }

    .code-demo-features {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .code-demo-features li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 50%;
      color: var(--success);
    }

    .check-icon svg {
      width: 14px;
      height: 14px;
    }

    /* Code Editor */
    .code-demo-editor {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    .code-editor-header {
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      padding: 0;
    }

    .code-tabs {
      display: flex;
    }

    .code-tab {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .code-tab:hover {
      color: var(--text-primary);
      background: var(--bg-hover);
    }

    .code-tab.active {
      color: var(--accent-primary);
      background: var(--bg-secondary);
    }

    .code-tab.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--accent-primary);
    }

    .code-editor-content {
      padding: 1.5rem;
      min-height: 350px;
    }

    .code-panel {
      display: none;
    }

    .code-panel.active {
      display: block;
    }

    .code-panel pre {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      line-height: 1.7;
      color: var(--text-secondary);
    }

    .code-panel code {
      font-family: inherit;
    }

    .code-keyword { color: var(--accent-tertiary); }
    .code-string { color: var(--success); }
    .code-number { color: var(--warning); }
    .code-comment { color: var(--text-muted); }
    .code-variable { color: var(--accent-secondary); }
  `;
}

export function getCodeDemoScript(): string {
  return `
    // Code tabs functionality
    document.querySelectorAll('.code-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const lang = tab.dataset.lang;

        // Update tabs
        document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update panels
        document.querySelectorAll('.code-panel').forEach(p => p.classList.remove('active'));
        document.getElementById('code-' + lang)?.classList.add('active');
      });
    });
  `;
}
