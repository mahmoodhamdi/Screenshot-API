/**
 * Hero Section
 * Main hero banner with headline, description, and CTAs
 */

import { generateButton } from '../components/button';
import { icons } from '../components/icons';

export function generateHeroSection(): string {
  const primaryCta = generateButton({
    text: 'Get Started Free',
    href: '/api/v1/auth/register',
    variant: 'primary',
    size: 'lg',
  });

  const secondaryCta = generateButton({
    text: 'View Documentation',
    href: '/docs',
    variant: 'outline',
    size: 'lg',
  });

  return `
    <section class="hero-section" id="hero">
      <div class="hero-bg-effects">
        <div class="hero-gradient-orb hero-gradient-orb-1"></div>
        <div class="hero-gradient-orb hero-gradient-orb-2"></div>
        <div class="hero-grid-bg"></div>
      </div>

      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="hero-badge-icon">${icons.zap}</span>
            <span>Lightning Fast Screenshot API</span>
          </div>

          <h1 class="hero-title">
            Capture Any Website<br>
            <span class="gradient-text">In Milliseconds</span>
          </h1>

          <p class="hero-description">
            Professional screenshot API for developers. Capture full-page screenshots,
            generate thumbnails, export to PDF, and more with a simple REST API.
          </p>

          <div class="hero-ctas">
            ${primaryCta}
            ${secondaryCta}
          </div>

          <div class="hero-stats">
            <div class="hero-stat">
              <span class="hero-stat-value">10M+</span>
              <span class="hero-stat-label">Screenshots Captured</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-value">99.9%</span>
              <span class="hero-stat-label">Uptime SLA</span>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat">
              <span class="hero-stat-value">&lt;2s</span>
              <span class="hero-stat-label">Avg Response Time</span>
            </div>
          </div>
        </div>

        <div class="hero-demo" data-animate>
          <div class="hero-demo-window">
            <div class="hero-demo-toolbar">
              <div class="hero-demo-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="hero-demo-url">
                <span class="hero-demo-lock">${icons.shield}</span>
                api.screenshot.dev/v1/capture
              </div>
            </div>
            <div class="hero-demo-content">
              <pre><code class="hero-code"><span class="code-keyword">curl</span> -X POST <span class="code-string">"https://api.screenshot.dev/v1/capture"</span> \\
  -H <span class="code-string">"X-API-Key: your_api_key"</span> \\
  -H <span class="code-string">"Content-Type: application/json"</span> \\
  -d <span class="code-string">'{
    "url": "https://example.com",
    "format": "png",
    "fullPage": true,
    "width": 1920,
    "height": 1080
  }'</span></code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function getHeroStyles(): string {
  return `
    /* Hero Section */
    .hero-section {
      position: relative;
      min-height: 100vh;
      padding: 8rem 1.5rem 4rem;
      display: flex;
      align-items: center;
      overflow: hidden;
    }

    /* Background Effects */
    .hero-bg-effects {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 0;
    }

    .hero-gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);
      opacity: 0.5;
    }

    .hero-gradient-orb-1 {
      width: 600px;
      height: 600px;
      background: var(--accent-primary);
      top: -200px;
      right: -100px;
      opacity: 0.15;
    }

    .hero-gradient-orb-2 {
      width: 400px;
      height: 400px;
      background: var(--accent-secondary);
      bottom: -100px;
      left: -100px;
      opacity: 0.1;
    }

    .hero-grid-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    }

    /* Content */
    .hero-section .container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-content {
      max-width: 600px;
    }

    /* Badge */
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      color: var(--accent-primary);
      margin-bottom: 1.5rem;
    }

    .hero-badge-icon {
      display: flex;
    }

    .hero-badge-icon svg {
      width: 16px;
      height: 16px;
    }

    /* Title */
    .hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }

    /* Description */
    .hero-description {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    /* CTAs */
    .hero-ctas {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    /* Stats */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .hero-stat {
      display: flex;
      flex-direction: column;
    }

    .hero-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hero-stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .hero-stat-divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
    }

    /* Demo Window */
    .hero-demo {
      perspective: 1000px;
    }

    .hero-demo-window {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      box-shadow:
        0 20px 50px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.05);
      transform: rotateY(-5deg) rotateX(5deg);
      transition: transform 0.5s ease;
    }

    .hero-demo-window:hover {
      transform: rotateY(0) rotateX(0);
    }

    .hero-demo-toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
    }

    .hero-demo-dots {
      display: flex;
      gap: 6px;
    }

    .hero-demo-dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--border-hover);
    }

    .hero-demo-dots span:nth-child(1) { background: #ff5f56; }
    .hero-demo-dots span:nth-child(2) { background: #ffbd2e; }
    .hero-demo-dots span:nth-child(3) { background: #27c93f; }

    .hero-demo-url {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-primary);
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }

    .hero-demo-lock {
      display: flex;
      color: var(--success);
    }

    .hero-demo-lock svg {
      width: 14px;
      height: 14px;
    }

    .hero-demo-content {
      padding: 1.5rem;
    }

    .hero-code {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      line-height: 1.7;
      color: var(--text-secondary);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .code-keyword { color: var(--accent-tertiary); }
    .code-string { color: var(--success); }
    .code-comment { color: var(--text-muted); }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-section .container {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-content {
        max-width: 100%;
      }

      .hero-ctas {
        justify-content: center;
      }

      .hero-stats {
        justify-content: center;
      }

      .hero-demo-window {
        transform: none;
      }
    }

    @media (max-width: 640px) {
      .hero-section {
        padding: 6rem 1rem 3rem;
      }

      .hero-ctas {
        flex-direction: column;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1rem;
      }

      .hero-stat-divider {
        display: none;
      }
    }
  `;
}
