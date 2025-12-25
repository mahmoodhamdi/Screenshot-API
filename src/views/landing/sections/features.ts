/**
 * Features Section
 * Showcases the key features of the Screenshot API
 */

import { icons } from '../components/icons';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: 'zap',
    title: 'Lightning Fast',
    description:
      'Capture screenshots in under 2 seconds with our globally distributed infrastructure.',
  },
  {
    icon: 'maximize',
    title: 'Full Page Capture',
    description:
      'Capture entire web pages, including content below the fold, with a single API call.',
  },
  {
    icon: 'layers',
    title: 'Multiple Formats',
    description: 'Export to PNG, JPEG, WebP, or PDF. Choose the format that fits your needs.',
  },
  {
    icon: 'moon',
    title: 'Dark Mode Support',
    description: 'Automatically capture websites in dark mode for consistent screenshots.',
  },
  {
    icon: 'shield',
    title: 'Ad Blocking',
    description: 'Built-in ad blocker removes annoying ads and popups from your screenshots.',
  },
  {
    icon: 'globe',
    title: 'Global CDN',
    description: 'Screenshots are stored and delivered via a global CDN for fastest access.',
  },
  {
    icon: 'code',
    title: 'Simple API',
    description: 'RESTful API with comprehensive documentation and SDK support.',
  },
  {
    icon: 'image',
    title: 'Thumbnail Generation',
    description: 'Automatically generate thumbnails in any size for previews and galleries.',
  },
];

export function generateFeaturesSection(): string {
  const featureCards = features
    .map((feature) => {
      const iconSvg = icons[feature.icon as keyof typeof icons] || '';
      return `
        <div class="feature-card" data-animate>
          <div class="feature-icon">
            ${iconSvg}
          </div>
          <h3 class="feature-title">${feature.title}</h3>
          <p class="feature-description">${feature.description}</p>
        </div>
      `;
    })
    .join('');

  return `
    <section class="features-section section" id="features">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Features</span>
          <h2 class="section-title">Everything You Need for <span class="gradient-text">Perfect Screenshots</span></h2>
          <p class="section-description">
            Powerful features designed to make website capture simple and reliable.
          </p>
        </div>

        <div class="features-grid">
          ${featureCards}
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
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
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
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-primary);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      color: var(--accent-primary);
    }

    .feature-icon svg {
      width: 24px;
      height: 24px;
    }

    .feature-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .feature-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }
  `;
}
