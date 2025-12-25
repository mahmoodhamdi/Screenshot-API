/**
 * Testimonials Section
 * Stats, testimonials carousel, and company logos
 */

interface Stat {
  value: string;
  numericValue: number;
  suffix: string;
  label: string;
  icon: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  avatarColor: string;
}

interface Company {
  name: string;
  logo: string;
}

const stats: Stat[] = [
  {
    value: '10,000+',
    numericValue: 10000,
    suffix: '+',
    label: 'Active Developers',
    icon: getUsersIcon(),
  },
  {
    value: '1M+',
    numericValue: 1000000,
    suffix: '+',
    label: 'Screenshots Captured',
    icon: getCameraIcon(),
  },
  {
    value: '99.9%',
    numericValue: 99.9,
    suffix: '%',
    label: 'Uptime SLA',
    icon: getShieldIcon(),
  },
  {
    value: '<2s',
    numericValue: 2,
    suffix: 's',
    label: 'Average Response',
    icon: getZapIcon(),
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'Screenshot API has been a game-changer for our link preview feature. The speed and reliability are unmatched, and the API is incredibly easy to integrate.',
    author: 'Sarah Chen',
    role: 'Senior Engineer',
    company: 'TechCorp',
    rating: 5,
    avatarColor: '#6366f1',
  },
  {
    quote:
      'We switched from building our own screenshot service to using this API and saved countless hours of maintenance. The full-page capture works flawlessly.',
    author: 'Michael Rodriguez',
    role: 'CTO',
    company: 'StartupXYZ',
    rating: 5,
    avatarColor: '#8b5cf6',
  },
  {
    quote:
      'The dark mode capture and ad blocking features are exactly what we needed for our social media automation tool. Highly recommended!',
    author: 'Emily Watson',
    role: 'Product Manager',
    company: 'SocialFlow',
    rating: 5,
    avatarColor: '#06b6d4',
  },
  {
    quote:
      'Outstanding API documentation and developer experience. We integrated Screenshot API into our platform in less than an hour. The webhook support is fantastic.',
    author: 'David Kim',
    role: 'Lead Developer',
    company: 'DevTools Inc',
    rating: 5,
    avatarColor: '#10b981',
  },
];

const companies: Company[] = [
  { name: 'Vercel', logo: getVercelLogo() },
  { name: 'Stripe', logo: getStripeLogo() },
  { name: 'Notion', logo: getNotionLogo() },
  { name: 'Linear', logo: getLinearLogo() },
  { name: 'Figma', logo: getFigmaLogo() },
  { name: 'Slack', logo: getSlackLogo() },
];

export function generateTestimonialsSection(): string {
  const statsHtml = stats
    .map(
      (stat, index) => `
      <div class="stat-card" data-animate data-delay="${index * 100}">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-value" data-target="${stat.numericValue}" data-suffix="${stat.suffix}">
          ${stat.value}
        </div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `
    )
    .join('');

  const testimonialCards = testimonials
    .map(
      (t, i) => `
      <div class="testimonial-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        <div class="testimonial-card">
          <div class="testimonial-rating">
            ${generateStars(t.rating)}
          </div>
          <div class="testimonial-quote">
            <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
            <p>"${t.quote}"</p>
          </div>
          <div class="testimonial-author">
            <div class="testimonial-avatar" style="background: ${t.avatarColor}">
              ${getInitials(t.author)}
            </div>
            <div class="testimonial-info">
              <span class="testimonial-name">${t.author}</span>
              <span class="testimonial-role">${t.role} at ${t.company}</span>
            </div>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  const dots = testimonials
    .map(
      (_, i) => `
      <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>
    `
    )
    .join('');

  const logosHtml = companies
    .map(
      (company) => `
      <div class="company-logo" title="${company.name}">
        ${company.logo}
      </div>
    `
    )
    .join('');

  return `
    <section class="testimonials-section section" id="testimonials">
      <div class="container">
        <!-- Stats Section -->
        <div class="stats-section">
          <div class="stats-grid">
            ${statsHtml}
          </div>
        </div>

        <!-- Testimonials Header -->
        <div class="section-header" data-animate>
          <div class="section-badge">
            <span class="badge-dot"></span>
            <span>Testimonials</span>
          </div>
          <h2 class="section-title">Trusted by <span class="gradient-text">Developers Worldwide</span></h2>
          <p class="section-description">
            See what our customers have to say about Screenshot API.
          </p>
        </div>

        <!-- Testimonials Carousel -->
        <div class="testimonials-carousel" id="testimonials-carousel">
          <div class="carousel-container">
            <div class="carousel-track">
              ${testimonialCards}
            </div>
          </div>

          <!-- Navigation -->
          <div class="carousel-nav">
            <button class="carousel-btn carousel-prev" aria-label="Previous testimonial">
              ${getChevronLeftIcon()}
            </button>
            <div class="carousel-dots">
              ${dots}
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next testimonial">
              ${getChevronRightIcon()}
            </button>
          </div>
        </div>

        <!-- Company Logos -->
        <div class="company-logos-section" data-animate>
          <p class="company-logos-label">Trusted by developers at</p>
          <div class="company-logos-track">
            <div class="company-logos-scroll">
              ${logosHtml}
              ${logosHtml}
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function generateStars(rating: number): string {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < rating;
    return `<svg class="star-icon ${filled ? 'filled' : ''}" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>`;
  }).join('');
}

