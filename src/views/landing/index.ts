/**
 * Landing Page Generator
 * Main entry point for generating the landing page HTML
 * Phase 8: Animations, Accessibility, and Performance Optimizations
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
import {
  generateTestimonialsSection,
  getTestimonialsStyles,
  getTestimonialsScript,
} from './sections/testimonials';
import { generateCtaSection, getCtaStyles } from './sections/cta';
import { generateFooter, getFooterStyles, getFooterScript } from './sections/footer';

export interface LandingPageConfig {
  title?: string;
  description?: string;
  baseUrl?: string;
  canonicalUrl?: string;
  ogImage?: string;
  twitterHandle?: string;
}

/**
 * Generate the complete landing page HTML
 */
export function generateLandingPage(config: LandingPageConfig = {}): string {
  const {
    title = 'Screenshot API - Capture Any Website Instantly',
    description = 'Professional screenshot API for developers. Capture websites, generate thumbnails, and export to PDF with a simple API call. 10,000+ developers trust our fast, reliable service.',
    baseUrl = '',
    canonicalUrl = '',
    ogImage = '/images/og-image.png',
    twitterHandle = '@screenshotapi',
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
    ${getAccessibilityStyles()}
    ${getAnimationStyles()}
    ${getLoadingStyles()}
    ${getMobileStyles()}
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
    ${getTestimonialsScript()}
    ${getFooterScript()}
    ${getBaseScripts()}
    ${getAnimationScripts()}
    ${getAccessibilityScripts()}
  `;

  // JSON-LD structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Screenshot API',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    description: description,
    url: baseUrl || 'https://screenshot.dev',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with 100 screenshots per month',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Primary Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="keywords" content="screenshot api, website capture, thumbnail generator, pdf export, web scraping, website screenshot, api screenshot, url to image, webpage capture, browser automation">
  <meta name="author" content="Screenshot API">
  <meta name="robots" content="index, follow">
  <meta name="language" content="English">
  <meta name="revisit-after" content="7 days">

  <!-- Canonical URL -->
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${baseUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${baseUrl}${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Screenshot API">
  <meta property="og:locale" content="en_US">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${twitterHandle}">
  <meta name="twitter:creator" content="${twitterHandle}">
  <meta name="twitter:url" content="${baseUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${baseUrl}${ogImage}">

  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#0a0a0f">

  <!-- Preconnect to external resources for performance -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://fonts.googleapis.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">

  <!-- Fonts with display=swap for performance -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>

  <style>${styles}</style>
</head>
<body>
  <!-- Skip to Main Content Link for Accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${navbar}

  <main id="main-content" role="main">
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
      --transition-slow: 0.5s ease;

      /* Focus */
      --focus-ring: 0 0 0 3px rgba(99, 102, 241, 0.5);
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

    /* Respect reduced motion preference */
    @media (prefers-reduced-motion: reduce) {
      html {
        scroll-behavior: auto;
      }

      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
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

    /* Visually Hidden (for screen readers) */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
}

/**
 * Accessibility-specific styles
 */
function getAccessibilityStyles(): string {
  return `
    /* Skip Link */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--accent-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      z-index: 10000;
      font-weight: 600;
      border-radius: 0 0 8px 0;
      transition: top 0.3s ease;
    }

    .skip-link:focus {
      top: 0;
      outline: none;
    }

    /* Focus Styles */
    a:focus-visible,
    button:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    [tabindex]:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    /* Remove default focus for mouse users */
    :focus:not(:focus-visible) {
      outline: none;
    }

    /* Enhanced focus for interactive elements */
    .btn:focus-visible {
      box-shadow: var(--focus-ring);
      outline: none;
    }

    .card:focus-visible {
      box-shadow: var(--focus-ring);
      outline: none;
      border-color: var(--accent-primary);
    }

    /* Focus within for complex components */
    .nav-link:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 4px;
      border-radius: 4px;
    }

    /* High Contrast Mode Support */
    @media (prefers-contrast: high) {
      :root {
        --border-color: rgba(255, 255, 255, 0.3);
        --border-hover: rgba(255, 255, 255, 0.5);
      }

      .btn {
        border: 2px solid currentColor;
      }

      .card {
        border-width: 2px;
      }
    }

    /* Forced Colors Mode (Windows High Contrast) */
    @media (forced-colors: active) {
      .btn-primary {
        background: ButtonFace;
        color: ButtonText;
        border: 2px solid ButtonText;
      }

      .gradient-text {
        -webkit-text-fill-color: currentColor;
        background: none;
      }
    }
  `;
}

/**
 * Animation styles
 */
function getAnimationStyles(): string {
  return `
    /* Base Animation Keyframes */
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

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Animation Classes */
    .animate-fade-in-up {
      animation: fadeInUp 0.6s ease forwards;
    }

    .animate-fade-in-down {
      animation: fadeInDown 0.6s ease forwards;
    }

    .animate-fade-in-left {
      animation: fadeInLeft 0.6s ease forwards;
    }

    .animate-fade-in-right {
      animation: fadeInRight 0.6s ease forwards;
    }

    .animate-scale-in {
      animation: scaleIn 0.5s ease forwards;
    }

    .animate-float {
      animation: float 3s ease-in-out infinite;
    }

    .animate-pulse {
      animation: pulse 2s ease-in-out infinite;
    }

    .animate-bounce {
      animation: bounce 1s ease-in-out infinite;
    }

    /* Stagger Animation Delays */
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }
    .stagger-5 { animation-delay: 0.5s; }
    .stagger-6 { animation-delay: 0.6s; }

    /* Micro-interactions */

    /* Button Hover Effects */
    .btn {
      position: relative;
      overflow: hidden;
    }

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

    .btn:active {
      transform: scale(0.98);
    }

    /* Card Lift Effect */
    .card {
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
      will-change: transform;
    }

    .card:hover {
      transform: translateY(-8px);
      box-shadow:
        0 20px 40px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(99, 102, 241, 0.1);
    }

    /* Link Underline Animation */
    .link-animated {
      position: relative;
      display: inline-block;
    }

    .link-animated::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      transition: width 0.3s ease;
    }

    .link-animated:hover::after {
      width: 100%;
    }

    /* Icon Bounce on Hover */
    .icon-bounce:hover svg,
    .icon-bounce:hover i {
      animation: bounce 0.5s ease;
    }

    /* Glow on Hover */
    .glow-hover {
      transition: box-shadow 0.3s ease;
    }

    .glow-hover:hover {
      box-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
    }

    /* Parallax Container */
    .parallax-container {
      transform-style: preserve-3d;
      perspective: 1000px;
    }

    .parallax-layer {
      will-change: transform;
    }

    /* Reveal Animation Initial State */
    [data-animate] {
      opacity: 0;
    }

    [data-animate].is-visible {
      opacity: 1;
    }

    /* Stagger children animation */
    [data-stagger] > * {
      opacity: 0;
    }

    [data-stagger].is-visible > * {
      animation: fadeInUp 0.5s ease forwards;
    }

    [data-stagger].is-visible > *:nth-child(1) { animation-delay: 0.1s; }
    [data-stagger].is-visible > *:nth-child(2) { animation-delay: 0.2s; }
    [data-stagger].is-visible > *:nth-child(3) { animation-delay: 0.3s; }
    [data-stagger].is-visible > *:nth-child(4) { animation-delay: 0.4s; }
    [data-stagger].is-visible > *:nth-child(5) { animation-delay: 0.5s; }
    [data-stagger].is-visible > *:nth-child(6) { animation-delay: 0.6s; }
    [data-stagger].is-visible > *:nth-child(7) { animation-delay: 0.7s; }
    [data-stagger].is-visible > *:nth-child(8) { animation-delay: 0.8s; }
  `;
}

/**
 * Loading state styles
 */
function getLoadingStyles(): string {
  return `
    /* Skeleton Loading */
    .skeleton {
      background: linear-gradient(
        90deg,
        var(--bg-card) 25%,
        var(--bg-hover) 50%,
        var(--bg-card) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
    }

    .skeleton-text {
      height: 1em;
      margin-bottom: 0.5em;
      border-radius: 4px;
    }

    .skeleton-text.short {
      width: 60%;
    }

    .skeleton-text.medium {
      width: 80%;
    }

    .skeleton-title {
      height: 2em;
      width: 70%;
      margin-bottom: 1em;
    }

    .skeleton-image {
      aspect-ratio: 16/9;
      width: 100%;
    }

    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    /* Button Loading Spinner */
    .btn-loading {
      position: relative;
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
      animation: spin 0.8s linear infinite;
    }

    /* Image Lazy Load */
    .lazy-image {
      opacity: 0;
      transition: opacity 0.5s ease;
    }

    .lazy-image.loaded {
      opacity: 1;
    }

    /* Content Loading Placeholder */
    .loading-placeholder {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem;
    }

    /* Progress Bar */
    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--bg-card);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    /* Spinner */
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border-color);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .spinner-sm {
      width: 20px;
      height: 20px;
      border-width: 2px;
    }

    .spinner-lg {
      width: 60px;
      height: 60px;
      border-width: 4px;
    }
  `;
}

/**
 * Mobile optimization styles
 * Phase 9: Mobile responsive breakpoints, touch optimizations, and layout fixes
 */
function getMobileStyles(): string {
  return `
    /* ===========================================
       MOBILE OPTIMIZATION STYLES - Phase 9
       =========================================== */

    /* Touch Target Sizes - Minimum 44px for accessibility */
    @media (pointer: coarse) {
      .btn,
      .nav-link,
      .social-link,
      .code-tab,
      .carousel-btn,
      .carousel-dot,
      .faq-question,
      .toggle-switch,
      .newsletter-btn,
      .copy-button {
        min-height: 44px;
        min-width: 44px;
      }

      /* Increase spacing for touch targets */
      .nav-links {
        gap: 0.5rem;
      }

      .footer-links li {
        padding: 0.5rem 0;
      }

      .footer-links a {
        padding: 0.25rem 0;
        display: block;
      }
    }

    /* Prevent text size adjustment on orientation change (iOS) */
    html {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
    }

    /* Prevent pull-to-refresh on mobile */
    body {
      overscroll-behavior-y: none;
    }

    /* Improve tap highlight on mobile */
    * {
      -webkit-tap-highlight-color: rgba(99, 102, 241, 0.2);
    }

    /* =====================
       BREAKPOINT: TABLET
       640px - 1024px
       ===================== */
    @media (min-width: 640px) and (max-width: 1024px) {
      :root {
        --section-padding: 4rem 1.5rem;
      }

      .container {
        padding: 0 2rem;
      }

      /* Hero adjustments for tablet */
      .hero-title {
        font-size: clamp(2.5rem, 6vw, 3.5rem);
      }

      .hero-buttons {
        flex-direction: row;
        justify-content: center;
      }

      /* Features grid - 2 columns on tablet */
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }

      /* Pricing grid - 2x2 on tablet */
      .pricing-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }

      /* Stats grid - 2x2 on tablet */
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }

      /* Code demo side by side on larger tablets */
      .code-demo-layout {
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }
    }

    /* =====================
       BREAKPOINT: MOBILE
       < 640px
       ===================== */
    @media (max-width: 639px) {
      :root {
        --section-padding: 3rem 1rem;
      }

      .container {
        padding: 0 1rem;
      }

      /* Section headers */
      .section-header {
        margin-bottom: 2.5rem;
      }

      .section-title {
        font-size: 1.75rem;
        line-height: 1.3;
      }

      .section-description {
        font-size: 1rem;
      }

      /* Hero mobile */
      .hero-title {
        font-size: 2rem;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 1rem;
        padding: 0;
      }

      .hero-buttons {
        flex-direction: column;
        width: 100%;
        gap: 0.75rem;
      }

      .hero-buttons .btn {
        width: 100%;
        justify-content: center;
      }

      /* Buttons full width on mobile */
      .btn-lg {
        padding: 1rem 1.5rem;
        font-size: 1rem;
      }

      /* Feature cards */
      .feature-card {
        padding: 1.25rem;
      }

      .feature-icon {
        width: 48px;
        height: 48px;
      }

      .feature-title {
        font-size: 1rem;
      }

      .feature-description {
        font-size: 0.875rem;
      }

      /* Detailed features stacked */
      .detailed-features-grid {
        gap: 1.25rem;
      }

      .detailed-feature {
        padding: 1.5rem;
      }

      /* Code demo */
      .code-demo-layout {
        gap: 1.5rem;
      }

      .code-editor-chrome {
        padding: 0.75rem;
      }

      .code-tab {
        padding: 0.75rem 1rem;
        font-size: 0.8125rem;
      }

      .code-tab-name {
        display: none;
      }

      .code-tab-icon {
        width: 20px;
        height: 20px;
      }

      .code-panel pre {
        font-size: 0.6875rem;
        padding: 0.875rem;
      }

      .line-numbers {
        padding-left: 0.625rem;
        padding-right: 0.625rem;
        min-width: 35px;
      }

      .line-numbers span {
        font-size: 0.6875rem;
      }

      /* Pricing cards */
      .pricing-card {
        padding: 1.5rem;
      }

      .pricing-amount {
        font-size: 2.25rem;
      }

      .pricing-features li {
        font-size: 0.8125rem;
        padding: 0.375rem 0;
      }

      /* Testimonials */
      .testimonial-card {
        padding: 1.25rem;
      }

      .testimonial-quote p {
        font-size: 0.9375rem;
        line-height: 1.7;
      }

      .testimonial-avatar {
        width: 48px;
        height: 48px;
      }

      .testimonial-name {
        font-size: 1rem;
      }

      .testimonial-role {
        font-size: 0.8125rem;
      }

      /* Carousel navigation */
      .carousel-nav {
        gap: 0.75rem;
      }

      .carousel-btn {
        width: 40px;
        height: 40px;
      }

      /* Stats */
      .stat-card {
        padding: 1.25rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .stat-label {
        font-size: 0.8125rem;
      }

      /* CTA */
      .cta-section {
        padding: 4rem 1rem;
      }

      .cta-title {
        font-size: 1.75rem;
      }

      .cta-description {
        font-size: 1rem;
      }

      .cta-buttons {
        flex-direction: column;
        gap: 0.75rem;
      }

      .cta-buttons .btn {
        width: 100%;
        max-width: 100%;
      }

      .cta-trust {
        flex-direction: column;
        gap: 0.75rem;
        align-items: center;
      }

      /* Footer */
      .footer-newsletter {
        padding: 1.5rem;
        margin-bottom: 2rem;
        transform: translateY(-30%);
      }

      .newsletter-title {
        font-size: 1.25rem;
      }

      .newsletter-description {
        font-size: 0.875rem;
      }

      .newsletter-input {
        padding: 0.75rem 0.75rem 0.75rem 2.75rem;
      }

      .newsletter-btn {
        padding: 0.75rem 1.25rem;
      }

      .footer-brand {
        max-width: 100%;
        text-align: center;
      }

      .footer-social {
        justify-content: center;
      }

      .footer-column-title {
        margin-bottom: 1rem;
      }

      .footer-badges {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
    }

    /* =====================
       BREAKPOINT: SMALL MOBILE
       < 375px (iPhone SE)
       ===================== */
    @media (max-width: 374px) {
      :root {
        --section-padding: 2.5rem 0.75rem;
      }

      .container {
        padding: 0 0.75rem;
      }

      .hero-title {
        font-size: 1.625rem;
      }

      .section-title {
        font-size: 1.5rem;
      }

      .btn {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
      }

      .pricing-card {
        padding: 1.25rem;
      }

      .pricing-amount {
        font-size: 2rem;
      }

      .code-panel pre {
        font-size: 0.625rem;
      }

      .testimonial-quote p {
        font-size: 0.875rem;
      }

      .cta-title {
        font-size: 1.5rem;
      }
    }

    /* =====================
       TOUCH OPTIMIZATIONS
       ===================== */

    /* Disable hover effects on touch devices */
    @media (hover: none) {
      .btn:hover::after {
        width: 0;
        height: 0;
      }

      .card:hover {
        transform: none;
        box-shadow: none;
      }

      .feature-card:hover {
        transform: none;
      }

      .feature-card:hover .feature-card-glow {
        opacity: 0;
      }

      .pricing-card:hover {
        transform: none;
      }

      .pricing-card-highlighted:hover {
        transform: scale(1.02);
      }

      .nav-link:hover {
        color: var(--text-primary);
      }

      .nav-link::after {
        display: none;
      }

      /* Keep active/focus states for touch feedback */
      .btn:active {
        transform: scale(0.97);
        opacity: 0.9;
      }

      .card:active {
        transform: translateY(-4px);
      }

      .feature-card:active {
        transform: translateY(-4px);
      }
    }

    /* Touch-friendly carousel swipe */
    .carousel-container {
      touch-action: pan-y pinch-zoom;
    }

    .carousel-track {
      touch-action: pan-x;
      -webkit-overflow-scrolling: touch;
    }

    /* Smooth momentum scrolling for code blocks on iOS */
    .code-editor-content,
    .response-body {
      -webkit-overflow-scrolling: touch;
      overflow-y: auto;
    }

    /* =====================
       LAYOUT FIXES
       ===================== */

    /* Prevent horizontal scroll */
    html, body {
      overflow-x: hidden;
      max-width: 100vw;
    }

    /* Prevent image overflow */
    img {
      max-width: 100%;
      height: auto;
    }

    /* Text overflow handling */
    .hero-title,
    .section-title,
    .feature-title,
    .pricing-name,
    .testimonial-name {
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
    }

    /* Long URLs/code in testimonials */
    .testimonial-quote p {
      word-break: break-word;
    }

    /* Pricing badge positioning fix on mobile */
    @media (max-width: 640px) {
      .pricing-card-highlighted {
        transform: none;
        margin-top: 0.75rem;
      }

      .pricing-badge {
        top: -10px;
      }
    }

    /* Company logos scroll fix */
    @media (max-width: 768px) {
      .company-logos-scroll {
        animation-duration: 20s;
      }
    }

    /* FAQ accordion padding fix */
    @media (max-width: 640px) {
      .faq-question {
        padding: 1rem;
        text-align: left;
      }

      .faq-answer p {
        padding: 0 1rem 1rem;
      }
    }

    /* Safe area insets for notched devices */
    @supports (padding: env(safe-area-inset-bottom)) {
      .footer {
        padding-bottom: calc(2rem + env(safe-area-inset-bottom));
      }

      .nav-mobile-menu {
        padding-bottom: env(safe-area-inset-bottom);
      }

      .cta-section {
        padding-bottom: calc(4rem + env(safe-area-inset-bottom));
      }
    }

    /* Landscape mode adjustments */
    @media (max-height: 500px) and (orientation: landscape) {
      .hero-section {
        min-height: auto;
        padding: 5rem 1.5rem 3rem;
      }

      .nav-mobile-menu {
        padding-top: 4rem;
      }
    }

    /* High DPI displays */
    @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
      .code-panel pre,
      .line-numbers span {
        font-weight: 400;
      }
    }
  `;
}

/**
 * Base scripts for the landing page
 */
function getBaseScripts(): string {
  return `
    // Smooth scroll for anchor links with offset for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update focus for accessibility
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  `;
}

/**
 * Animation scripts
 */
function getAnimationScripts(): string {
  return `
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Intersection Observer for scroll reveal animations
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');

            // Get animation type from data attribute
            const animationType = entry.target.dataset.animate || 'fade-in-up';
            entry.target.classList.add('animate-' + animationType);

            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      // Observe elements with data-animate attribute
      document.querySelectorAll('[data-animate]').forEach(el => {
        revealObserver.observe(el);
      });

      // Stagger animation observer
      const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            staggerObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      // Observe stagger containers
      document.querySelectorAll('[data-stagger]').forEach(el => {
        staggerObserver.observe(el);
      });

      // Parallax effect for hero background
      let ticking = false;
      const parallaxElements = document.querySelectorAll('.parallax-layer');

      if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
          if (!ticking) {
            window.requestAnimationFrame(() => {
              const scrolled = window.pageYOffset;
              parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.speed || '0.5');
                const yPos = -(scrolled * speed);
                el.style.transform = 'translate3d(0, ' + yPos + 'px, 0)';
              });
              ticking = false;
            });
            ticking = true;
          }
        });
      }
    } else {
      // Make all elements visible immediately for reduced motion
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '1';
        el.classList.add('is-visible');
      });

      document.querySelectorAll('[data-stagger] > *').forEach(el => {
        el.style.opacity = '1';
      });
    }

    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px'
      });

      document.querySelectorAll('img[data-src], img.lazy-image').forEach(img => {
        imageObserver.observe(img);
      });
    }
  `;
}

/**
 * Accessibility scripts
 */
function getAccessibilityScripts(): string {
  return `
    // Keyboard navigation enhancements
    document.addEventListener('keydown', (e) => {
      // Escape key closes modals/dropdowns
      if (e.key === 'Escape') {
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu.open');
        if (mobileMenu) {
          mobileMenu.classList.remove('open');
          document.body.classList.remove('menu-open');
        }

        // Close any open dropdowns
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });

    // Focus trap for modals
    function trapFocus(element) {
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      });
    }

    // Add aria-current to active nav links
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.setAttribute('aria-current', 'page');
      }
    });

    // Handle focus visibility for keyboard users only
    document.body.addEventListener('mousedown', () => {
      document.body.classList.add('using-mouse');
    });

    document.body.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.remove('using-mouse');
      }
    });

    // Announce dynamic content changes to screen readers
    function announceToScreenReader(message) {
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }

    // Make announceToScreenReader globally available
    window.announceToScreenReader = announceToScreenReader;
  `;
}

export default generateLandingPage;
