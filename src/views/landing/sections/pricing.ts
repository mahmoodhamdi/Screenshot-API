/**
 * Pricing Section
 * Displays pricing plans with monthly/yearly toggle, feature comparison, and FAQ
 */

import { generateButton } from '../components/button';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaHref: string;
  ctaVariant: 'primary' | 'outline' | 'ghost';
}

interface FaqItem {
  question: string;
  answer: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for testing and personal projects',
    features: [
      { text: '100 screenshots/month', included: true },
      { text: 'PNG & JPEG formats', included: true },
      { text: '1280x720 max resolution', included: true },
      { text: 'Basic API access', included: true },
      { text: 'Community support', included: true },
      { text: 'Full page capture', included: false },
      { text: 'Custom headers', included: false },
      { text: 'Webhook notifications', included: false },
    ],
    ctaText: 'Get Started',
    ctaHref: '/api/v1/auth/register',
    ctaVariant: 'outline',
  },
  {
    name: 'Starter',
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: 'For small teams and growing projects',
    features: [
      { text: '2,000 screenshots/month', included: true },
      { text: 'All formats (PNG, JPEG, WebP)', included: true },
      { text: '1920x1080 max resolution', included: true },
      { text: 'Full page capture', included: true },
      { text: 'Custom headers', included: true },
      { text: 'Email support', included: true },
      { text: 'Webhook notifications', included: false },
      { text: 'Priority rendering', included: false },
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '/api/v1/subscriptions/checkout?plan=starter',
    ctaVariant: 'outline',
  },
  {
    name: 'Pro',
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: 'For teams with advanced needs',
    features: [
      { text: '10,000 screenshots/month', included: true },
      { text: 'All formats + PDF export', included: true },
      { text: '4K resolution (3840x2160)', included: true },
      { text: 'Full page capture', included: true },
      { text: 'Webhook notifications', included: true },
      { text: 'Dark mode & ad blocking', included: true },
      { text: 'Priority rendering', included: true },
      { text: 'Priority support', included: true },
    ],
    highlighted: true,
    badge: 'POPULAR',
    ctaText: 'Start Free Trial',
    ctaHref: '/api/v1/subscriptions/checkout?plan=pro',
    ctaVariant: 'primary',
  },
  {
    name: 'Enterprise',
    monthlyPrice: 149,
    yearlyPrice: 119,
    description: 'For large organizations',
    features: [
      { text: '50,000 screenshots/month', included: true },
      { text: 'Unlimited formats & resolution', included: true },
      { text: 'Dedicated infrastructure', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SLA guarantee (99.9%)', included: true },
      { text: 'IP whitelisting', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '24/7 phone support', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaHref: 'mailto:sales@screenshot.dev',
    ctaVariant: 'outline',
  },
];

const faqItems: FaqItem[] = [
  {
    question: 'What happens when I exceed my monthly screenshot limit?',
    answer:
      'You can continue capturing screenshots at our pay-as-you-go rate of $0.002 per screenshot. We will notify you when you reach 80% and 100% of your monthly quota so there are no surprises.',
  },
  {
    question: 'Can I change my plan at any time?',
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the change takes effect at the start of your next billing cycle.",
  },
  {
    question: 'Do you offer a free trial?',
    answer:
      'Yes, all paid plans come with a 14-day free trial. No credit card required to start. You can explore all features and only pay when you decide to continue.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and for Enterprise customers, we also support bank transfers and invoicing.',
  },
  {
    question: 'Is there a refund policy?',
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact support within 30 days of your purchase for a full refund.",
  },
];

export function generatePricingSection(): string {
  const planCards = pricingPlans
    .map(
      (plan, index) => `
      <div class="pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}" data-animate data-delay="${index * 100}">
        ${plan.badge ? `<span class="pricing-badge">${plan.badge}</span>` : ''}

        <div class="pricing-header">
          <h3 class="pricing-name">${plan.name}</h3>
          <div class="pricing-price">
            ${
              plan.monthlyPrice === 0
                ? `
              <span class="pricing-amount">$0</span>
              <span class="pricing-period">/forever</span>
            `
                : `
              <span class="pricing-amount monthly-price" data-monthly="${plan.monthlyPrice}" data-yearly="${plan.yearlyPrice}">$${plan.monthlyPrice}</span>
              <span class="pricing-period">/month</span>
            `
            }
          </div>
          ${plan.monthlyPrice > 0 ? `<div class="pricing-yearly-savings">Save $${(plan.monthlyPrice - plan.yearlyPrice) * 12}/year with annual</div>` : ''}
          <p class="pricing-description">${plan.description}</p>
        </div>

        <ul class="pricing-features">
          ${plan.features.map((f) => `<li class="${f.included ? '' : 'feature-disabled'}">${f.included ? getCheckIcon() : getXIcon()} <span>${f.text}</span></li>`).join('')}
        </ul>

        <div class="pricing-cta">
          ${generateButton({
            text: plan.ctaText,
            href: plan.ctaHref,
            variant: plan.ctaVariant,
            fullWidth: true,
          })}
        </div>
      </div>
    `
    )
    .join('');

  const faqHtml = faqItems
    .map(
      (item, index) => `
      <div class="faq-item" data-animate data-delay="${index * 50}">
        <button class="faq-question" aria-expanded="false" aria-controls="faq-answer-${index}">
          <span>${item.question}</span>
          <span class="faq-icon">${getChevronIcon()}</span>
        </button>
        <div class="faq-answer" id="faq-answer-${index}">
          <p>${item.answer}</p>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <section class="pricing-section section" id="pricing">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header" data-animate>
          <div class="section-badge">
            <span class="badge-dot"></span>
            <span>Pricing</span>
          </div>
          <h2 class="section-title">Simple, <span class="gradient-text">Transparent Pricing</span></h2>
          <p class="section-description">
            Start for free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <!-- Billing Toggle -->
        <div class="pricing-toggle-wrapper" data-animate>
          <div class="pricing-toggle">
            <span class="toggle-label toggle-label-monthly active">Monthly</span>
            <button class="toggle-switch" id="billing-toggle" aria-label="Toggle billing period" role="switch" aria-checked="false">
              <span class="toggle-slider"></span>
            </button>
            <span class="toggle-label toggle-label-yearly">
              Yearly
              <span class="discount-badge">Save 20%</span>
            </span>
          </div>
        </div>

        <!-- Pricing Cards -->
        <div class="pricing-grid">
          ${planCards}
        </div>

        <!-- Pay As You Go Note -->
        <div class="pricing-note" data-animate>
          <div class="note-icon">${getInfoIcon()}</div>
          <p>Need more screenshots? All plans include pay-as-you-go pricing at <strong>$0.002 per extra screenshot</strong>.</p>
        </div>

        <!-- FAQ Section -->
        <div class="pricing-faq-section">
          <h3 class="faq-title" data-animate>Frequently Asked Questions</h3>
          <div class="faq-list">
            ${faqHtml}
          </div>
        </div>
      </div>
    </section>
  `;
}

function getCheckIcon(): string {
  return '<svg class="feature-icon feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
}

function getXIcon(): string {
  return '<svg class="feature-icon feature-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
}

function getChevronIcon(): string {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
}

function getInfoIcon(): string {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
}

export function getPricingStyles(): string {
  return `
    /* Pricing Section */
    .pricing-section {
      background: var(--bg-secondary);
      position: relative;
      overflow: hidden;
    }

    .pricing-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 1200px;
      height: 100%;
      background: radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08) 0%, transparent 50%);
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

    /* Billing Toggle */
    .pricing-toggle-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .pricing-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 3rem;
      padding: 0.5rem 1.5rem;
    }

    .toggle-label {
      font-size: 0.9375rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: color 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-label.active {
      color: var(--text-primary);
    }

    .toggle-switch {
      position: relative;
      width: 52px;
      height: 28px;
      background: var(--bg-hover);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }

    .toggle-switch:hover {
      border-color: var(--accent-primary);
    }

    .toggle-switch.active {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      border-color: transparent;
    }

    .toggle-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-switch.active .toggle-slider {
      transform: translateX(24px);
    }

    .discount-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.625rem;
      background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
      color: white;
      font-size: 0.6875rem;
      font-weight: 700;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    /* Pricing Grid */
    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
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
      border-color: var(--border-hover);
    }

    .pricing-card-highlighted {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      transform: scale(1.02);
      z-index: 1;
    }

    .pricing-card-highlighted::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 1rem;
      padding: 1px;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      -webkit-mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      pointer-events: none;
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
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.375rem 1rem;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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
      margin-bottom: 0.75rem;
    }

    .pricing-price {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .pricing-amount {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      transition: all 0.3s ease;
    }

    .pricing-amount.changing {
      opacity: 0;
      transform: translateY(-10px);
    }

    .pricing-period {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .pricing-yearly-savings {
      font-size: 0.75rem;
      color: var(--success);
      margin-bottom: 0.75rem;
      opacity: 0;
      height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .yearly-active .pricing-yearly-savings {
      opacity: 1;
      height: auto;
      margin-bottom: 0.75rem;
    }

    .pricing-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin: 0;
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
      padding: 0.5rem 0;
      color: var(--text-secondary);
      font-size: 0.875rem;
      transition: opacity 0.2s;
    }

    .pricing-features li.feature-disabled {
      opacity: 0.5;
    }

    .pricing-features li.feature-disabled span {
      text-decoration: line-through;
    }

    .feature-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .feature-check {
      color: var(--success);
    }

    .feature-x {
      color: var(--text-muted);
    }

    /* CTA */
    .pricing-cta {
      margin-top: auto;
    }

    /* Pricing Note */
    .pricing-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.25rem 2rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      margin-bottom: 4rem;
    }

    .note-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--accent-tertiary);
      flex-shrink: 0;
    }

    .note-icon svg {
      width: 100%;
      height: 100%;
    }

    .pricing-note p {
      color: var(--text-secondary);
      font-size: 0.9375rem;
      margin: 0;
    }

    .pricing-note strong {
      color: var(--accent-primary);
      font-weight: 600;
    }

    /* FAQ Section */
    .pricing-faq-section {
      max-width: 800px;
      margin: 0 auto;
    }

    .faq-title {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .faq-item {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .faq-item:hover {
      border-color: var(--border-hover);
    }

    .faq-item.active {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    }

    .faq-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      padding: 1.25rem 1.5rem;
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 1rem;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: color 0.2s;
    }

    .faq-question:hover {
      color: var(--accent-primary);
    }

    .faq-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: var(--text-muted);
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    .faq-icon svg {
      width: 100%;
      height: 100%;
    }

    .faq-item.active .faq-icon {
      transform: rotate(180deg);
      color: var(--accent-primary);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease, padding 0.3s ease;
    }

    .faq-item.active .faq-answer {
      max-height: 300px;
    }

    .faq-answer p {
      padding: 0 1.5rem 1.25rem;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      line-height: 1.7;
      margin: 0;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .pricing-toggle {
        padding: 0.375rem 1rem;
        gap: 0.75rem;
      }

      .toggle-label {
        font-size: 0.875rem;
      }

      .discount-badge {
        display: none;
      }

      .toggle-label-yearly::after {
        content: '-20%';
        display: inline-flex;
        align-items: center;
        padding: 0.125rem 0.375rem;
        background: var(--success);
        color: white;
        font-size: 0.625rem;
        font-weight: 700;
        border-radius: 0.25rem;
        margin-left: 0.375rem;
      }

      .pricing-note {
        flex-direction: column;
        text-align: center;
        padding: 1rem 1.5rem;
      }

      .faq-question {
        padding: 1rem 1.25rem;
        font-size: 0.9375rem;
      }

      .faq-answer p {
        padding: 0 1.25rem 1rem;
        font-size: 0.875rem;
      }
    }
  `;
}

export function getPricingScript(): string {
  return `
    // Billing toggle functionality
    const billingToggle = document.getElementById('billing-toggle');
    const monthlyLabel = document.querySelector('.toggle-label-monthly');
    const yearlyLabel = document.querySelector('.toggle-label-yearly');
    const priceElements = document.querySelectorAll('.monthly-price');
    const pricingSection = document.querySelector('.pricing-section');

    if (billingToggle) {
      billingToggle.addEventListener('click', () => {
        const isYearly = billingToggle.classList.toggle('active');
        billingToggle.setAttribute('aria-checked', isYearly.toString());

        // Update labels
        monthlyLabel.classList.toggle('active', !isYearly);
        yearlyLabel.classList.toggle('active', isYearly);

        // Toggle yearly savings visibility
        pricingSection.classList.toggle('yearly-active', isYearly);

        // Animate price change
        priceElements.forEach(el => {
          el.classList.add('changing');

          setTimeout(() => {
            const monthlyPrice = el.dataset.monthly;
            const yearlyPrice = el.dataset.yearly;
            el.textContent = isYearly ? '$' + yearlyPrice : '$' + monthlyPrice;
            el.classList.remove('changing');
          }, 150);
        });
      });
    }

    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        const expanded = question.getAttribute('aria-expanded') === 'true';

        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current item
        item.classList.toggle('active', !isActive);
        question.setAttribute('aria-expanded', (!expanded).toString());
      });
    });
  `;
}