// Icon helpers
function getUsersIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`;
}

function getCameraIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>`;
}

function getShieldIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>`;
}

function getZapIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>`;
}

function getChevronLeftIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="15 18 9 12 15 6"/>
  </svg>`;
}

function getChevronRightIcon(): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`;
}

// Company logo SVGs (simplified representations)
function getVercelLogo(): string {
  return `<svg viewBox="0 0 76 65" fill="currentColor">
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
  </svg>`;
}

function getStripeLogo(): string {
  return `<svg viewBox="0 0 60 25" fill="currentColor">
    <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 9.12c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-5.13L32.37 0v3.77l-4.13.88V.44zM23.29 7.92l-.2-2.35h-3.93v14.44h4.12V12.2c.97-1.27 2.59-1.02 3.13-.84V5.57c-.57-.19-2.55-.54-3.12 2.35zM13.65 2.56l-4.02.85-.02 13.23c0 2.45 1.84 4.27 4.29 4.27 1.36 0 2.35-.25 2.9-.55v-3.34c-.53.21-3.15.96-3.15-1.46V9.15h3.15V5.57h-3.15V2.56zM3.93 9.13c0-.66.55-1.04 1.46-1.04 1.3 0 2.95.39 4.25 1.1V5.36c-1.42-.56-2.83-.8-4.25-.8C2.15 4.56 0 6.33 0 9.36c0 4.67 6.4 3.92 6.4 5.93 0 .78-.68 1.04-1.64 1.04-1.42 0-3.24-.58-4.68-1.37v3.93c1.6.69 3.21.97 4.68.97 3.36 0 5.66-1.66 5.66-4.72.02-5.04-6.49-4.14-6.49-6.01z"/>
  </svg>`;
}

function getNotionLogo(): string {
  return `<svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M6.017 4.313l55.333 -4.087c6.797 -0.583 8.543 -0.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277 -1.553 6.807 -6.99 7.193L24.467 99.967c-4.08 0.193 -6.023 -0.39 -8.16 -3.113L3.3 79.94c-2.333 -3.113 -3.3 -5.443 -3.3 -8.167V11.113c0 -3.497 1.553 -6.413 6.017 -6.8z"/>
    <path fill="#fff" d="M61.35 0.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723 0.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257 -3.89c5.433 -0.387 6.99 -2.917 6.99 -7.193V20.64c0 -2.21 -0.873 -2.847 -3.443 -4.733L74.167 3.143c-4.273 -3.107 -6.02 -3.5 -12.817 -2.917zM25.92 19.523c-5.247 0.353 -6.437 0.433 -9.417 -1.99L8.927 11.507c-0.77 -0.78 -0.383 -1.753 1.557 -1.947l53.193 -3.887c4.467 -0.39 6.793 1.167 8.54 2.527l9.123 6.61c0.39 0.197 1.36 1.36 0.193 1.36l-54.933 3.307 -0.68 0.047zM19.803 88.3V30.367c0 -2.53 0.777 -3.697 3.103 -3.893L86 22.78c2.14 -0.193 3.107 1.167 3.107 3.693v57.547c0 2.53 -0.39 4.67 -3.883 4.863l-60.377 3.5c-3.493 0.193 -5.043 -0.97 -5.043 -4.083zm59.6 -54.827c0.387 1.75 0 3.5 -1.75 3.7l-2.91 0.577v42.773c-2.527 1.36 -4.853 2.137 -6.797 2.137 -3.107 0 -3.883 -0.973 -6.21 -3.887l-19.03 -29.94v28.967l6.02 1.363s0 3.5 -4.857 3.5l-13.39 0.777c-0.39 -0.78 0 -2.723 1.357 -3.11l3.497 -0.97v-38.3L30.48 40.667c-0.39 -1.75 0.58 -4.277 3.3 -4.473l14.367 -0.967 19.8 30.327v-26.83l-5.047 -0.58c-0.39 -2.143 1.163 -3.7 3.103 -3.89l13.4 -0.78z"/>
  </svg>`;
}

