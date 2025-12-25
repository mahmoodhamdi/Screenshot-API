/**
 * Landing Page Generator
 * Main entry point for generating the landing page HTML
 */

import { generateNavbar, getNavbarStyles, getNavbarScript } from './components/navbar';
import { getButtonStyles } from './components/button';
import { getCardStyles } from './components/card';
import { getIconStyles } from './components/icons';

// Section imports
import { generateHeroSection, getHeroStyles, getHeroScript } from './sections/hero';
import { generateFeaturesSection, getFeaturesStyles } from './sections/features';
import {
  generateCodeDemoSection,
  getCodeDemoStyles,
  getCodeDemoScript,
} from './sections/code-demo';
import { generatePricingSection, getPricingStyles, getPricingScript } from './sections/pricing';
import { generateTestimonialsSection, getTestimonialsStyles } from './sections/testimonials';
import { generateCtaSection, getCtaStyles } from './sections/cta';
import { generateFooter, getFooterStyles } from './sections/footer';

export interface LandingPageConfig {
  title?: string;
  description?: string;
  baseUrl?: string;
}

/**
 * Generate the complete landing page HTML
 */
export function generateLandingPage(config: LandingPageConfig = {}): string {
  const {
    title = 'Screenshot API - Capture Any Website Instantly',
    description = 'Professional screenshot API for developers. Capture websites, generate thumbnails, and export to PDF with a simple API call.',
    baseUrl = '',
  } = config;

  // Navigation links
  const navLinks = [
    { text: 'Features', href: '#features' },
    { text: 'Pricing', href: '#pricing' },
    { text: 'Docs', href: '/docs' },
    { text: 'Developer', href: '/developer' },
  ];

  // Generate all sections
  const navbar = generateNavbar({ links: navLinks });
  const heroSection = generateHeroSection();
  const featuresSection = generateFeaturesSection();
  const codeDemoSection = generateCodeDemoSection();
  const pricingSection = generatePricingSection();
  const testimonialsSection = generateTestimonialsSection();
  const ctaSection = generateCtaSection();
  const footer = generateFooter();

  // Combine all styles
  const styles = `
    ${getBaseStyles()}
    ${getNavbarStyles()}
    ${getButtonStyles()}
    ${getCardStyles()}
    ${getIconStyles()}
    ${getHeroStyles()}
    ${getFeaturesStyles()}
    ${getCodeDemoStyles()}
    ${getPricingStyles()}
    ${getTestimonialsStyles()}
    ${getCtaStyles()}
    ${getFooterStyles()}
  `;

  // Combine all scripts
  const scripts = `
    ${getNavbarScript()}
    ${getHeroScript()}
    ${getCodeDemoScript()}
    ${getPricingScript()}
    ${getBaseScripts()}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${description}">
  <meta name="keywords" content="screenshot api, website capture, thumbnail generator, pdf export, web scraping">
  <meta name="author" content="Screenshot API">

  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <title>${title}</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>${styles}</style>
</head>
<body>
  ${navbar}

  <main>
    ${heroSection}
    ${featuresSection}
    ${codeDemoSection}
    ${pricingSection}
    ${testimonialsSection}
    ${ctaSection}
  </main>

  ${footer}

  <script>${scripts}</script>
</body>
</html>`;
}

/**
 * Base styles for the landing page
 */
function getBaseStyles(): string {
  return `
    /* CSS Variables - Design System */
    :root {
      /* Colors */
      --bg-primary: #0a0a0f;
      --bg-secondary: #12121a;
      --bg-card: #1a1a24;
      --bg-hover: #22222e;

      --text-primary: #ffffff;
      --text-secondary: #a0a0b0;
      --text-muted: #6b6b7b;

      --accent-primary: #6366f1;
      --accent-secondary: #8b5cf6;
      --accent-tertiary: #06b6d4;

      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;

      --border-color: rgba(255, 255, 255, 0.08);
      --border-hover: rgba(255, 255, 255, 0.15);

      /* Typography */
      --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

      /* Spacing */
      --section-padding: 6rem 1.5rem;
      --container-max: 1280px;

      /* Transitions */
      --transition-fast: 0.15s ease;
      --transition-normal: 0.3s ease;
    }

    /* Reset */
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      font-family: var(--font-sans);
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      font-weight: 700;
      line-height: 1.2;
    }

    h1 { font-size: clamp(2.5rem, 5vw, 4rem); }
    h2 { font-size: clamp(2rem, 4vw, 3rem); }
    h3 { font-size: clamp(1.25rem, 2vw, 1.5rem); }

    p {
      color: var(--text-secondary);
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Container */
    .container {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Section */
    .section {
      padding: var(--section-padding);
    }

    .section-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 4rem;
    }

    .section-label {
      display: inline-block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--accent-primary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }

    .section-title {
      margin-bottom: 1rem;
    }

    .section-description {
      font-size: 1.125rem;
      color: var(--text-secondary);
    }

    /* Grid */
    .grid {
      display: grid;
      gap: 1.5rem;
    }

    .grid-2 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-4 { grid-template-columns: repeat(4, 1fr); }

    @media (max-width: 1024px) {
      .grid-4 { grid-template-columns: repeat(2, 1fr); }
      .grid-3 { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .grid-4, .grid-3, .grid-2 { grid-template-columns: 1fr; }
    }

    /* Gradient Text */
    .gradient-text {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 50%, var(--accent-tertiary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Glow Effect */
    .glow {
      position: relative;
    }

    .glow::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: -1;
    }

    /* Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    /* Utility Classes */
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }

    .flex { display: flex; }
    .flex-center { display: flex; align-items: center; justify-content: center; }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .flex-col { flex-direction: column; }
    .gap-1 { gap: 0.5rem; }
    .gap-2 { gap: 1rem; }
    .gap-3 { gap: 1.5rem; }
    .gap-4 { gap: 2rem; }

    .mt-1 { margin-top: 0.5rem; }
    .mt-2 { margin-top: 1rem; }
    .mt-3 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 2rem; }

    .mb-1 { margin-bottom: 0.5rem; }
    .mb-2 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 2rem; }

    /* Selection */
    ::selection {
      background: var(--accent-primary);
      color: white;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-hover);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
  `;
}

/**
 * Base scripts for the landing page
 */
function getBaseScripts(): string {
  return `
    // Intersection Observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  `;
}

export default generateLandingPage;
