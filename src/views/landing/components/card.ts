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
  ariaLabel?: string;
  tabIndex?: number;
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
    ariaLabel,
    tabIndex,
  } = props;

  const classes = ['card', `card-${variant}`, highlighted ? 'card-highlighted' : '']
    .filter(Boolean)
    .join(' ');

  const iconHtml = iconEmoji
    ? `<div class="card-icon" aria-hidden="true">${iconEmoji}</div>`
    : icon
      ? `<div class="card-icon" aria-hidden="true"><i class="${icon}"></i></div>`
      : '';

  const badgeHtml = badge ? `<span class="card-badge">${badge}</span>` : '';
  const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
  const tabIndexAttr = tabIndex !== undefined ? `tabindex="${tabIndex}"` : '';

  const content = `
    ${badgeHtml}
    ${iconHtml}
    <h3 class="card-title">${title}</h3>
    ${description ? `<p class="card-description">${description}</p>` : ''}
    ${children || ''}
  `;

  if (href) {
    const isExternal = href.startsWith('http');
    const externalAttrs = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${href}" class="${classes}" ${ariaLabelAttr} ${externalAttrs}>${content}</a>`;
  }

  return `<div class="${classes}" ${ariaLabelAttr} ${tabIndexAttr} role="article">${content}</div>`;
}

export function getCardStyles(): string {
  return `
    /* Card Base Styles */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 1rem;
      padding: 1.5rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      will-change: transform, box-shadow;
    }

    /* Glow effect overlay */
    .card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.1), transparent 50%);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .card:hover::before {
      opacity: 1;
    }

    .card:hover {
      transform: translateY(-8px);
      border-color: var(--border-hover);
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 40px rgba(99, 102, 241, 0.1);
    }

    /* Focus State */
    .card:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
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
      transition: transform 0.3s ease, background 0.3s ease;
    }

    .card:hover .card-icon {
      transform: scale(1.1);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
    }

    .card-icon i {
      color: var(--accent-primary);
    }

    .card-icon svg {
      transition: transform 0.3s ease;
    }

    .card:hover .card-icon svg {
      transform: scale(1.1);
    }

    /* Card Title */
    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
      transition: color 0.3s ease;
    }

    .card:hover .card-title {
      color: var(--accent-primary);
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
      animation: pulse-badge 2s ease-in-out infinite;
    }

    @keyframes pulse-badge {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
    }

    /* Card Highlighted */
    .card-highlighted {
      border-color: var(--accent-primary);
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    }

    .card-highlighted:hover {
      border-color: var(--accent-secondary);
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 60px rgba(99, 102, 241, 0.2);
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

    /* Card Active/Pressed State */
    .card:active {
      transform: translateY(-4px) scale(0.99);
    }
  `;
}