function getLinearLogo(): string {
  return `<svg viewBox="0 0 100 100" fill="currentColor">
    <path d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5765-37.10318-9.4635-36.7588-37.0037-37.2517-37.2319zM.00189459 46.8891c-.01764375.2833.00133052.5765.0681896.877l9.07190541 39.4082c.20891.9089 1.19211 1.2905 1.85911.7172L76.9 23.9508c.6672-.5732.2856-1.6503-.6233-1.8592L36.869.821454c-.2991-.066987-.5929-.0858-.8761-.068282C16.9234 1.51022 1.24092 17.7946.00189459 46.8891zM61.9685 9.47722 16.8405 54.6051c-.5954.5954-.1703 1.6124.6758 1.6124h40.0393c.5553 0 1.0057-.4504 1.0057-1.0057V14.4536c0-.846-1.0171-1.2711-1.5928-.6764z"/>
  </svg>`;
}

function getFigmaLogo(): string {
  return `<svg viewBox="0 0 38 57" fill="none">
    <path fill="#1ABCFE" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/>
    <path fill="#0ACF83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/>
    <path fill="#FF7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/>
    <path fill="#F24E1E" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/>
    <path fill="#A259FF" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/>
  </svg>`;
}

function getSlackLogo(): string {
  return `<svg viewBox="0 0 54 54" fill="none">
    <path fill="#E01E5A" d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386"/>
    <path fill="#36C5F0" d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387"/>
    <path fill="#2EB67D" d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386"/>
    <path fill="#ECB22E" d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.25m14.336-.001v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.25a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387"/>
  </svg>`;
}

