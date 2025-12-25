/**
 * Footer Section
 * Site footer with links, newsletter signup, and copyright
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
        <!-- Newsletter Section -->
        <div class="footer-newsletter">
          <div class="newsletter-content">
            <div class="newsletter-text">
              <h3 class="newsletter-title">Stay Updated</h3>
              <p class="newsletter-description">
                Get the latest updates, tips, and tutorials delivered to your inbox.
              </p>
            </div>
            <form class="newsletter-form" id="newsletter-form">
              <div class="newsletter-input-wrapper">
                <svg class="newsletter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 6L12 13L2 6"/>
                </svg>
                <input
                  type="email"
                  class="newsletter-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button type="submit" class="newsletter-btn">
                Subscribe
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
          <div class="newsletter-success" id="newsletter-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Thanks for subscribing!</span>
          </div>
        </div>

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
              Professional screenshot API for developers. Capture any website in milliseconds with our fast, reliable, and scalable service.
            </p>
            <div class="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener" aria-label="GitHub" class="social-link">
                ${icons.github}
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" class="social-link">
                ${icons.twitter}
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener" aria-label="Discord" class="social-link">
                ${icons.discord}
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" class="social-link">
                ${icons.linkedin}
              </a>
            </div>
          </div>

          <div class="footer-columns">
            ${columns}
          </div>
        </div>

        <div class="footer-bottom">
          <div class="footer-bottom-left">
            <p class="footer-copyright">
              &copy; ${currentYear} Screenshot API. All rights reserved.
            </p>
            <p class="footer-made-with">
              Made with <span class="heart">&#10084;</span> by <a href="mailto:hmdy7486@gmail.com">Mahmood Hamdi</a>
            </p>
          </div>
          <div class="footer-bottom-right">
            <div class="footer-badges">
              <span class="footer-badge security-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                SOC 2
              </span>
              <span class="footer-badge compliance-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                GDPR
              </span>
              <span class="footer-badge api-version-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
                API v1.0
              </span>
            </div>
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
      padding: 0 1.5rem 2rem;
    }

    /* Newsletter Section */
    .footer-newsletter {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 2.5rem;
      margin-bottom: 4rem;
      position: relative;
      overflow: hidden;
      transform: translateY(-50%);
    }

    .footer-newsletter::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%);
      pointer-events: none;
    }

    .newsletter-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      position: relative;
      z-index: 1;
    }

    @media (max-width: 768px) {
      .newsletter-content {
        flex-direction: column;
        text-align: center;
      }
    }

    .newsletter-text {
      flex: 1;
    }

    .newsletter-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .newsletter-description {
      font-size: 1rem;
      color: var(--text-secondary);
    }

    .newsletter-form {
      display: flex;
      gap: 0.75rem;
      flex: 1;
      max-width: 450px;
    }

    @media (max-width: 768px) {
      .newsletter-form {
        flex-direction: column;
        width: 100%;
        max-width: 100%;
      }
    }

    .newsletter-input-wrapper {
      position: relative;
      flex: 1;
    }

    .newsletter-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      pointer-events: none;
    }

    .newsletter-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      font-size: 1rem;
      font-family: inherit;
      color: var(--text-primary);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      outline: none;
      transition: all 0.2s;
    }

    .newsletter-input::placeholder {
      color: var(--text-muted);
    }

    .newsletter-input:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .newsletter-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      color: white;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .newsletter-btn svg {
      width: 18px;
      height: 18px;
      transition: transform 0.2s;
    }

    .newsletter-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
    }

    .newsletter-btn:hover svg {
      transform: translateX(3px);
    }

    .newsletter-success {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--success);
      font-weight: 500;
    }

    .newsletter-success svg {
      width: 24px;
      height: 24px;
    }

    .newsletter-success.show {
      display: flex;
    }

    .newsletter-content.hidden {
      display: none;
    }

    /* Footer Main */
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
      max-width: 320px;
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
      transition: opacity 0.2s;
    }

    .footer-logo:hover {
      opacity: 0.8;
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
      line-height: 1.7;
    }

    .footer-social {
      display: flex;
      gap: 0.75rem;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .social-link:hover {
      color: var(--text-primary);
      border-color: var(--border-hover);
      background: var(--bg-hover);
      transform: translateY(-3px);
    }

    .social-link svg {
      width: 20px;
      height: 20px;
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
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1.25rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.875rem;
    }

    .footer-links a {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.2s;
      display: inline-block;
    }

    .footer-links a:hover {
      color: var(--text-primary);
      transform: translateX(3px);
    }

    /* Bottom */
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }

    .footer-bottom-left {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .footer-bottom-left {
        align-items: center;
      }
    }

    .footer-copyright {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .footer-made-with {
      font-size: 0.875rem;
      color: var(--text-muted);
    }

    .footer-made-with .heart {
      color: #ef4444;
      animation: heartbeat 1.5s ease-in-out infinite;
      display: inline-block;
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .footer-made-with a {
      color: var(--accent-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .footer-made-with a:hover {
      color: var(--accent-secondary);
    }

    .footer-bottom-right {
      display: flex;
      align-items: center;
    }

    .footer-badges {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .footer-badges {
        justify-content: center;
      }
    }

    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.5rem 0.875rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .footer-badge svg {
      width: 14px;
      height: 14px;
    }

    .footer-badge:hover {
      border-color: var(--border-hover);
      color: var(--text-secondary);
    }

    .security-badge svg {
      color: var(--success);
    }

    .compliance-badge svg {
      color: var(--accent-primary);
    }

    .api-version-badge {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
      border-color: rgba(99, 102, 241, 0.3);
      color: var(--accent-primary);
    }

    .api-version-badge svg {
      color: var(--accent-secondary);
    }
  `;
}

export function getFooterScript(): string {
  return `
    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterContent = document.querySelector('.newsletter-content');
    const newsletterSuccess = document.getElementById('newsletter-success');

    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const emailInput = this.querySelector('.newsletter-input');
        const email = emailInput.value;

        // Simulate API call
        const btn = this.querySelector('.newsletter-btn');
        btn.innerHTML = '<span>Subscribing...</span>';
        btn.disabled = true;

        setTimeout(() => {
          // Show success message
          newsletterContent.classList.add('hidden');
          newsletterSuccess.classList.add('show');

          // Log subscription (in real app, send to backend)
          console.log('Newsletter subscription:', email);
        }, 1000);
      });
    }
  `;
}
