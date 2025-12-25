/**
 * Testimonials Section
 * Customer testimonials and social proof
 */

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'Screenshot API has been a game-changer for our link preview feature. The speed and reliability are unmatched, and the API is incredibly easy to integrate.',
    author: 'Sarah Chen',
    role: 'Senior Engineer',
    company: 'TechCorp',
  },
  {
    quote:
      'We switched from building our own screenshot service to using this API and saved countless hours of maintenance. The full-page capture works flawlessly.',
    author: 'Michael Rodriguez',
    role: 'CTO',
    company: 'StartupXYZ',
  },
  {
    quote:
      'The dark mode capture and ad blocking features are exactly what we needed for our social media automation tool. Highly recommended!',
    author: 'Emily Watson',
    role: 'Product Manager',
    company: 'SocialFlow',
  },
];

export function generateTestimonialsSection(): string {
  const testimonialCards = testimonials
    .map(
      (t, i) => `
      <div class="testimonial-card" data-animate style="animation-delay: ${i * 0.1}s">
        <div class="testimonial-quote">
          <svg class="quote-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
          <p>${t.quote}</p>
        </div>
        <div class="testimonial-author">
          <div class="testimonial-avatar">
            ${getInitials(t.author)}
          </div>
          <div class="testimonial-info">
            <span class="testimonial-name">${t.author}</span>
            <span class="testimonial-role">${t.role} at ${t.company}</span>
          </div>
        </div>
      </div>
    `
    )
    .join('');

  return `
    <section class="testimonials-section section" id="testimonials">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Testimonials</span>
          <h2 class="section-title">Trusted by <span class="gradient-text">Developers Worldwide</span></h2>
          <p class="section-description">
            See what our customers have to say about Screenshot API.
          </p>
        </div>

        <div class="testimonials-grid">
          ${testimonialCards}
        </div>

        <div class="testimonials-logos" data-animate>
          <p class="testimonials-logos-label">Trusted by teams at</p>
          <div class="testimonials-logos-grid">
            ${generateCompanyLogos()}
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

function generateCompanyLogos(): string {
  const companies = ['TechCorp', 'StartupXYZ', 'SocialFlow', 'DevTools Inc', 'CloudNative'];
  return companies
    .map(
      (company) => `
      <div class="company-logo">${company}</div>
    `
    )
    .join('');
}

export function getTestimonialsStyles(): string {
  return `
    /* Testimonials Section */
    .testimonials-section {
      background: var(--bg-primary);
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    @media (max-width: 1024px) {
      .testimonials-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Testimonial Card */
    .testimonial-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 2rem;
      transition: all 0.3s ease;
    }

    .testimonial-card:hover {
      transform: translateY(-4px);
      border-color: var(--border-hover);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* Quote */
    .testimonial-quote {
      margin-bottom: 1.5rem;
    }

    .quote-icon {
      width: 32px;
      height: 32px;
      color: var(--accent-primary);
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .testimonial-quote p {
      font-size: 1rem;
      color: var(--text-secondary);
      line-height: 1.7;
      font-style: italic;
    }

    /* Author */
    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      color: white;
    }

    .testimonial-info {
      display: flex;
      flex-direction: column;
    }

    .testimonial-name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .testimonial-role {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    /* Company Logos */
    .testimonials-logos {
      text-align: center;
    }

    .testimonials-logos-label {
      font-size: 0.875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
    }

    .testimonials-logos-grid {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 3rem;
      flex-wrap: wrap;
    }

    .company-logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-muted);
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .company-logo:hover {
      opacity: 1;
    }
  `;
}
