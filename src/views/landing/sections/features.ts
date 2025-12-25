/**
 * Features Section
 * Showcases the key features of the Screenshot API with grid and detailed sections
 */

import { icons } from '../components/icons';

// Main feature grid items (6 cards)
interface FeatureCard {
  icon: string;
  title: string;
  description: string;
  color?: string;
}

const featureCards: FeatureCard[] = [
  {
    icon: 'image',
    title: 'High Resolution',
    description: 'Capture stunning screenshots up to 8K resolution for crystal-clear images.',
    color: 'blue',
  },
  {
    icon: 'layers',
    title: 'Multiple Formats',
    description: 'Export to PNG, JPEG, WebP, or PDF. Choose the format that fits your needs.',
    color: 'purple',
  },
  {
    icon: 'maximize',
    title: 'Full Page Capture',
    description:
      'Capture entire scrollable pages with a single API call, including lazy-loaded content.',
    color: 'cyan',
  },
  {
    icon: 'moon',
    title: 'Dark Mode',
    description: 'Automatically detect and capture websites in dark mode for consistent styling.',
    color: 'indigo',
  },
  {
    icon: 'shield',
    title: 'Ad Blocking',
    description: 'Built-in ad blocker removes ads, popups, and cookie banners from screenshots.',
    color: 'green',
  },
  {
    icon: 'globe',
    title: 'Custom Viewport',
    description:
      'Set any width and height configuration to simulate different devices and screens.',
    color: 'orange',
  },
];

// Detailed feature sections (3 columns)
interface DetailedFeature {
  icon: string;
  title: string;
  description: string;
  features: string[];
  color: string;
}

const detailedFeatures: DetailedFeature[] = [
  {
    icon: 'code',
    title: 'Developer Friendly',
    description:
      'Built by developers, for developers. Our API is designed to be intuitive and easy to integrate into any project.',
    features: [
      'RESTful API with JSON responses',
      'SDKs for Node.js, Python, PHP, and more',
      'Comprehensive documentation',
      'Interactive API playground',
      'Webhook support for async operations',
    ],
    color: 'blue',
  },
  {
    icon: 'shield',
    title: 'Enterprise Ready',
    description:
      'Trusted by thousands of companies worldwide. Built with security and reliability at its core.',
    features: [
      '99.9% uptime SLA guarantee',
      'IP and domain whitelisting',
      'Dedicated support team',
      'Custom rate limits',
      'SOC 2 Type II compliant',
    ],
    color: 'purple',
  },
  {
    icon: 'zap',
    title: 'Scalable Infrastructure',
    description:
      'Our globally distributed infrastructure ensures fast and reliable screenshots at any scale.',
    features: [
      'Auto-scaling on demand',
      'Global CDN delivery',
      'Redis caching layer',
      'Multi-region redundancy',
      'Sub-2 second response times',
    ],
    color: 'cyan',
  },
];

