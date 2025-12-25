/**
 * Hero Section
 * Main hero banner with headline, description, CTAs, and animated demo
 */

import { generateButton } from '../components/button';
import { icons } from '../components/icons';

export function generateHeroSection(): string {
  const primaryCta = generateButton({
    text: 'Start Free',
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
      <!-- Background Effects -->
      <div class="hero-bg-effects">
        <div class="hero-gradient-orb hero-gradient-orb-1"></div>
        <div class="hero-gradient-orb hero-gradient-orb-2"></div>
        <div class="hero-gradient-orb hero-gradient-orb-3"></div>
        <div class="hero-grid-bg"></div>
        <div class="hero-glow"></div>
      </div>

      <div class="container hero-container">
        <!-- Left Content -->
        <div class="hero-content" data-animate="fade-up">
          <!-- Badge -->
          <div class="hero-badge">
            <span class="hero-badge-dot"></span>
            <span class="hero-badge-icon">${icons.zap}</span>
            <span>Lightning Fast Screenshot API</span>
            <span class="hero-badge-arrow">${icons.arrowRight}</span>
          </div>

          <!-- Headline -->
          <h1 class="hero-title">
            <span class="hero-title-line">Capture Any Website</span>
            <span class="hero-title-line gradient-text">In Milliseconds</span>
          </h1>

          <!-- Description -->
          <p class="hero-description">
            Professional screenshot API for developers. Capture full-page screenshots,
            generate thumbnails, export to PDF, and more with a simple REST API.
            <span class="hero-description-highlight">No credit card required.</span>
          </p>

          <!-- CTAs -->
          <div class="hero-ctas">
            ${primaryCta}
            ${secondaryCta}
          </div>

          <!-- Trust Badges -->
          <div class="hero-stats">
            <div class="hero-stat" data-animate="fade-up" data-delay="100">
              <div class="hero-stat-icon">${icons.camera}</div>
              <div class="hero-stat-content">
                <span class="hero-stat-value" data-count="10000000">10M+</span>
                <span class="hero-stat-label">Screenshots Captured</span>
              </div>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat" data-animate="fade-up" data-delay="200">
              <div class="hero-stat-icon">${icons.shield}</div>
              <div class="hero-stat-content">
                <span class="hero-stat-value">99.9%</span>
                <span class="hero-stat-label">Uptime SLA</span>
              </div>
            </div>
            <div class="hero-stat-divider"></div>
            <div class="hero-stat" data-animate="fade-up" data-delay="300">
              <div class="hero-stat-icon">${icons.zap}</div>
              <div class="hero-stat-content">
                <span class="hero-stat-value">&lt;2s</span>
                <span class="hero-stat-label">Avg Response</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Demo -->
        <div class="hero-demo" data-animate="fade-left">
          <div class="hero-demo-wrapper">
            <!-- Floating Elements -->
            <div class="hero-floating-badge hero-floating-1">
              <span class="floating-icon">${icons.check}</span>
              <span>200 OK</span>
            </div>
            <div class="hero-floating-badge hero-floating-2">
              <span class="floating-icon">${icons.zap}</span>
              <span>1.2s</span>
            </div>

            <!-- Terminal Window -->
            <div class="hero-demo-window">
              <div class="hero-demo-toolbar">
                <div class="hero-demo-dots">
                  <span class="dot-red"></span>
                  <span class="dot-yellow"></span>
                  <span class="dot-green"></span>
                </div>
                <div class="hero-demo-url">
                  <span class="hero-demo-lock">${icons.shield}</span>
                  <span>api.screenshot.dev/v1/screenshots</span>
                </div>
                <div class="hero-demo-actions">
                  <button class="hero-demo-copy" aria-label="Copy code" onclick="copyHeroCode()">
                    ${icons.code}
                  </button>
                </div>
              </div>
              <div class="hero-demo-content">
                <div class="hero-demo-request">
                  <div class="code-line">
                    <span class="line-number">1</span>
                    <span class="code-keyword">curl</span> -X POST <span class="code-string">"https://api.screenshot.dev/v1/screenshots"</span> <span class="code-operator">\\</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">2</span>
                    <span class="code-indent"></span>-H <span class="code-string">"X-API-Key: sk_live_xxxxx"</span> <span class="code-operator">\\</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">3</span>
                    <span class="code-indent"></span>-H <span class="code-string">"Content-Type: application/json"</span> <span class="code-operator">\\</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">4</span>
                    <span class="code-indent"></span>-d <span class="code-string">'{"url": "https://example.com"}'</span>
                  </div>
                </div>
                <div class="hero-demo-divider"></div>
                <div class="hero-demo-response">
                  <div class="response-header">
                    <span class="response-status">Response</span>
                    <span class="response-time">1.2s</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">1</span>
                    <span class="code-bracket">{</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">2</span>
                    <span class="code-indent"></span><span class="code-key">"success"</span>: <span class="code-boolean">true</span>,
                  </div>
                  <div class="code-line">
                    <span class="line-number">3</span>
                    <span class="code-indent"></span><span class="code-key">"data"</span>: <span class="code-bracket">{</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">4</span>
                    <span class="code-indent"></span><span class="code-indent"></span><span class="code-key">"url"</span>: <span class="code-string">"https://cdn.screenshot.dev/..."</span>,
                  </div>
                  <div class="code-line">
                    <span class="line-number">5</span>
                    <span class="code-indent"></span><span class="code-indent"></span><span class="code-key">"format"</span>: <span class="code-string">"png"</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">6</span>
                    <span class="code-indent"></span><span class="code-bracket">}</span>
                  </div>
                  <div class="code-line">
                    <span class="line-number">7</span>
                    <span class="code-bracket">}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="hero-scroll-indicator">
        <div class="scroll-mouse">
          <div class="scroll-wheel"></div>
        </div>
        <span>Scroll to explore</span>
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
      padding: 7rem 1.5rem 4rem;
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
      overflow: hidden;
    }

    .hero-gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      animation: float-slow 20s ease-in-out infinite;
    }

    .hero-gradient-orb-1 {
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
      top: -300px;
      right: -200px;
      opacity: 0.15;
    }

    .hero-gradient-orb-2 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
      bottom: -200px;
      left: -200px;
      opacity: 0.12;
      animation-delay: -10s;
    }

    .hero-gradient-orb-3 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, var(--accent-tertiary) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.08;
      animation-delay: -5s;
    }

    @keyframes float-slow {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }

    .hero-grid-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 80px 80px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 100%);
    }

    .hero-glow {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 1000px;
      height: 600px;
      background: radial-gradient(ellipse at center top, rgba(99, 102, 241, 0.15) 0%, transparent 60%);
    }

    /* Container */
    .hero-container {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1.1fr;
      gap: 4rem;
      align-items: center;
      max-width: 1400px;
    }

    /* Content */
    .hero-content {
      max-width: 620px;
    }

    /* Badge */
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 0.5rem 1rem 0.5rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .hero-badge:hover {
      background: rgba(99, 102, 241, 0.12);
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateX(4px);
    }

    .hero-badge-dot {
      width: 8px;
      height: 8px;
      background: var(--success);
      border-radius: 50%;
      animation: pulse-dot 2s infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }

    .hero-badge-icon {
      display: flex;
      color: var(--accent-primary);
    }

    .hero-badge-icon svg {
      width: 16px;
      height: 16px;
    }

    .hero-badge-arrow {
      display: flex;
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .hero-badge-arrow svg {
      width: 14px;
      height: 14px;
    }

    .hero-badge:hover .hero-badge-arrow {
      transform: translateX(3px);
      color: var(--accent-primary);
    }

    /* Title */
    .hero-title {
      font-size: clamp(2.75rem, 5.5vw, 4.5rem);
      font-weight: 800;
      line-height: 1.08;
      margin-bottom: 1.5rem;
      letter-spacing: -0.03em;
    }

    .hero-title-line {
      display: block;
    }

    /* Description */
    .hero-description {
      font-size: 1.25rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.7;
      max-width: 540px;
    }

    .hero-description-highlight {
      color: var(--accent-primary);
      font-weight: 500;
    }

    /* CTAs */
    .hero-ctas {
      display: flex;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .hero-ctas .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.0625rem;
    }

    /* Stats */
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .hero-stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .hero-stat-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 10px;
      color: var(--accent-primary);
    }

    .hero-stat-icon svg {
      width: 20px;
      height: 20px;
    }

    .hero-stat-content {
      display: flex;
      flex-direction: column;
    }

    .hero-stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .hero-stat-label {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }

    .hero-stat-divider {
      width: 1px;
      height: 36px;
      background: var(--border-color);
    }

    /* Demo Window */
    .hero-demo {
      perspective: 1200px;
    }

    .hero-demo-wrapper {
      position: relative;
      animation: float 6s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotateY(-2deg) rotateX(2deg); }
      50% { transform: translateY(-15px) rotateY(2deg) rotateX(-2deg); }
    }

    /* Floating Badges */
    .hero-floating-badge {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 10;
    }

    .floating-icon {
      display: flex;
      width: 20px;
      height: 20px;
      align-items: center;
      justify-content: center;
      background: rgba(16, 185, 129, 0.2);
      border-radius: 50%;
      color: var(--success);
    }

    .floating-icon svg {
      width: 12px;
      height: 12px;
    }

    .hero-floating-1 {
      top: 15%;
      right: -20px;
      animation: float-badge-1 4s ease-in-out infinite;
    }

    .hero-floating-2 {
      bottom: 20%;
      left: -30px;
      animation: float-badge-2 5s ease-in-out infinite;
    }

    .hero-floating-2 .floating-icon {
      background: rgba(99, 102, 241, 0.2);
      color: var(--accent-primary);
    }

    @keyframes float-badge-1 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(3deg); }
    }

    @keyframes float-badge-2 {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(8px) rotate(-3deg); }
    }

    .hero-demo-window {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.05),
        0 25px 80px rgba(0, 0, 0, 0.5),
        0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .hero-demo-toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
    }

    .hero-demo-dots {
      display: flex;
      gap: 8px;
    }

    .hero-demo-dots span {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      transition: transform 0.2s ease;
    }

    .hero-demo-dots span:hover {
      transform: scale(1.2);
    }

    .dot-red { background: #ff5f56; }
    .dot-yellow { background: #ffbd2e; }
    .dot-green { background: #27c93f; }

    .hero-demo-url {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-primary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8125rem;
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

    .hero-demo-actions {
      display: flex;
    }

    .hero-demo-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .hero-demo-copy:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .hero-demo-copy svg {
      width: 16px;
      height: 16px;
    }

    .hero-demo-content {
      padding: 1rem;
    }

    .hero-demo-request,
    .hero-demo-response {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      line-height: 1.8;
    }

    .hero-demo-divider {
      height: 1px;
      background: var(--border-color);
      margin: 1rem 0;
    }

    .response-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px dashed var(--border-color);
    }

    .response-status {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--success);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .response-time {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(255, 255, 255, 0.05);
      padding: 0.125rem 0.5rem;
      border-radius: 4px;
    }

    .code-line {
      display: flex;
      align-items: flex-start;
    }

    .line-number {
      width: 24px;
      text-align: right;
      color: var(--text-muted);
      opacity: 0.5;
      margin-right: 1rem;
      user-select: none;
    }

    .code-indent {
      display: inline-block;
      width: 1.5em;
    }

    .code-keyword { color: var(--accent-tertiary); }
    .code-string { color: var(--success); }
    .code-operator { color: var(--text-muted); }
    .code-bracket { color: var(--text-secondary); }
    .code-key { color: var(--accent-primary); }
    .code-boolean { color: var(--warning); }

    /* Scroll Indicator */
    .hero-scroll-indicator {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.75rem;
      animation: fade-in-up 1s ease 1s backwards;
    }

    .scroll-mouse {
      width: 24px;
      height: 38px;
      border: 2px solid var(--border-hover);
      border-radius: 12px;
      position: relative;
    }

    .scroll-wheel {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 8px;
      background: var(--text-muted);
      border-radius: 2px;
      animation: scroll-wheel 2s ease-in-out infinite;
    }

    @keyframes scroll-wheel {
      0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
      50% { opacity: 0.3; transform: translateX(-50%) translateY(10px); }
    }

    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .hero-container {
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
      }

      .hero-title {
        font-size: clamp(2.25rem, 4.5vw, 3.5rem);
      }
    }

    @media (max-width: 1024px) {
      .hero-section {
        min-height: auto;
        padding: 8rem 1.5rem 5rem;
      }

      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .hero-content {
        max-width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .hero-description {
        max-width: 600px;
      }

      .hero-ctas {
        justify-content: center;
      }

      .hero-stats {
        justify-content: center;
      }

      .hero-demo-wrapper {
        animation: none;
        max-width: 600px;
        margin: 0 auto;
      }

      .hero-floating-badge {
        display: none;
      }

      .hero-scroll-indicator {
        display: none;
      }
    }

    @media (max-width: 640px) {
      .hero-section {
        padding: 6rem 1rem 3rem;
      }

      .hero-badge {
        font-size: 0.8125rem;
        padding: 0.375rem 0.75rem;
      }

      .hero-title {
        font-size: clamp(2rem, 8vw, 2.75rem);
      }

      .hero-description {
        font-size: 1.0625rem;
      }

      .hero-ctas {
        flex-direction: column;
        width: 100%;
      }

      .hero-ctas .btn {
        width: 100%;
        justify-content: center;
      }

      .hero-stats {
        flex-direction: column;
        gap: 1rem;
        padding-top: 1.5rem;
      }

      .hero-stat-divider {
        display: none;
      }

      .hero-stat {
        background: var(--bg-card);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        width: 100%;
        justify-content: center;
      }
    }
  `;
}

export function getHeroScript(): string {
  return `
    // Copy hero code functionality
    function copyHeroCode() {
      const code = \`curl -X POST "https://api.screenshot.dev/v1/screenshots" \\\\
  -H "X-API-Key: sk_live_xxxxx" \\\\
  -H "Content-Type: application/json" \\\\
  -d '{"url": "https://example.com"}'\`;

      navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.hero-demo-copy');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>';
        }, 2000);
      });
    }
  `;
}
