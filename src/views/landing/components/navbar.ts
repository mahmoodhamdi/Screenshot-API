/**
 * Navbar Component
 * Navigation bar for the landing page
 */

export interface NavLink {
  text: string;
  href: string;
  isExternal?: boolean;
}

export interface NavbarProps {
  links: NavLink[];
  ctaText?: string;
  ctaHref?: string;
}

export function generateNavbar(props: NavbarProps): string {
  const { links, ctaText = 'Get Started', ctaHref = '/api/v1/auth/register' } = props;

  const navLinksHtml = links
    .map(
      (link) => `
      <li>
        <a href="${link.href}" class="nav-link" ${link.isExternal ? 'target="_blank" rel="noopener"' : ''}>
          ${link.text}
        </a>
      </li>
    `
    )
    .join('');

  return `
    <nav class="navbar" id="navbar">
      <div class="nav-container">
        <!-- Logo -->
        <a href="/" class="nav-logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
            <path d="M5 21L12 17L19 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Screenshot API</span>
        </a>

        <!-- Desktop Navigation -->
        <ul class="nav-links">
          ${navLinksHtml}
        </ul>

        <!-- Auth Buttons -->
        <div class="nav-auth">
          <a href="/docs" class="btn btn-ghost btn-sm">Documentation</a>
          <a href="${ctaHref}" class="btn btn-primary btn-sm">${ctaText}</a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="nav-mobile-toggle" id="mobile-menu-toggle" aria-label="Toggle menu">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="nav-mobile-menu" id="mobile-menu">
        <ul class="nav-mobile-links">
          ${navLinksHtml}
          <li><a href="/docs" class="nav-link">Documentation</a></li>
        </ul>
        <a href="${ctaHref}" class="btn btn-primary btn-full">${ctaText}</a>
      </div>
    </nav>
  `;
}

export function getNavbarStyles(): string {
  return `
    /* Navbar Styles */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(10, 10, 15, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
    }

    .nav-container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    /* Logo */
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      text-decoration: none;
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      color: var(--accent-primary);
    }

    /* Desktop Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .nav-link:hover {
      color: var(--text-primary);
    }

    /* Auth Buttons */
    .nav-auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Mobile Menu Toggle */
    .nav-mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 32px;
      height: 32px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
    }

    .hamburger-line {
      width: 100%;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.3s;
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    /* Mobile Menu */
    .nav-mobile-menu {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      padding: 1.5rem;
    }

    .nav-mobile-menu.active {
      display: block;
    }

    .nav-mobile-links {
      list-style: none;
      margin: 0 0 1.5rem 0;
      padding: 0;
    }

    .nav-mobile-links li {
      margin-bottom: 1rem;
    }

    .nav-mobile-links .nav-link {
      font-size: 1.125rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .nav-links,
      .nav-auth {
        display: none;
      }

      .nav-mobile-toggle {
        display: flex;
      }
    }
  `;
}

export function getNavbarScript(): string {
  return `
    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });

      // Close menu on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      lastScrollY = window.scrollY;
    });
  `;
}
