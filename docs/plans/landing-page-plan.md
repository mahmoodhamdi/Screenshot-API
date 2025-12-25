# Landing Page - Implementation Plan

## Overview

إنشاء صفحة Landing Page احترافية وجذابة لـ Screenshot API تكون production-ready مع تصميم حديث و Dark Mode.

---

## Phase 1: Project Setup & Base Structure

### الهدف
إعداد البنية الأساسية للـ Landing Page وإنشاء الملفات المطلوبة.

### المهام
1. إنشاء مجلد `src/views/` للـ templates
2. إنشاء ملف `src/views/landing.ts` للـ Landing Page generator
3. إنشاء route جديد `/` للـ Landing Page
4. تحديث الـ CSP للسماح بالموارد الخارجية

### الملفات
```
src/
└── views/
    └── landing/
        ├── index.ts          # Main landing page generator
        ├── sections/         # Page sections
        │   ├── hero.ts
        │   ├── features.ts
        │   ├── pricing.ts
        │   ├── code-demo.ts
        │   ├── testimonials.ts
        │   └── footer.ts
        └── components/
            ├── navbar.ts
            ├── button.ts
            └── card.ts
```

### Prompt for Phase 1
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 1: Project Setup & Base Structure

Tasks:
1. Create the folder structure under src/views/landing/
2. Create index.ts that exports a function generateLandingPage() returning HTML string
3. Create basic component files (navbar.ts, button.ts, card.ts) with TypeScript functions
4. Update app.ts to serve the landing page at "/" route (replace the current JSON response)
5. Ensure CSP allows all required external resources

Requirements:
- Use TypeScript for all files
- Export functions that return HTML strings
- Use template literals for HTML generation
- Follow existing code style in the project

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test by accessing http://localhost:3000/
- Create commit: "feat(landing): setup base structure for landing page"
- Push to remote
```

---

## Phase 2: Hero Section & Navigation

### الهدف
إنشاء Hero Section جذاب مع Navigation Bar احترافي.

### التصميم
- **Navbar**: Logo, Links (Features, Pricing, Docs, API), CTA buttons (Login, Get Started)
- **Hero**:
  - Headline: "Capture Any Website in Seconds"
  - Subheadline: وصف قصير للـ API
  - CTA Buttons: "Start Free" و "View Documentation"
  - Hero Image/Animation: Screenshot preview mockup
  - Trust badges: "10K+ Screenshots Daily", "99.9% Uptime", "< 2s Response"

### الألوان (Dark Theme)
```css
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #1a1a24;
--accent-primary: #6366f1;    /* Indigo */
--accent-secondary: #8b5cf6;  /* Purple */
--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--border-color: #2a2a3a;
```

### Prompt for Phase 2
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 2: Hero Section & Navigation

Tasks:
1. Create src/views/landing/components/navbar.ts with:
   - Sticky navigation bar
   - Logo (Screenshot API with camera icon)
   - Navigation links: Features, Pricing, Docs, Developer
   - Auth buttons: Login, Get Started (gradient button)
   - Mobile hamburger menu (responsive)

2. Create src/views/landing/sections/hero.ts with:
   - Large headline with gradient text
   - Compelling subheadline
   - Two CTA buttons (primary gradient, secondary outline)
   - Animated screenshot mockup/preview
   - Trust badges row (screenshots count, uptime, speed)
   - Subtle background gradient/pattern

3. Update src/views/landing/index.ts to include navbar and hero

4. Add smooth scroll behavior and hover animations

Design Requirements:
- Dark theme with indigo/purple accent colors
- Responsive design (mobile-first)
- Smooth animations on scroll and hover
- Professional SaaS landing page style
- Use CSS Grid/Flexbox for layout

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test on http://localhost:3000/ (check mobile and desktop)
- Create commit: "feat(landing): add hero section and navigation"
- Push to remote
```

---

## Phase 3: Features Section

### الهدف
عرض مميزات الـ API بطريقة جذابة ومنظمة.

### المميزات الرئيسية (6 features في grid)
1. **High Resolution** - Up to 8K screenshots
2. **Multiple Formats** - PNG, JPEG, WebP, PDF
3. **Full Page Capture** - Capture entire scrollable pages
4. **Dark Mode** - Automatic dark mode detection
5. **Ad Blocking** - Remove ads from screenshots
6. **Custom Viewport** - Any width/height configuration

