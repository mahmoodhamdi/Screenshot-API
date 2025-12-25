/**
 * Footer Section
 * Site footer with links and copyright
 */

import { icons } from '../components/icons';

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { text: 'Features', href: '#features' },
      { text: 'Pricing', href: '#pricing' },
      { text: 'API Reference', href: '/api/v1' },
      { text: 'Documentation', href: '/docs' },
      { text: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Getting Started', href: '/docs#getting-started' },
      { text: 'Code Examples', href: '/developer' },
      { text: 'SDKs', href: '/docs#sdks' },
      { text: 'Status Page', href: '/status' },
      { text: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { text: 'About', href: '/about' },
      { text: 'Blog', href: '/blog' },
      { text: 'Careers', href: '/careers' },
      { text: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { text: 'Privacy Policy', href: '/privacy' },
      { text: 'Terms of Service', href: '/terms' },
      { text: 'Cookie Policy', href: '/cookies' },
      { text: 'DPA', href: '/dpa' },
    ],
  },
];

export function generateFooter(): string {
  const columns = footerColumns
    .map(
      (col) => `
      <div class="footer-column">
        <h4 class="footer-column-title">${col.title}</h4>
        <ul class="footer-links">
          ${col.links.map((link) => `<li><a href="${link.href}">${link.text}</a></li>`).join('')}
        </ul>
      </div>
    `
    )
    .join('');

  const currentYear = new Date().getFullYear();

  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-main">
          <div class="footer-brand">
            <a href="/" class="footer-logo">
              <svg class="footer-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M5 21L12 17L19 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Screenshot API</span>
            </a>
            <p class="footer-description">
              Professional screenshot API for developers. Capture any website in milliseconds.
            </p>
            <div class="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub">
                ${icons.github}
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter">
                ${icons.twitter}
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">
                ${icons.linkedin}
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener" aria-label="Discord">
                ${icons.discord}
              </a>
            </div>
          </div>

          <div class="footer-columns">
            ${columns}
          </div>
        </div>

        <div class="footer-bottom">
          <p class="footer-copyright">
            &copy; ${currentYear} Screenshot API. All rights reserved.
          </p>
          <div class="footer-badges">
            <span class="footer-badge">SOC 2 Compliant</span>
            <span class="footer-badge">GDPR Ready</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function getFooterStyles(): string {
  return `
    /* Footer */
    .footer {
      background: var(--bg-primary);
      border-top: 1px solid var(--border-color);
      padding: 4rem 1.5rem 2rem;
    }

    .footer-main {
      display: grid;
      grid-template-columns: 1.5fr 3fr;
      gap: 4rem;
      margin-bottom: 3rem;
    }

    @media (max-width: 1024px) {
      .footer-main {
        grid-template-columns: 1fr;
        gap: 3rem;
      }
    }

    /* Brand */
    .footer-brand {
      max-width: 300px;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
      margin-bottom: 1rem;
    }

    .footer-logo-icon {
      width: 32px;
      height: 32px;
      color: var(--accent-primary);
    }

    .footer-description {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .footer-social {
      display: flex;
      gap: 1rem;
    }

    .footer-social a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .footer-social a:hover {
      color: var(--accent-primary);
      border-color: var(--accent-primary);
      transform: translateY(-2px);
    }

    .footer-social svg {
      width: 18px;
      height: 18px;
    }

    /* Columns */
    .footer-columns {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .footer-columns {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 480px) {
      .footer-columns {
        grid-template-columns: 1fr;
      }
    }

    .footer-column-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer-links a:hover {
      color: var(--text-primary);
    }

    /* Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    @media (max-width: 640px) {
      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }

    .footer-copyright {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .footer-badges {
      display: flex;
      gap: 0.75rem;
    }

    .footer-badge {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--text-muted);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
    }
  `;
}
