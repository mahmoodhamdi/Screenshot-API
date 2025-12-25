/**
 * CTA Section
 * Final call-to-action before the footer
 */

import { generateButton } from '../components/button';

export function generateCtaSection(): string {
  return `
    <section class="cta-section section" id="cta">
      <div class="container">
        <div class="cta-content glow" data-animate>
          <div class="cta-bg-pattern"></div>

          <span class="section-label">Get Started Today</span>
          <h2 class="cta-title">
            Ready to Capture<br>
            <span class="gradient-text">Perfect Screenshots?</span>
          </h2>
          <p class="cta-description">
            Start with 100 free screenshots per month. No credit card required.
          </p>

          <div class="cta-buttons">
            ${generateButton({
              text: 'Start Free Trial',
              href: '/api/v1/auth/register',
              variant: 'primary',
              size: 'lg',
            })}
            ${generateButton({
              text: 'View Documentation',
              href: '/docs',
              variant: 'outline',
              size: 'lg',
            })}
          </div>

          <div class="cta-features">
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>100 free screenshots/month</span>
            </div>
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>No credit card required</span>
            </div>
            <div class="cta-feature">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function getCtaStyles(): string {
  return `
    /* CTA Section */
    .cta-section {
      background: var(--bg-secondary);
      padding: 6rem 1.5rem;
    }

    .cta-content {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 2rem;
      padding: 4rem 2rem;
      text-align: center;
      overflow: hidden;
    }

    .cta-bg-pattern {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .cta-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      margin-bottom: 1rem;
      position: relative;
    }

    .cta-description {
      font-size: 1.25rem;
      color: var(--text-secondary);
      max-width: 500px;
      margin: 0 auto 2rem;
      position: relative;
    }

    .cta-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      position: relative;
    }

    @media (max-width: 640px) {
      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }
    }

    .cta-features {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
      position: relative;
    }

    .cta-feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .cta-feature svg {
      width: 18px;
      height: 18px;
      color: var(--success);
    }
  `;
}