### المميزات المتقدمة (3 features مع تفاصيل)
1. **Developer Friendly**
   - RESTful API
   - Multiple SDKs
   - Comprehensive docs

2. **Enterprise Ready**
   - 99.9% SLA
   - IP Whitelisting
   - Dedicated support

3. **Scalable Infrastructure**
   - Auto-scaling
   - Global CDN
   - Redis caching

### Prompt for Phase 3
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 3: Features Section

Tasks:
1. Create src/views/landing/sections/features.ts with:

   Section 1 - Feature Grid (6 cards):
   - Icon (use emoji or Font Awesome)
   - Title
   - Short description
   - Hover animation (lift + glow)

   Section 2 - Detailed Features (3 columns):
   - Large icon
   - Title
   - Description paragraph
   - Feature list with checkmarks

2. Add scroll reveal animations (fade-in on scroll)

3. Update index.ts to include features section

Design Requirements:
- Use CSS Grid for responsive layout
- Cards with subtle border and hover effects
- Icons with gradient background circles
- Consistent spacing and typography
- Section header with badge + title + description

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test responsiveness on all screen sizes
- Create commit: "feat(landing): add features section with animations"
- Push to remote
```

---

## Phase 4: Live Code Demo Section

### الهدف
عرض كود تفاعلي يوضح سهولة استخدام الـ API.

### المكونات
- **Code Editor** (fake) مع syntax highlighting
- **Language Tabs**: cURL, Node.js, Python, PHP
- **Response Preview**: JSON response مع animation
- **Try it Button**: يفتح الـ Developer Portal

### Prompt for Phase 4
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 4: Live Code Demo Section

Tasks:
1. Create src/views/landing/sections/code-demo.ts with:

   Left Side - Code Editor:
   - Window chrome (red/yellow/green dots)
   - Language tabs (cURL, Node.js, Python, PHP)
   - Syntax highlighted code using Prism.js
   - Copy button with feedback
   - Line numbers

   Right Side - Response Preview:
   - Animated typing effect for JSON response
   - Success status indicator
   - Screenshot thumbnail preview
   - Response time badge

2. Add tab switching functionality (vanilla JS)

3. Add typing animation for response

4. Update index.ts to include code-demo section

Design Requirements:
- Terminal/editor style dark theme
- Smooth tab transitions
- Code highlighting colors matching theme
- Responsive: stack vertically on mobile

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test tab switching and copy functionality
- Create commit: "feat(landing): add interactive code demo section"
- Push to remote
```

---

## Phase 5: Pricing Section

### الهدف
عرض خطط الأسعار بشكل واضح وجذاب.

### الخطط
| Plan | Price | Screenshots | Rate Limit | Features |
|------|-------|-------------|------------|----------|
| Free | $0 | 100/mo | 10/min | Basic features |
| Starter | $19/mo | 2,000/mo | 30/min | + WebP, Full Page |
| Pro | $49/mo | 10,000/mo | 100/min | + PDF, Webhooks |
| Enterprise | $149/mo | 50,000/mo | 500/min | All features |

### Prompt for Phase 5
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 5: Pricing Section

Tasks:
1. Create src/views/landing/sections/pricing.ts with:

   - Section header with toggle (Monthly/Yearly with discount badge)
   - 4 pricing cards in a row:

     Free Card:
     - Price: $0/forever
     - Features list with check/x icons
     - "Get Started" button (outline)

     Starter Card:
     - Price: $19/mo
     - Features list
     - "Start Free Trial" button

     Pro Card (POPULAR badge):
     - Highlighted with gradient border
     - Price: $49/mo
     - Features list
     - "Start Free Trial" button (gradient)

     Enterprise Card:
     - Price: $149/mo
     - Features list
     - "Contact Sales" button

   - FAQ accordion below pricing cards (5 common questions)

2. Add price toggle animation (monthly/yearly)

3. Update index.ts to include pricing section

