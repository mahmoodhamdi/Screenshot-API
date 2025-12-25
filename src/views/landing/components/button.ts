/**
 * Button Component
 * Reusable button styles for the landing page
 */

export interface ButtonProps {
  text: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  fullWidth?: boolean;
  onClick?: string;
}

export function generateButton(props: ButtonProps): string {
  const { text, href, variant = 'primary', size = 'md', icon, fullWidth = false, onClick } = props;

  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';

  const classes = [baseClasses, variantClass, sizeClass, widthClass].filter(Boolean).join(' ');

  const iconHtml = icon ? `<i class="${icon}"></i>` : '';
  const onClickAttr = onClick ? `onclick="${onClick}"` : '';

  if (href) {
    return `<a href="${href}" class="${classes}" ${onClickAttr}>${iconHtml}${text}</a>`;
  }

  return `<button class="${classes}" ${onClickAttr}>${iconHtml}${text}</button>`;
}

export function getButtonStyles(): string {
  return `
    /* Button Base Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      border: none;
      outline: none;
    }

    .btn i {
      font-size: 1em;
    }

    /* Button Sizes */
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-md {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    /* Button Variants */
    .btn-primary {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
    }

    .btn-outline {
      background: transparent;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-outline:hover {
      background: var(--bg-card);
      border-color: var(--accent-primary);
      color: var(--accent-primary);
    }

    .btn-ghost {
      background: transparent;
      color: var(--text-secondary);
    }

    .btn-ghost:hover {
      color: var(--text-primary);
      background: var(--bg-card);
    }

    /* Full Width */
    .btn-full {
      width: 100%;
    }
  `;
}
