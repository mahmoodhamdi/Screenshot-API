/**
 * Navbar Component
 * Navigation bar for the landing page with sticky behavior and mobile menu
 */

import { icons } from './icons';

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
          <div class="logo-icon-wrapper">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M5 21L12 17L19 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">Screenshot API</span>
        </a>

        <!-- Desktop Navigation -->
        <ul class="nav-links">
          ${navLinksHtml}
        </ul>

        <!-- Auth Buttons -->
        <div class="nav-auth">
          <a href="/api/v1/auth/login" class="btn btn-ghost btn-sm nav-login-btn">
            ${icons.arrowRight}
            <span>Login</span>
          </a>
          <a href="${ctaHref}" class="btn btn-primary btn-sm nav-cta-btn">
            <span>${ctaText}</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="nav-mobile-toggle" id="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded="false">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <!-- Mobile Menu Overlay -->
      <div class="nav-mobile-overlay" id="mobile-overlay"></div>

      <!-- Mobile Menu -->
      <div class="nav-mobile-menu" id="mobile-menu">
        <div class="nav-mobile-header">
          <a href="/" class="nav-logo">
            <div class="logo-icon-wrapper">
              <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M5 21L12 17L19 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="logo-text">Screenshot API</span>
          </a>
          <button class="nav-mobile-close" id="mobile-menu-close" aria-label="Close menu">
            ${icons.x}
          </button>
        </div>
        <ul class="nav-mobile-links">
          ${navLinksHtml}
          <li><a href="/developer" class="nav-link">Developer Portal</a></li>
        </ul>
        <div class="nav-mobile-auth">
          <a href="/api/v1/auth/login" class="btn btn-outline btn-full">Login</a>
          <a href="${ctaHref}" class="btn btn-primary btn-full">${ctaText}</a>
        </div>
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
      background: rgba(10, 10, 15, 0.6);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .navbar.scrolled {
      background: rgba(10, 10, 15, 0.95);
      border-bottom-color: var(--border-color);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
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
      text-decoration: none;
      transition: transform 0.2s ease;
    }

    .nav-logo:hover {
      transform: scale(1.02);
    }

    .logo-icon-wrapper {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .nav-logo:hover .logo-icon-wrapper {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
      transform: rotate(-5deg);
    }

    .logo-icon {
      width: 24px;
      height: 24px;
      color: var(--accent-primary);
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    /* Desktop Links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.9375rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      position: relative;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0.25rem;
      left: 1rem;
      right: 1rem;
      height: 2px;
      background: var(--accent-primary);
      transform: scaleX(0);
      transition: transform 0.2s ease;
    }

    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-link:hover::after {
      transform: scaleX(1);
    }

    /* Auth Buttons */
    .nav-auth {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-login-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-login-btn svg {
      width: 16px;
      height: 16px;
      transition: transform 0.2s ease;
    }

    .nav-login-btn:hover svg {
      transform: translateX(2px);
    }

    .nav-cta-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    .nav-cta-btn .btn-arrow {
      width: 16px;
      height: 16px;
      transition: transform 0.2s ease;
    }

    .nav-cta-btn:hover .btn-arrow {
      transform: translateX(3px);
    }

    /* Mobile Menu Toggle */
    .nav-mobile-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      padding: 10px;
      transition: all 0.2s ease;
    }

    .nav-mobile-toggle:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-hover);
    }

    .hamburger-line {
      width: 100%;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: center;
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
      transform: scaleX(0);
    }

    .nav-mobile-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    /* Mobile Overlay */
    .nav-mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      z-index: 998;
    }

    .nav-mobile-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    /* Mobile Menu */
    .nav-mobile-menu {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 320px;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      padding: 1.5rem;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 999;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    .nav-mobile-menu.active {
      transform: translateX(0);
    }

    .nav-mobile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .nav-mobile-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-mobile-close:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--border-hover);
    }

    .nav-mobile-close svg {
      width: 20px;
      height: 20px;
    }

    .nav-mobile-links {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;
    }

    .nav-mobile-links li {
      margin-bottom: 0.5rem;
    }

    .nav-mobile-links .nav-link {
      display: block;
      font-size: 1.125rem;
      padding: 0.875rem 1rem;
      border-radius: 0.5rem;
    }

    .nav-mobile-links .nav-link:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .nav-mobile-auth {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-top: 1.5rem;
      margin-top: auto;
      border-top: 1px solid var(--border-color);
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .nav-links {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .nav-links,
      .nav-auth {
        display: none;
      }

      .nav-mobile-toggle {
        display: flex;
      }

      .nav-container {
        padding: 0.875rem 1rem;
      }
    }

    /* Body scroll lock when mobile menu is open */
    body.menu-open {
      overflow: hidden;
    }
  `;
}

export function getNavbarScript(): string {
  return `
    // Mobile menu functionality
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose = document.getElementById('mobile-menu-close');

    function openMobileMenu() {
      mobileToggle.classList.add('active');
      mobileToggle.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.classList.add('menu-open');
    }

    function closeMobileMenu() {
      mobileToggle.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.classList.remove('menu-open');
    }

    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      // Close on overlay click
      if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileMenu);
      }

      // Close button
      if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
      }

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
          closeMobileMenu();
        }
      });
    }

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateNavbar() {
      if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNavbar();
        });
        ticking = true;
      }
    });

    // Initial check
    updateNavbar();
  `;
}