Design Requirements:
- Popular plan should stand out
- Yearly prices show 20% discount
- Feature comparison should be clear
- Responsive: 2x2 grid on tablet, stack on mobile
- FAQ with smooth expand/collapse

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test pricing toggle and FAQ accordion
- Create commit: "feat(landing): add pricing section with plans and FAQ"
- Push to remote
```

---

## Phase 6: Testimonials & Social Proof

### الهدف
بناء الثقة من خلال شهادات العملاء والأرقام.

### المكونات
- **Stats Bar**: 10K+ Users, 1M+ Screenshots, 99.9% Uptime, <2s Average
- **Testimonials Carousel**: 3-5 fake testimonials
- **Company Logos**: Placeholder logos (Using companies that...)

### Prompt for Phase 6
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 6: Testimonials & Social Proof

Tasks:
1. Create src/views/landing/sections/testimonials.ts with:

   Stats Section:
   - 4 large stats in a row with icons
   - Animated counting effect on scroll
   - "10,000+", "1M+", "99.9%", "<2s"

   Testimonials Carousel:
   - 4 testimonial cards
   - Profile image (use placeholder avatars)
   - Quote text
   - Name, title, company
   - Star rating (5 stars)
   - Navigation dots
   - Auto-play with pause on hover

   Company Logos Section:
   - "Trusted by developers at" heading
   - 6 placeholder company logos (gray/muted)
   - Subtle infinite scroll animation

2. Add intersection observer for stats animation

3. Add carousel auto-play functionality

4. Update index.ts to include testimonials section

Design Requirements:
- Stats should animate when scrolled into view
- Testimonials with subtle card elevation
- Smooth carousel transitions
- Logos should be grayscale with hover color

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test animations and carousel
- Create commit: "feat(landing): add testimonials and social proof section"
- Push to remote
```

---

## Phase 7: CTA Section & Footer

### الهدف
إنشاء Call-to-Action قوي و Footer شامل.

### CTA Section
- Background gradient
- "Ready to get started?" headline
- Two buttons: Start Free, Contact Sales
- No credit card required badge

### Footer
- Logo and description
- Links: Product, Resources, Company, Legal
- Social links
- Newsletter signup
- Copyright

### Prompt for Phase 7
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 7: CTA Section & Footer

Tasks:
1. Create src/views/landing/sections/cta.ts with:
   - Full-width gradient background
   - Large headline: "Ready to capture the web?"
   - Subheadline: "Start for free. No credit card required."
   - Two CTA buttons side by side
   - Decorative background elements (circles/dots)

2. Create src/views/landing/sections/footer.ts with:

   Main Footer:
   - Logo + short description
   - 4 link columns:
     * Product: Features, Pricing, API, Changelog
     * Resources: Documentation, Developer Portal, SDKs, Status
     * Company: About, Blog, Careers, Contact
     * Legal: Privacy, Terms, Security, GDPR
   - Social icons: GitHub, Twitter, Discord, LinkedIn

   Bottom Footer:
   - Copyright notice
   - Made with ❤️ by Mahmood Hamdi
   - API version badge

3. Add newsletter signup form (email input + button)

4. Update index.ts to include CTA and footer

Design Requirements:
- CTA should have strong visual impact
- Footer links organized in clear columns
- Social icons with hover effects
- Newsletter form with validation styling
- Responsive layout

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test all links and form validation
- Create commit: "feat(landing): add CTA section and comprehensive footer"
- Push to remote
```

---

## Phase 8: Animations & Polish

### الهدف
إضافة animations احترافية و polish نهائي.

### Prompt for Phase 8
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 8: Animations & Polish

Tasks:
1. Add scroll reveal animations:
   - Fade in from bottom for sections
   - Stagger animation for grid items
   - Parallax effect for hero background

2. Add micro-interactions:
   - Button hover effects (scale, glow)
   - Card hover effects (lift, shadow)
   - Link underline animations
   - Icon bounce on hover

3. Add loading states:
   - Skeleton loading for images
   - Button loading spinners

4. Performance optimizations:
   - Lazy load images
   - Minimize inline CSS
   - Add preconnect for external resources

5. Accessibility improvements:
   - ARIA labels
   - Focus states
   - Keyboard navigation
   - Skip to content link

6. SEO meta tags:
   - Title, description, keywords
   - Open Graph tags
   - Twitter cards
   - Canonical URL

Design Requirements:
- Animations should be subtle and smooth
- 60fps animations (use transform/opacity)
- Respect prefers-reduced-motion
- All interactive elements have focus states

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test with Lighthouse (aim for 90+ scores)
- Test keyboard navigation
- Create commit: "feat(landing): add animations and accessibility improvements"
- Push to remote
```