export function generateFeaturesSection(): string {
  // Generate feature cards grid
  const featureCardsHtml = featureCards
    .map(
      (feature, index) => `
      <div class="feature-card feature-card-${feature.color || 'blue'}" data-animate data-delay="${index * 100}">
        <div class="feature-card-glow"></div>
        <div class="feature-icon feature-icon-${feature.color || 'blue'}">
          ${icons[feature.icon as keyof typeof icons] || ''}
        </div>
        <h3 class="feature-title">${feature.title}</h3>
        <p class="feature-description">${feature.description}</p>
      </div>
    `
    )
    .join('');

  // Generate detailed features
  const detailedFeaturesHtml = detailedFeatures
    .map(
      (feature, index) => `
      <div class="detailed-feature detailed-feature-${feature.color}" data-animate data-delay="${index * 150}">
        <div class="detailed-feature-header">
          <div class="detailed-feature-icon detailed-feature-icon-${feature.color}">
            ${icons[feature.icon as keyof typeof icons] || ''}
          </div>
          <h3 class="detailed-feature-title">${feature.title}</h3>
        </div>
        <p class="detailed-feature-description">${feature.description}</p>
        <ul class="detailed-feature-list">
          ${feature.features.map((f) => `<li><span class="check-icon">${icons.check}</span><span>${f}</span></li>`).join('')}
        </ul>
      </div>
    `
    )
    .join('');

  return `
    <section class="features-section section" id="features">
      <!-- Background Elements -->
      <div class="features-bg">
        <div class="features-gradient-orb features-orb-1"></div>
        <div class="features-gradient-orb features-orb-2"></div>
      </div>

      <div class="container">
        <!-- Section Header -->
        <div class="section-header" data-animate>
          <div class="section-badge">
            <span class="section-badge-dot"></span>
            <span>Features</span>
          </div>
          <h2 class="section-title">
            Everything You Need for<br>
            <span class="gradient-text">Perfect Screenshots</span>
          </h2>
          <p class="section-description">
            Powerful features designed to make website capture simple, fast, and reliable.
            Built for developers who demand the best.
          </p>
        </div>

        <!-- Feature Cards Grid -->
        <div class="features-grid">
          ${featureCardsHtml}
        </div>

        <!-- Divider -->
        <div class="features-divider" data-animate>
          <div class="features-divider-line"></div>
          <span class="features-divider-text">Advanced Capabilities</span>
          <div class="features-divider-line"></div>
        </div>

        <!-- Detailed Features -->
        <div class="detailed-features-grid">
          ${detailedFeaturesHtml}
        </div>

        <!-- Bottom Stats -->
        <div class="features-stats" data-animate>
          <div class="features-stat">
            <span class="features-stat-value">50+</span>
            <span class="features-stat-label">API Endpoints</span>
          </div>
          <div class="features-stat">
            <span class="features-stat-value">10+</span>
            <span class="features-stat-label">SDKs Available</span>
          </div>
          <div class="features-stat">
            <span class="features-stat-value">99.9%</span>
            <span class="features-stat-label">Uptime SLA</span>
          </div>
          <div class="features-stat">
            <span class="features-stat-value">24/7</span>
            <span class="features-stat-label">Support</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function getFeaturesStyles(): string {
  return `
    /* Features Section */
    .features-section {
      background: var(--bg-secondary);
      position: relative;
      overflow: hidden;
    }

    /* Background Effects */
    .features-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .features-gradient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(150px);
    }

    .features-orb-1 {
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
      top: -200px;
      left: -200px;
      opacity: 0.08;
    }

    .features-orb-2 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
      bottom: -150px;
      right: -150px;
      opacity: 0.06;
    }

    /* Section Badge */
    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--accent-primary);
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .section-badge-dot {
      width: 8px;
      height: 8px;
      background: var(--accent-primary);
      border-radius: 50%;
      animation: pulse-badge 2s infinite;
    }

    @keyframes pulse-badge {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    @media (max-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Feature Card */
    .feature-card {
      position: relative;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.75rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .feature-card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100px;
      background: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 40px rgba(99, 102, 241, 0.1);
    }

    .feature-card:hover .feature-card-glow {
      opacity: 1;
    }

    /* Feature Card Color Variants */
    .feature-card-blue:hover { border-color: rgba(99, 102, 241, 0.5); }
    .feature-card-purple:hover { border-color: rgba(139, 92, 246, 0.5); }
    .feature-card-cyan:hover { border-color: rgba(6, 182, 212, 0.5); }
    .feature-card-indigo:hover { border-color: rgba(99, 102, 241, 0.5); }
    .feature-card-green:hover { border-color: rgba(16, 185, 129, 0.5); }
    .feature-card-orange:hover { border-color: rgba(245, 158, 11, 0.5); }

    .feature-card-blue:hover .feature-card-glow { background: radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.2) 0%, transparent 70%); }
    .feature-card-purple:hover .feature-card-glow { background: radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 70%); }
    .feature-card-cyan:hover .feature-card-glow { background: radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.2) 0%, transparent 70%); }
    .feature-card-green:hover .feature-card-glow { background: radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.2) 0%, transparent 70%); }
    .feature-card-orange:hover .feature-card-glow { background: radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.2) 0%, transparent 70%); }

    /* Feature Icon */
    .feature-icon {
      position: relative;
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
      transition: transform 0.3s ease;
    }

    .feature-card:hover .feature-icon {
      transform: scale(1.1);
    }

    .feature-icon svg {
      width: 26px;
      height: 26px;
    }

    /* Icon Color Variants */
    .feature-icon-blue {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
      color: #818cf8;
    }
    .feature-icon-purple {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: #a78bfa;
    }
    .feature-icon-cyan {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
      color: #22d3ee;
    }
    .feature-icon-indigo {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: #a5b4fc;
    }
    .feature-icon-green {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
      color: #34d399;
    }
    .feature-icon-orange {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.1) 100%);
      color: #fbbf24;
    }

    .feature-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.625rem;
    }

    .feature-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    /* Divider */
    .features-divider {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin: 4rem 0;
    }

    .features-divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, var(--border-color) 50%, transparent 100%);
    }

    .features-divider-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }

    /* Detailed Features Grid */
    .detailed-features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-bottom: 4rem;
    }

    @media (max-width: 1024px) {
      .detailed-features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    /* Detailed Feature Card */
    .detailed-feature {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1.25rem;
      padding: 2rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .detailed-feature:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .detailed-feature-blue:hover { border-color: rgba(99, 102, 241, 0.3); }
    .detailed-feature-purple:hover { border-color: rgba(139, 92, 246, 0.3); }
    .detailed-feature-cyan:hover { border-color: rgba(6, 182, 212, 0.3); }

    .detailed-feature-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .detailed-feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .detailed-feature-icon svg {
      width: 24px;
      height: 24px;
    }

    .detailed-feature-icon-blue {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
      color: #818cf8;
    }
    .detailed-feature-icon-purple {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
      color: #a78bfa;
    }
    .detailed-feature-icon-cyan {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%);
      color: #22d3ee;
    }

    .detailed-feature-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }

    .detailed-feature-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 1.5rem;
    }

    .detailed-feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .detailed-feature-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.5rem 0;
      font-size: 0.9375rem;
      color: var(--text-secondary);
    }

    .detailed-feature-list li:first-child {
      padding-top: 0;
    }

    .detailed-feature-list .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: rgba(16, 185, 129, 0.15);
      border-radius: 50%;
      color: var(--success);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .detailed-feature-list .check-icon svg {
      width: 12px;
      height: 12px;
    }

    /* Features Stats */
    .features-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      padding: 2.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
    }

    @media (max-width: 768px) {
      .features-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .features-stats {
        grid-template-columns: 1fr;
      }
    }

    .features-stat {
      text-align: center;
    }

    .features-stat-value {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .features-stat-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Scroll Animation Styles */
    .feature-card[data-animate],
    .detailed-feature[data-animate] {
      opacity: 0;
      transform: translateY(30px);
    }

    .feature-card.animate-fade-in-up,
    .detailed-feature.animate-fade-in-up {
      animation: featureFadeInUp 0.6s ease forwards;
    }

    @keyframes featureFadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Staggered animation delays */
    .feature-card[data-delay="0"] { animation-delay: 0ms; }
    .feature-card[data-delay="100"] { animation-delay: 100ms; }
    .feature-card[data-delay="200"] { animation-delay: 200ms; }
    .feature-card[data-delay="300"] { animation-delay: 300ms; }
    .feature-card[data-delay="400"] { animation-delay: 400ms; }
    .feature-card[data-delay="500"] { animation-delay: 500ms; }

    .detailed-feature[data-delay="0"] { animation-delay: 0ms; }
    .detailed-feature[data-delay="150"] { animation-delay: 150ms; }
    .detailed-feature[data-delay="300"] { animation-delay: 300ms; }
  `;
}
