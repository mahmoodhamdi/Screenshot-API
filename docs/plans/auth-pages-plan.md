# Auth Pages Plan

## Overview

إنشاء صفحات Authentication كاملة (Register, Login, Forgot Password, Reset Password, Email Verification) بنفس تصميم Landing Page.

---

## File Structure

```
src/views/auth/
├── index.ts              # Auth pages generator & shared styles
├── pages/
│   ├── login.ts          # Login page
│   ├── register.ts       # Register page
│   ├── forgot-password.ts # Forgot password page
│   ├── reset-password.ts  # Reset password page
│   └── verify-email.ts    # Email verification page
└── components/
    ├── auth-layout.ts    # Shared auth layout
    ├── form-input.ts     # Form input component
    ├── form-button.ts    # Form button component
    ├── social-auth.ts    # Social login buttons (optional)
    └── auth-card.ts      # Auth card wrapper
```

---

## Phase 1: Setup Auth Views Structure

### Prompt for Phase 1
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 1: Setup Auth Views Structure

Tasks:
1. Create folder structure: src/views/auth/pages/ and src/views/auth/components/

2. Create src/views/auth/index.ts with:
   - Export function generateAuthPage(page: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email')
   - Shared auth styles (same dark theme as landing page)
   - Base HTML template with meta tags

3. Create src/views/auth/components/auth-layout.ts with:
   - Split layout: left side branding, right side form
   - Responsive: full width on mobile
   - Background gradient matching landing page
   - Logo and tagline on left side
   - Animated decorative elements

4. Create src/views/auth/components/form-input.ts with:
   - Input component with label, icon, error state
   - Support for text, email, password types
   - Show/hide password toggle
   - Validation error display
   - Focus and hover states

5. Create src/views/auth/components/form-button.ts with:
   - Primary button (gradient)
   - Secondary button (outline)
   - Loading state with spinner
   - Disabled state

6. Create src/views/auth/components/auth-card.ts with:
   - Card wrapper with glassmorphism effect
   - Title and subtitle
   - Form container
   - Footer links

7. Update src/app.ts to add routes:
   - GET /login -> login page
   - GET /register -> register page
   - GET /forgot-password -> forgot password page
   - GET /reset-password -> reset password page (with token query param)
   - GET /verify-email -> email verification page (with token query param)

Design Requirements:
- Dark theme matching landing page (#0a0a0f background)
- Indigo/purple accent colors
- Glassmorphism card effect
- Smooth animations
- Mobile responsive
- Accessible (ARIA labels, focus states)

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test routes return 200
- Create commit: "feat(auth): setup auth pages structure"
- Push to remote
```

---

## Phase 2: Login Page

### Prompt for Phase 2
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 2: Login Page

Tasks:
1. Create src/views/auth/pages/login.ts with:

   Layout:
   - Left side: Logo, "Welcome Back" heading, tagline, decorative elements
   - Right side: Login form card

   Form Fields:
   - Email input with envelope icon
   - Password input with lock icon and show/hide toggle
   - "Remember me" checkbox
   - "Forgot password?" link

   Actions:
   - "Sign In" primary button (gradient)
   - "Don't have an account? Sign up" link
   - Optional: Social login buttons (Google, GitHub)

   Form Validation (client-side):
   - Email: required, valid email format
   - Password: required, min 8 characters
   - Show inline error messages
   - Disable submit while loading

   Form Submission:
   - POST to /api/v1/auth/login
   - Show loading spinner on button
   - On success: redirect to /dashboard (or store tokens and redirect)
   - On error: show error message (invalid credentials, account not found)

   JavaScript:
   - Form validation on submit
   - Password visibility toggle
   - Loading state management
   - Error message display
   - Success redirect

2. Update src/views/auth/index.ts to include login page

3. Add styles for login page:
   - Form animations (fade in)
   - Input focus effects
   - Button hover/active states
   - Error shake animation
   - Success checkmark animation

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test login page at http://localhost:3000/login
- Test form validation
- Test API integration
- Create commit: "feat(auth): add login page with form validation"
- Push to remote
```

---

## Phase 3: Register Page

### Prompt for Phase 3
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 3: Register Page

Tasks:
1. Create src/views/auth/pages/register.ts with:

   Layout:
   - Left side: Logo, "Create Account" heading, benefits list, decorative elements
   - Right side: Register form card

   Benefits List (left side):
   - "100 free screenshots/month"
   - "No credit card required"
   - "Cancel anytime"
   - Icons with checkmarks

   Form Fields:
   - Full name input with user icon
   - Email input with envelope icon
   - Password input with lock icon and strength indicator
   - Confirm password input
   - "I agree to Terms & Privacy Policy" checkbox with links

   Password Strength Indicator:
   - Weak (red): < 8 chars
   - Medium (yellow): 8+ chars, has number
   - Strong (green): 8+ chars, number, special char, uppercase

   Actions:
   - "Create Account" primary button
   - "Already have an account? Sign in" link
   - Optional: Social signup buttons

   Form Validation:
   - Name: required, min 2 characters
   - Email: required, valid format
   - Password: required, min 8 chars, must match strength requirements
   - Confirm password: must match password
   - Terms checkbox: required

   Form Submission:
   - POST to /api/v1/auth/register
   - Show loading spinner
   - On success: show success message, redirect to login or verify-email
   - On error: show specific error (email exists, weak password)

2. Update src/views/auth/index.ts to include register page

3. Add password strength indicator component

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test register page at http://localhost:3000/register
- Test password strength indicator
- Test form validation
- Create commit: "feat(auth): add register page with password strength"
- Push to remote
```

---

## Phase 4: Forgot Password Page

### Prompt for Phase 4
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 4: Forgot Password Page

Tasks:
1. Create src/views/auth/pages/forgot-password.ts with:

   Layout:
   - Centered card (no split layout)
   - "Forgot Password?" heading
   - Description text
   - Email form

   States:

   State 1 - Initial Form:
   - Icon: Lock with question mark
   - Heading: "Forgot your password?"
   - Description: "Enter your email and we'll send you a reset link"
   - Email input
   - "Send Reset Link" button
   - "Back to login" link

   State 2 - Email Sent (Success):
   - Icon: Envelope with checkmark (animated)
   - Heading: "Check your email"
   - Description: "We've sent a password reset link to [email]"
   - "Didn't receive it? Resend" link
   - "Back to login" link

   Form Validation:
   - Email: required, valid format

   Form Submission:
   - POST to /api/v1/auth/forgot-password
   - On success: switch to State 2
   - On error: show error message

   JavaScript:
   - State switching
   - Resend cooldown (60 seconds)
   - Email masking in success message (m***@example.com)

2. Update src/views/auth/index.ts to include forgot password page

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test page at http://localhost:3000/forgot-password
- Create commit: "feat(auth): add forgot password page"
- Push to remote
```

---

## Phase 5: Reset Password Page

### Prompt for Phase 5
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 5: Reset Password Page

Tasks:
1. Create src/views/auth/pages/reset-password.ts with:

   URL: /reset-password?token=xxx

   Layout:
   - Centered card
   - "Reset Password" heading
   - New password form

   States:

   State 1 - Token Validation:
   - Loading spinner
   - "Validating reset link..."

   State 2 - Valid Token (Form):
   - Icon: Lock with refresh
   - Heading: "Create new password"
   - New password input with strength indicator
   - Confirm password input
   - "Reset Password" button

   State 3 - Success:
   - Icon: Checkmark (animated)
   - Heading: "Password reset successful"
   - Description: "Your password has been updated"
   - "Sign in with new password" button

   State 4 - Invalid/Expired Token:
   - Icon: X mark (error)
   - Heading: "Invalid or expired link"
   - Description: "This reset link is no longer valid"
   - "Request new reset link" button

   Form Validation:
   - Password: min 8 chars, strength indicator
   - Confirm password: must match

   Form Submission:
   - POST to /api/v1/auth/reset-password with token and new password
   - On success: switch to State 3
   - On error: show error or switch to State 4

2. Update src/views/auth/index.ts to include reset password page

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test page at http://localhost:3000/reset-password?token=test
- Create commit: "feat(auth): add reset password page"
- Push to remote
```

---

## Phase 6: Email Verification Page

### Prompt for Phase 6
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 6: Email Verification Page

Tasks:
1. Create src/views/auth/pages/verify-email.ts with:

   URL: /verify-email?token=xxx

   States:

   State 1 - Verifying:
   - Loading spinner (animated)
   - "Verifying your email..."

   State 2 - Success:
   - Icon: Checkmark with email (animated confetti optional)
   - Heading: "Email Verified!"
   - Description: "Your email has been successfully verified"
   - "Continue to Dashboard" button

   State 3 - Already Verified:
   - Icon: Checkmark
   - Heading: "Already Verified"
   - Description: "This email has already been verified"
   - "Go to Dashboard" button

   State 4 - Invalid/Expired Token:
   - Icon: X mark
   - Heading: "Verification Failed"
   - Description: "This verification link is invalid or expired"
   - "Resend verification email" button
   - Email input for resend

   JavaScript:
   - Auto-verify on page load if token present
   - POST to /api/v1/auth/verify-email with token
   - Handle different response states

2. Update src/views/auth/index.ts to include verify email page

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test page at http://localhost:3000/verify-email?token=test
- Create commit: "feat(auth): add email verification page"
- Push to remote
```

---

## Phase 7: Integration Tests

### Prompt for Phase 7
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 7: Integration Tests

Tasks:
1. Create tests/integration/auth-pages.test.ts with:

   Test Cases:
   - GET /login returns 200 and HTML
   - GET /register returns 200 and HTML
   - GET /forgot-password returns 200 and HTML
   - GET /reset-password returns 200 and HTML
   - GET /verify-email returns 200 and HTML

   HTML Structure Tests:
   - Login page contains email and password inputs
   - Register page contains name, email, password inputs
   - All pages contain form elements
   - All pages have proper meta tags
   - All pages have accessible labels

   JavaScript Tests (if applicable):
   - Form validation works
   - Password visibility toggle works
   - Password strength indicator works

2. Run all tests and fix any issues

After completion:
- Run npm test
- Run npm run build
- Create commit: "test(auth): add auth pages integration tests"
- Push to remote
```

---

## Phase 8: Final Polish

### Prompt for Phase 8
```
Read the file: D:\Screenshot-API\docs\plans\auth-pages-plan.md

Execute Phase 8: Final Polish

Tasks:
1. Add transitions between pages:
   - Fade in/out on navigation
   - Smooth form state transitions

2. Add error handling:
   - Network error messages
   - Server error handling
   - Retry mechanisms

3. Add accessibility:
   - Screen reader labels
   - Keyboard navigation
   - Focus management
   - Error announcements

4. Add SEO:
   - Page titles
   - Meta descriptions
   - Canonical URLs

5. Add security:
   - CSRF token (if needed)
   - Rate limiting messages
   - Secure password input (prevent autocomplete on confirm)

6. Update navigation:
   - Add auth links to landing page navbar
   - Update login/register buttons to point to new pages

7. Update CLAUDE.md with auth pages documentation

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Run npm test
- Run npm run build
- Test all auth flows manually
- Create commit: "feat(auth): complete auth pages with polish"
- Push to remote
```

---

## Success Criteria

- [ ] Login page works with form validation and API integration
- [ ] Register page works with password strength indicator
- [ ] Forgot password page sends reset emails
- [ ] Reset password page validates tokens and updates passwords
- [ ] Email verification page verifies tokens
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] All pages are accessible (WCAG 2.1)
- [ ] All pages have proper SEO tags
- [ ] All tests pass
- [ ] Build succeeds

---

## Design Specifications

### Colors (same as landing page)
```css
--bg-primary: #0a0a0f
--bg-secondary: #12121a
--bg-card: #1a1a24
--accent-primary: #6366f1
--accent-secondary: #8b5cf6
--text-primary: #ffffff
--text-secondary: #94a3b8
--success: #10b981
--error: #ef4444
--warning: #f59e0b
```

### Typography
```css
--font-sans: 'Inter', sans-serif
--font-mono: 'JetBrains Mono', monospace
```

### Card Style
```css
background: rgba(26, 26, 36, 0.8)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.1)
border-radius: 16px
```

### Input Style
```css
background: var(--bg-secondary)
border: 1px solid var(--border-color)
border-radius: 10px
padding: 0.875rem 1rem
color: var(--text-primary)

/* Focus state */
border-color: var(--accent-primary)
box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1)

/* Error state */
border-color: var(--error)
```