export function getTestimonialsStyles(): string {
  return `
    /* Testimonials Section */
    .testimonials-section {
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }

    .stat-card {
      text-align: center;
      padding: 2rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      border-color: var(--accent-primary);
      box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border-radius: 12px;
      color: var(--accent-primary);
    }

    .stat-icon svg {
      width: 24px;
      height: 24px;
    }

    .stat-value {
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

    .stat-label {
      font-size: 0.9375rem;
      color: var(--text-secondary);
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

    /* Testimonials Carousel */
    .testimonials-carousel {
      margin-bottom: 4rem;
      position: relative;
    }

    .carousel-container {
      overflow: hidden;
      border-radius: 1rem;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .testimonial-slide {
      min-width: 100%;
      padding: 0 1rem;
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    .testimonial-slide.active {
      opacity: 1;
    }

    /* Testimonial Card */
    .testimonial-card {
      max-width: 700px;
      margin: 0 auto;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 2.5rem;
      transition: all 0.3s ease;
    }

    .testimonial-card:hover {
      border-color: var(--border-hover);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    }

    /* Rating */
    .testimonial-rating {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.5rem;
    }

    .star-icon {
      width: 20px;
      height: 20px;
      color: var(--warning);
    }

    .star-icon.filled {
      fill: var(--warning);
    }

    /* Quote */
    .testimonial-quote {
      margin-bottom: 2rem;
      position: relative;
    }

    .quote-icon {
      position: absolute;
      top: -10px;
      left: -10px;
      width: 40px;
      height: 40px;
      color: var(--accent-primary);
      opacity: 0.2;
    }

    .testimonial-quote p {
      font-size: 1.25rem;
      color: var(--text-primary);
      line-height: 1.8;
      font-style: italic;
      padding-left: 1.5rem;
    }

    /* Author */
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1rem;
      color: white;
      flex-shrink: 0;
    }

    .testimonial-info {
      display: flex;
      flex-direction: column;
    }

    .testimonial-name {
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--text-primary);
    }

    .testimonial-role {
      font-size: 0.9375rem;
      color: var(--text-muted);
    }

    /* Carousel Navigation */
    .carousel-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      margin-top: 2rem;
    }

    .carousel-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 50%;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .carousel-btn:hover {
      background: var(--bg-card);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .carousel-btn svg {
      width: 20px;
      height: 20px;
    }

    .carousel-dots {
      display: flex;
      gap: 0.5rem;
    }

    .carousel-dot {
      width: 10px;
      height: 10px;
      background: var(--border-color);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }

    .carousel-dot:hover {
      background: var(--text-muted);
    }

    .carousel-dot.active {
      width: 32px;
      border-radius: 5px;
      background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
    }

    /* Company Logos */
    .company-logos-section {
      text-align: center;
    }

    .company-logos-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
    }

    .company-logos-track {
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }

    .company-logos-scroll {
      display: flex;
      gap: 4rem;
      animation: scroll 30s linear infinite;
      width: max-content;
    }

    .company-logos-scroll:hover {
      animation-play-state: paused;
    }

    @keyframes scroll {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }

    .company-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 40px;
      color: var(--text-muted);
      opacity: 0.5;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .company-logo:hover {
      opacity: 1;
      color: var(--text-primary);
    }

    .company-logo svg {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* Animations */
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes countUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .testimonial-card {
        padding: 1.5rem;
      }

      .testimonial-quote p {
        font-size: 1rem;
        padding-left: 0;
      }

      .quote-icon {
        display: none;
      }

      .carousel-nav {
        gap: 1rem;
      }

      .company-logos-scroll {
        gap: 2rem;
      }

      .company-logo {
        width: 80px;
        height: 30px;
      }
    }
  `;
}

export function getTestimonialsScript(): string {
  return `
    // Stats counter animation
    const statValues = document.querySelectorAll('.stat-value');

    const animateValue = (element, start, end, duration, suffix) => {
      const startTime = performance.now();
      const isLarge = end >= 10000;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;

        if (isLarge) {
          if (end >= 1000000) {
            element.textContent = (current / 1000000).toFixed(1) + 'M' + suffix;
          } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
          }
        } else if (end < 10) {
          element.textContent = '<' + Math.ceil(current) + suffix;
        } else {
          element.textContent = current.toFixed(1) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseFloat(element.dataset.target);
          const suffix = element.dataset.suffix || '';

          animateValue(element, 0, target, 2000, suffix);
          statsObserver.unobserve(element);
        }
      });
    }, { threshold: 0.5 });

    statValues.forEach(el => statsObserver.observe(el));

    // Testimonials Carousel
    const carousel = document.getElementById('testimonials-carousel');
    if (carousel) {
      const track = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.testimonial-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      const prevBtn = carousel.querySelector('.carousel-prev');
      const nextBtn = carousel.querySelector('.carousel-next');

      let currentIndex = 0;
      let autoplayInterval;
      const autoplayDelay = 5000;

      const updateCarousel = (index) => {
        currentIndex = index;

        // Update track position
        track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

        // Update slides
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === currentIndex);
        });

        // Update dots
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      };

      const nextSlide = () => {
        const newIndex = (currentIndex + 1) % slides.length;
        updateCarousel(newIndex);
      };

      const prevSlide = () => {
        const newIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel(newIndex);
      };

      const startAutoplay = () => {
        autoplayInterval = setInterval(nextSlide, autoplayDelay);
      };

      const stopAutoplay = () => {
        clearInterval(autoplayInterval);
      };

      // Event listeners
      prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoplay();
        startAutoplay();
      });

      nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoplay();
        startAutoplay();
      });

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          updateCarousel(i);
          stopAutoplay();
          startAutoplay();
        });
      });

      // Pause on hover
      carousel.addEventListener('mouseenter', stopAutoplay);
      carousel.addEventListener('mouseleave', startAutoplay);

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;

      carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
      }, { passive: true });

      carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        startAutoplay();
      }, { passive: true });

      // Start autoplay
      startAutoplay();
    }
  `;
}