---

## Phase 9: Mobile Optimization & Testing

### الهدف
التأكد من أن الصفحة تعمل بشكل مثالي على جميع الأجهزة.

### Prompt for Phase 9
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 9: Mobile Optimization & Testing

Tasks:
1. Mobile Navigation:
   - Hamburger menu icon
   - Full-screen mobile menu overlay
   - Smooth open/close animation
   - Close on link click

2. Responsive breakpoints:
   - Mobile: < 640px
   - Tablet: 640px - 1024px
   - Desktop: > 1024px

3. Touch optimizations:
   - Larger touch targets (44px minimum)
   - Swipe gestures for carousel
   - No hover-dependent functionality

4. Test on:
   - iPhone SE (small)
   - iPhone 14 (medium)
   - iPad (tablet)
   - Desktop (various widths)

5. Fix any layout issues:
   - Text overflow
   - Image sizing
   - Spacing consistency
   - Button sizes

6. Add viewport meta tag and mobile-specific styles

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test on real mobile device or emulator
- Take screenshots of all breakpoints
- Create commit: "feat(landing): optimize for mobile and tablet devices"
- Push to remote
```

---

## Phase 10: Integration & Final Testing

### الهدف
دمج كل شيء والتأكد من أن الصفحة production-ready.

### Prompt for Phase 10
```
Read the file: D:\Screenshot-API\docs\plans\landing-page-plan.md

Execute Phase 10: Integration & Final Testing

Tasks:
1. Integration tests:
   - Create tests/integration/landing.test.ts
   - Test all routes return 200
   - Test HTML structure
   - Test meta tags present

2. Cross-browser testing:
   - Chrome
   - Firefox
   - Safari
   - Edge

3. Performance testing:
   - Run Lighthouse audit
   - Check Core Web Vitals
   - Optimize any issues found

4. Final checklist:
   - [ ] All links work
   - [ ] All images load
   - [ ] Forms validate correctly
   - [ ] Animations smooth
   - [ ] Mobile menu works
   - [ ] Carousel works
   - [ ] Copy buttons work
   - [ ] No console errors
   - [ ] SEO tags complete
   - [ ] Accessibility score > 90

5. Update CLAUDE.md with landing page info

6. Update README.md with screenshots

After completion:
- Run npm test
- Run npm run build
- Test production build locally
- Create commit: "feat(landing): complete landing page implementation"
- Push to remote
- Create a summary of what was built
```

---

## File Structure Summary

```
src/
└── views/
    └── landing/
        ├── index.ts              # Main page generator
        ├── styles.ts             # CSS styles
        ├── scripts.ts            # JavaScript code
        ├── sections/
        │   ├── hero.ts           # Hero section
        │   ├── features.ts       # Features grid
        │   ├── code-demo.ts      # Interactive code demo
        │   ├── pricing.ts        # Pricing plans
        │   ├── testimonials.ts   # Social proof
        │   ├── cta.ts            # Call to action
        │   └── footer.ts         # Footer
        └── components/
            ├── navbar.ts         # Navigation bar
            ├── button.ts         # Button component
            ├── card.ts           # Card component
            └── icons.ts          # SVG icons
```

---

## Design System

### Typography
```css
--font-family: 'Inter', -apple-system, sans-serif;
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;   /* 60px */
```

### Spacing
```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
--spacing-20: 5rem;     /* 80px */
--spacing-24: 6rem;     /* 96px */
```

### Colors
```css
/* Background */
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #1a1a24;
--bg-hover: #242430;

/* Accent */
--accent-primary: #6366f1;
--accent-secondary: #8b5cf6;
--accent-success: #10b981;
--accent-warning: #f59e0b;
--accent-error: #ef4444;

/* Text */
--text-primary: #ffffff;
--text-secondary: #94a3b8;
--text-muted: #64748b;

/* Border */
--border-color: #2a2a3a;
--border-hover: #3a3a4a;
```

---

## Success Criteria

- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] Mobile responsive (all breakpoints)
- [ ] All animations smooth (60fps)
- [ ] No console errors
- [ ] All tests passing
- [ ] Cross-browser compatible
