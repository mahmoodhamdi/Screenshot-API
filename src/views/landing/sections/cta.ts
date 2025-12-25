/**
 * CTA Section
 * Final call-to-action with gradient background and decorative elements
 */

import { generateButton } from '../components/button';

export function generateCtaSection(): string {
  return `
    <section class="cta-section" id="cta">
      <!-- Decorative Background Elements -->
      <div class="cta-bg">
        <div class="cta-gradient"></div>
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
        <div class="cta-orb cta-orb-3"></div>
        <div class="cta-grid"></div>
        <div class="cta-dots">
          ${generateDots()}
        </div>
      </div>

      <div class="container">
        <div class="cta-content" data-animate>
          <!-- Badge -->
          <div class="cta-badge">
            <span class="badge-icon">${getRocketIcon()}</span>
            <span>Start Building Today</span>
          </div>

          <!-- Headline -->
          <h2 class="cta-title">
            Ready to <span class="gradient-text">Capture the Web?</span>
          </h2>

          <!-- Subheadline -->
          <p class="cta-description">
            Start for free. No credit card required.<br>
            Get 100 screenshots per month to explore all features.
          </p>

          <!-- CTA Buttons -->
          <div class="cta-buttons">
            ${generateButton({
              text: 'Get Started Free',
              href: '/api/v1/auth/register',
              variant: 'primary',
              size: 'lg',
            })}
            ${generateButton({
              text: 'Contact Sales',
              href: 'mailto:sales@screenshot.dev',
              variant: 'outline',
              size: 'lg',
            })}
          </div>

          <!-- Trust Indicators -->
          <div class="cta-trust">
            <div class="cta-trust-item">
              ${getCheckIcon()}
              <span>Free forever plan</span>
            </div>
            <div class="cta-trust-item">
              ${getCheckIcon()}
              <span>No credit card</span>
            </div>
            <div class="cta-trust-item">
              ${getCheckIcon()}
              <span>Setup in 2 minutes</span>
            </div>
          </div>

          <!-- Decorative Circles -->
          <div class="cta-circle cta-circle-1"></div>
          <div class="cta-circle cta-circle-2"></div>
        </div>
      </div>
    </section>
  `;
}

function generateDots(): string {
  const dots = [];
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = 2 + Math.random() * 4;
    const delay = Math.random() * 3;
    dots.push(
      `<div class="cta-dot" style="left: ${x}%; top: ${y}%; width: ${size}px; height: ${size}px; animation-delay: ${delay}s;"></div>`
    );
  }
  return dots.join('');
}

function getRocketIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>`;
}

function getCheckIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`;
}

export function getCtaStyles(): string {
  return `
    /* CTA Section */
    .cta-section {
      position: relative;
      padding: 8rem 1.5rem;
      overflow: hidden;
    }

    /* Background */
    .cta-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .cta-gradient {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.15) 0%,
        rgba(139, 92, 246, 0.15) 50%,
        rgba(6, 182, 212, 0.1) 100%
      );
    }

    .cta-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      animation: float 8s ease-in-out infinite;
    }

    .cta-orb-1 {
      width: 400px;
      height: 400px;
      background: var(--accent-primary);
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .cta-orb-2 {
      width: 300px;
      height: 300px;
      background: var(--accent-secondary);
      bottom: -50px;
      right: -50px;
      animation-delay: 2s;
    }

    .cta-orb-3 {
      width: 200px;
      height: 200px;
      background: var(--accent-tertiary);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: 4s;
    }

    .cta-grid {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
    }

    .cta-dots {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .cta-dot {
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      animation: twinkle 3s ease-in-out infinite;
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.2); }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-20px) scale(1.05); }
    }

    /* Content */
    .cta-content {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 700px;
      margin: 0 auto;
    }

    /* Badge */
    .cta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 2rem;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .badge-icon {
      display: flex;
      width: 18px;
      height: 18px;
      color: var(--accent-primary);
    }

    .badge-icon svg {
      width: 100%;
      height: 100%;
    }

    /* Title */
    .cta-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    /* Description */
    .cta-description {
      font-size: 1.25rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }

    /* Buttons */
    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 640px) {
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-buttons .btn {
        width: 100%;
        max-width: 280px;
      }
    }

    /* Trust Indicators */
    .cta-trust {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .cta-trust-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .cta-trust-item svg {
      width: 20px;
      height: 20px;
      color: var(--success);
    }

    /* Decorative Circles */
    .cta-circle {
      position: absolute;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      pointer-events: none;
    }

    .cta-circle-1 {
      width: 300px;
      height: 300px;
      top: -150px;
      right: -150px;
      animation: rotate 20s linear infinite;
    }

    .cta-circle-2 {
      width: 200px;
      height: 200px;
      bottom: -100px;
      left: -100px;
      animation: rotate 15s linear infinite reverse;
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .cta-section {
        padding: 5rem 1.5rem;
      }

      .cta-trust {
        gap: 1rem;
      }

      .cta-trust-item {
        font-size: 0.875rem;
      }
    }
  `;
}
