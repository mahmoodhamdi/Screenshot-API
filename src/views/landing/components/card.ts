/**
 * Card Component
 * Reusable card styles for the landing page
 */

export interface CardProps {
  title: string;
  description?: string;
  icon?: string;
  iconEmoji?: string;
  href?: string;
  variant?: 'default' | 'feature' | 'pricing' | 'testimonial';
  highlighted?: boolean;
  badge?: string;
  children?: string;
}

export function generateCard(props: CardProps): string {
  const {
    title,
    description,
    icon,
    iconEmoji,
    href,
    variant = 'default',
    highlighted = false,
    badge,
    children,
  } = props;

  const classes = ['card', `card-${variant}`, highlighted ? 'card-highlighted' : '']
    .filter(Boolean)
    .join(' ');

  const iconHtml = iconEmoji
    ? `<div class="card-icon">${iconEmoji}</div>`
    : icon
      ? `<div class="card-icon"><i class="${icon}"></i></div>`
      : '';

  const badgeHtml = badge ? `<span class="card-badge">${badge}</span>` : '';

  const content = `
    ${badgeHtml}
    ${iconHtml}
    <h3 class="card-title">${title}</h3>
    ${description ? `<p class="card-description">${description}</p>` : ''}
    ${children || ''}
  `;

  if (href) {
    return `<a href="${href}" class="${classes}">${content}</a>`;
  }

  return `<div class="${classes}">${content}</div>`;
}

export function getCardStyles(): string {
  return `
    /* Card Base Styles */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: var(--border-hover);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    a.card {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    /* Card Icon */
    .card-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .card-icon i {
      color: var(--accent-primary);
    }

    /* Card Title */
    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    /* Card Description */
    .card-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.6;
    }

    /* Card Badge */
    .card-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Card Highlighted */
    .card-highlighted {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    }

    .card-highlighted:hover {
      border-color: var(--accent-secondary);
    }

    /* Feature Card */
    .card-feature {
      text-align: center;
    }

    .card-feature .card-icon {
      margin: 0 auto 1rem;
    }

    /* Pricing Card */
    .card-pricing {
      padding: 2rem;
    }

    .card-pricing .card-title {
      font-size: 1.5rem;
    }

    /* Testimonial Card */
    .card-testimonial {
      padding: 2rem;
    }

    .card-testimonial .card-description {
      font-style: italic;
      font-size: 1rem;
      margin-bottom: 1.5rem;
    }
  `;
}
