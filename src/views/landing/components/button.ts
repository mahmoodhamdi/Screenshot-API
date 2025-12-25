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
  ariaLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function generateButton(props: ButtonProps): string {
  const {
    text,
    href,
    variant = 'primary',
    size = 'md',
    icon,
    fullWidth = false,
    onClick,
    ariaLabel,
    disabled = false,
    loading = false,
    type = 'button',
  } = props;

  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full' : '';
  const loadingClass = loading ? 'btn-loading' : '';

  const classes = [baseClasses, variantClass, sizeClass, widthClass, loadingClass]
    .filter(Boolean)
    .join(' ');

  const iconHtml = icon ? `<i class="${icon}" aria-hidden="true"></i>` : '';
  const onClickAttr = onClick ? `onclick="${onClick}"` : '';
  const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
  const disabledAttr = disabled ? 'disabled aria-disabled="true"' : '';
  const loadingAttr = loading ? 'aria-busy="true"' : '';

  if (href) {
    // External links should have rel="noopener noreferrer" and target="_blank"
    const isExternal = href.startsWith('http') || href.startsWith('mailto:');
    const externalAttrs = isExternal ? 'rel="noopener noreferrer"' : '';

    return `<a href="${href}" class="${classes}" ${onClickAttr} ${ariaLabelAttr} ${externalAttrs}>${iconHtml}<span>${text}</span></a>`;
  }

  return `<button type="${type}" class="${classes}" ${onClickAttr} ${ariaLabelAttr} ${disabledAttr} ${loadingAttr}>${iconHtml}<span>${text}</span></button>`;
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
      font-family: inherit;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      cursor: pointer;
      text-decoration: none;
      border: none;
      outline: none;
      position: relative;
      overflow: hidden;
    }

    .btn i {
      font-size: 1em;
    }

    .btn span {
      position: relative;
      z-index: 1;
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
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-primary:active {
      transform: translateY(0) scale(0.98);
    }

    .btn-secondary {
      background: var(--bg-card);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn-secondary:hover {
      background: var(--bg-hover);
      border-color: var(--border-hover);
      transform: translateY(-2px);
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
      transform: translateY(-2px);
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

    /* Disabled State */
    .btn:disabled,
    .btn[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* Focus State */
    .btn:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
    }

    /* Loading State */
    .btn-loading {
      color: transparent !important;
      pointer-events: none;
    }

    .btn-loading::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: btn-spin 0.8s linear infinite;
    }

    @keyframes btn-spin {
      to { transform: rotate(360deg); }
    }

    /* Ripple Effect on Click */
    .btn::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.4s ease, height 0.4s ease;
    }

    .btn:hover::after {
      width: 300px;
      height: 300px;
    }

    /* Icon Animation */
    .btn svg {
      transition: transform 0.2s ease;
    }

    .btn:hover svg {
      transform: translateX(3px);
    }
  `;
}
