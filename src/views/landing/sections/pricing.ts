/**
 * Pricing Section
 * Displays pricing plans with features comparison
 */

import { generateButton } from '../components/button';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaHref: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for testing and personal projects',
    features: [
      '100 screenshots/month',
      'PNG & JPEG formats',
      '1280x720 max resolution',
      'Basic API access',
      'Community support',
    ],
    ctaText: 'Get Started Free',
    ctaHref: '/api/v1/auth/register',
  },
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For small teams and growing projects',
    features: [
      '5,000 screenshots/month',
      'All formats (PNG, JPEG, WebP, PDF)',
      '1920x1080 max resolution',
      'Full page capture',
      'Custom headers',
      'Email support',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '/api/v1/subscriptions/checkout?plan=starter',
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'For teams with advanced needs',
    features: [
      '25,000 screenshots/month',
      'All formats + metadata',
      '4K resolution (3840x2160)',
      'Priority rendering',
      'Webhook notifications',
      'Dark mode & ad blocking',
      'Priority support',
    ],
    highlighted: true,
    badge: 'Most Popular',
    ctaText: 'Start Free Trial',
    ctaHref: '/api/v1/subscriptions/checkout?plan=professional',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited screenshots',
      'Custom resolutions',
      'Dedicated infrastructure',
      'SLA guarantee',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
    ],
    ctaText: 'Contact Sales',
    ctaHref: 'mailto:sales@screenshot.dev',
  },
];

export function generatePricingSection(): string {
  const planCards = pricingPlans
    .map(
      (plan) => `
      <div class="pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}" data-animate>
        ${plan.badge ? `<span class="pricing-badge">${plan.badge}</span>` : ''}

        <div class="pricing-header">
          <h3 class="pricing-name">${plan.name}</h3>
          <div class="pricing-price">
            <span class="pricing-amount">${plan.price}</span>
            <span class="pricing-period">${plan.period}</span>
          </div>
          <p class="pricing-description">${plan.description}</p>
        </div>

        <ul class="pricing-features">
          ${plan.features.map((f) => `<li>${getCheckIcon()} ${f}</li>`).join('')}
        </ul>

        <div class="pricing-cta">
          ${generateButton({
            text: plan.ctaText,
            href: plan.ctaHref,
            variant: plan.highlighted ? 'primary' : 'outline',
            fullWidth: true,
          })}
        </div>
      </div>
    `
    )
    .join('');

  return `
    <section class="pricing-section section" id="pricing">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Pricing</span>
          <h2 class="section-title">Simple, <span class="gradient-text">Transparent Pricing</span></h2>
          <p class="section-description">
            Start for free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div class="pricing-grid">
          ${planCards}
        </div>

        <div class="pricing-faq" data-animate>
          <p class="pricing-faq-text">
            Need more screenshots? All plans include pay-as-you-go pricing at <strong>$0.002 per extra screenshot</strong>.
          </p>
        </div>
      </div>
    </section>
  `;
}

function getCheckIcon(): string {
  return '<svg class="pricing-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
}

export function getPricingStyles(): string {
  return `
    /* Pricing Section */
    .pricing-section {
      background: var(--bg-secondary);
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 1200px) {
      .pricing-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .pricing-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Pricing Card */
    .pricing-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 2rem;
      position: relative;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .pricing-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .pricing-card-highlighted {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      transform: scale(1.02);
    }

    .pricing-card-highlighted:hover {
      transform: scale(1.02) translateY(-4px);
    }

    /* Badge */
    .pricing-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.375rem 1rem;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Header */
    .pricing-header {
      text-align: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .pricing-name {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .pricing-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .pricing-amount {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    .pricing-period {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .pricing-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }

    /* Features */
    .pricing-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      flex: 1;
    }

    .pricing-features li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.625rem 0;
      color: var(--text-secondary);
      font-size: 0.9375rem;
    }

    .pricing-check {
      width: 18px;
      height: 18px;
      color: var(--success);
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* CTA */
    .pricing-cta {
      margin-top: auto;
    }

    /* FAQ */
    .pricing-faq {
      text-align: center;
      padding: 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
    }

    .pricing-faq-text {
      color: var(--text-secondary);
      font-size: 1rem;
      margin: 0;
    }

    .pricing-faq-text strong {
      color: var(--accent-primary);
    }
  `;
}
