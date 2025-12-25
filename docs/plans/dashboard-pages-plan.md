# Dashboard Pages Plan

## Overview

إنشاء Dashboard كامل للمستخدمين يتضمن: Overview, Screenshots, API Keys, Usage Analytics, Settings.

---

## File Structure

```
src/views/dashboard/
├── index.ts                  # Dashboard generator & shared styles
├── layouts/
│   └── dashboard-layout.ts   # Main dashboard layout with sidebar
├── pages/
│   ├── overview.ts           # Dashboard home/overview
│   ├── screenshots.ts        # Screenshots list & management
│   ├── screenshot-detail.ts  # Single screenshot view
│   ├── api-keys.ts           # API keys management
│   ├── usage.ts              # Usage & analytics
│   ├── settings.ts           # Account settings
│   └── billing.ts            # Billing & subscription
└── components/
    ├── sidebar.ts            # Dashboard sidebar navigation
    ├── header.ts             # Dashboard header with user menu
    ├── stat-card.ts          # Statistics card
    ├── data-table.ts         # Reusable data table
    ├── chart.ts              # Simple chart component
    ├── modal.ts              # Modal dialog
    ├── dropdown.ts           # Dropdown menu
    ├── pagination.ts         # Pagination component
    ├── empty-state.ts        # Empty state placeholder
    └── toast.ts              # Toast notifications
```

---

## Phase 1: Dashboard Layout & Navigation

### Prompt for Phase 1
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 1: Dashboard Layout & Navigation

Tasks:
1. Create folder structure: src/views/dashboard/layouts/, pages/, components/

2. Create src/views/dashboard/index.ts with:
   - Export function generateDashboardPage(page: string, data: object)
   - Shared dashboard styles
   - Dark theme consistent with landing/auth pages
   - Base HTML template

3. Create src/views/dashboard/layouts/dashboard-layout.ts with:
   - Sidebar (collapsible on mobile)
   - Main content area
   - Top header with user info
   - Responsive layout

4. Create src/views/dashboard/components/sidebar.ts with:
   Navigation Items:
   - Overview (home icon)
   - Screenshots (image icon)
   - API Keys (key icon)
   - Usage & Analytics (chart icon)
   - Settings (gear icon)
   - Billing (credit card icon)

   Features:
   - Active state indicator
   - Hover effects
   - Collapsible on mobile (hamburger menu)
   - Logo at top
   - User plan badge
   - Upgrade button for free users

5. Create src/views/dashboard/components/header.ts with:
   - Page title (dynamic)
   - Search bar (optional)
   - Notifications bell (optional)
   - User dropdown menu:
     - User name & email
     - Account settings link
     - Billing link
     - API Documentation link
     - Sign out button

6. Update src/app.ts to add dashboard routes:
   - GET /dashboard -> overview
   - GET /dashboard/screenshots -> screenshots list
   - GET /dashboard/screenshots/:id -> screenshot detail
   - GET /dashboard/api-keys -> API keys
   - GET /dashboard/usage -> usage analytics
   - GET /dashboard/settings -> settings
   - GET /dashboard/billing -> billing

   All routes require authentication (redirect to /login if not authenticated)

Design Requirements:
- Dark theme (#0a0a0f)
- Sidebar: 280px wide on desktop, full overlay on mobile
- Content area: max-width 1400px, centered
- Consistent spacing (24px padding)
- Card-based UI for content sections

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test dashboard layout at /dashboard
- Create commit: "feat(dashboard): setup dashboard layout with sidebar"
- Push to remote
```

---

## Phase 2: Overview Page

### Prompt for Phase 2
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 2: Overview Page

Tasks:
1. Create src/views/dashboard/components/stat-card.ts with:
   - Icon
   - Label
   - Value (large number)
   - Change indicator (+/-%)
   - Optional trend sparkline

2. Create src/views/dashboard/pages/overview.ts with:

   Welcome Section:
   - "Welcome back, [Name]" greeting
   - Current date
   - Quick action buttons (New Screenshot, View API Keys)

   Stats Row (4 cards):
   - Screenshots this month (with limit: 45/100)
   - API calls today
   - Success rate (%)
   - Average response time

   Recent Activity Section:
   - Last 5 screenshots (thumbnail, URL, date, status)
   - "View All" link

   Quick Actions Section:
   - "Capture Screenshot" card with URL input
   - "Get API Key" card
   - "View Documentation" card

   Usage Chart (Simple):
   - Last 7 days screenshot count
   - Simple bar chart

   Plan Status Card:
   - Current plan name
   - Screenshots remaining
   - Days until reset
   - "Upgrade" button (if not enterprise)

3. JavaScript for overview:
   - Fetch data from /api/v1/analytics/overview
   - Fetch recent screenshots from /api/v1/screenshots?limit=5
   - Update stats dynamically
   - Quick capture form submission

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test overview at /dashboard
- Create commit: "feat(dashboard): add overview page with stats"
- Push to remote
```

---

## Phase 3: Screenshots Page

### Prompt for Phase 3
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 3: Screenshots Page

Tasks:
1. Create src/views/dashboard/components/data-table.ts with:
   - Sortable columns
   - Row selection
   - Actions column
   - Loading skeleton
   - Empty state

2. Create src/views/dashboard/components/pagination.ts with:
   - Page numbers
   - Previous/Next buttons
   - Items per page selector
   - "Showing X-Y of Z" text

3. Create src/views/dashboard/components/empty-state.ts with:
   - Icon
   - Title
   - Description
   - Action button

4. Create src/views/dashboard/pages/screenshots.ts with:

   Header:
   - "Screenshots" title
   - "New Screenshot" button (opens modal)
   - Search input
   - Filter dropdown (status, format, date range)

   Table Columns:
   - Thumbnail (small preview)
   - URL (truncated with tooltip)
   - Format (badge)
   - Dimensions
   - Status (pending, completed, failed)
   - Created date
   - Actions (view, download, delete, retry)

   Features:
   - Click row to view details
   - Bulk selection & delete
   - Sort by date, status
   - Filter by status, format
   - Pagination (10, 25, 50 per page)

   Empty State:
   - Icon: Image placeholder
   - "No screenshots yet"
   - "Capture your first screenshot"
   - Button to open new screenshot modal

5. Create New Screenshot Modal:
   - URL input (required)
   - Width/Height inputs
   - Format selector
   - Full page toggle
   - Dark mode toggle
   - Block ads toggle
   - Advanced options (collapsible):
     - Delay
     - Selector
     - Quality
     - Custom headers
     - Cookies
     - Webhook URL
   - "Capture" button

6. JavaScript:
   - Fetch screenshots from /api/v1/screenshots
   - Pagination handling
   - Search/filter handling
   - Create screenshot (POST /api/v1/screenshots)
   - Delete screenshot (DELETE /api/v1/screenshots/:id)
   - Retry screenshot (POST /api/v1/screenshots/:id/retry)

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test screenshots page at /dashboard/screenshots
- Create commit: "feat(dashboard): add screenshots management page"
- Push to remote
```

---

## Phase 4: Screenshot Detail Page

### Prompt for Phase 4
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 4: Screenshot Detail Page

Tasks:
1. Create src/views/dashboard/pages/screenshot-detail.ts with:

   Layout:
   - Back button to screenshots list
   - Screenshot title (URL or custom)
   - Actions: Download, Delete, Retry, Copy URL

   Main Content:
   - Large screenshot preview (zoomable)
   - Screenshot info card:
     - URL captured
     - Status with badge
     - Format
     - Dimensions
     - File size
     - Created date
     - Duration (capture time)

   Options Used Section:
   - Full page: Yes/No
   - Dark mode: Yes/No
   - Block ads: Yes/No
   - Delay: Xms
   - Selector: (if any)
   - Quality: X%

   Metadata Section (if available):
   - Page title
   - Page description
   - Page favicon

   Actions:
   - Download button (original file)
   - Copy image URL button
   - Delete button (with confirmation)
   - Retry button (if failed)
   - Refresh URL button

2. JavaScript:
   - Fetch screenshot details from /api/v1/screenshots/:id
   - Download handler
   - Delete with confirmation modal
   - Retry functionality
   - Copy URL to clipboard

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test detail page at /dashboard/screenshots/:id
- Create commit: "feat(dashboard): add screenshot detail page"
- Push to remote
```

---

## Phase 5: API Keys Page

### Prompt for Phase 5
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 5: API Keys Page

Tasks:
1. Create src/views/dashboard/pages/api-keys.ts with:

   Header:
   - "API Keys" title
   - "Create New Key" button
   - Info tooltip about API keys

   Security Notice:
   - Warning card about keeping keys secure
   - Link to documentation

   API Keys Table:
   - Name
   - Key (masked: ss_xxxxx...xxxxx, show button)
   - Created date
   - Last used
   - Status (active, revoked)
   - Permissions (badges)
   - Actions (view, copy, revoke, delete)

   Empty State:
   - "No API keys yet"
   - "Create your first API key to start using the API"

   Create API Key Modal:
   - Key name input (required)
   - Permissions checkboxes:
     - screenshots:read
     - screenshots:write
     - screenshots:delete
   - IP whitelist (optional, comma-separated)
   - Domain whitelist (optional, comma-separated)
   - Expiration (optional: 30 days, 90 days, 1 year, never)
   - "Create Key" button

   New Key Created Modal:
   - Success message
   - Show full key (ONE TIME ONLY warning)
   - Copy button
   - "I've copied the key" confirmation button
   - Warning: key won't be shown again

2. JavaScript:
   - Fetch API keys from /api/v1/auth/api-keys
   - Create key (POST /api/v1/auth/api-keys)
   - Revoke key (DELETE /api/v1/auth/api-keys/:id)
   - Copy key to clipboard
   - Show/hide key toggle

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test API keys page at /dashboard/api-keys
- Create commit: "feat(dashboard): add API keys management page"
- Push to remote
```

---

## Phase 6: Usage & Analytics Page

### Prompt for Phase 6
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 6: Usage & Analytics Page

Tasks:
1. Create src/views/dashboard/components/chart.ts with:
   - Simple bar chart (CSS-based, no library needed)
   - Line chart option
   - Responsive sizing
   - Tooltips on hover

2. Create src/views/dashboard/pages/usage.ts with:

   Header:
   - "Usage & Analytics" title
   - Date range picker (Last 7 days, 30 days, 90 days, custom)
   - Export button (CSV)

   Summary Stats Row:
   - Total screenshots
   - Successful screenshots
   - Failed screenshots
   - Success rate

   Charts Section:

   Chart 1 - Screenshots Over Time:
   - Bar chart showing daily screenshots
   - Toggle: Daily / Weekly / Monthly

   Chart 2 - Format Distribution:
   - Pie/donut chart (CSS-based)
   - PNG, JPEG, WebP, PDF breakdown

   Chart 3 - Status Distribution:
   - Completed vs Failed

   Top URLs Section:
   - Table of most captured URLs
   - Columns: URL, Count, Last captured

   API Usage Section:
   - API calls by endpoint
   - Response time average
   - Error rate

   Usage by API Key:
   - Table showing usage per API key
   - Columns: Key name, Screenshots, API calls, Last used

3. JavaScript:
   - Fetch analytics from /api/v1/analytics/overview
   - Fetch screenshot stats from /api/v1/analytics/screenshots
   - Fetch usage from /api/v1/analytics/usage
   - Date range filtering
   - Chart updates

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test usage page at /dashboard/usage
- Create commit: "feat(dashboard): add usage analytics page"
- Push to remote
```

---

## Phase 7: Settings Page

### Prompt for Phase 7
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 7: Settings Page

Tasks:
1. Create src/views/dashboard/pages/settings.ts with:

   Profile Section:
   - Profile picture (avatar with initials fallback)
   - Name input
   - Email (read-only, with "change email" link)
   - "Save Changes" button

   Security Section:
   - Change Password:
     - Current password
     - New password (with strength indicator)
     - Confirm new password
     - "Update Password" button

   - Two-Factor Authentication (optional):
     - Enable/Disable toggle
     - QR code setup

   - Active Sessions:
     - List of active sessions
     - Device, location, last active
     - "Sign out" button for each
     - "Sign out all devices" button

   Notifications Section:
   - Email notifications toggles:
     - Weekly usage report
     - Screenshot failures
     - Account updates
     - Marketing emails

   Danger Zone Section:
   - Delete Account:
     - Warning message
     - "Delete Account" button (red)
     - Confirmation modal with password

2. JavaScript:
   - Fetch user profile from /api/v1/auth/me
   - Update profile (PUT /api/v1/auth/profile)
   - Change password (POST /api/v1/auth/change-password)
   - Update notifications preferences
   - Delete account (DELETE /api/v1/auth/account)

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test settings page at /dashboard/settings
- Create commit: "feat(dashboard): add settings page"
- Push to remote
```

---

## Phase 8: Billing Page

### Prompt for Phase 8
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 8: Billing Page

Tasks:
1. Create src/views/dashboard/pages/billing.ts with:

   Current Plan Section:
   - Plan name (Free, Starter, Pro, Enterprise)
   - Plan badge
   - Price
   - Renewal date (or "Free forever")
   - "Change Plan" button
   - "Cancel Subscription" button (if paid)

   Usage Summary:
   - Progress bar: Screenshots used (45/100)
   - API calls remaining
   - Days until reset

   Plan Comparison (for upgrade):
   - Side-by-side plan features
   - Highlight current plan
   - "Upgrade" buttons

   Payment Method Section (if paid):
   - Card on file (Visa ending in 4242)
   - "Update Payment Method" button
   - Link to Stripe billing portal

   Billing History Section:
   - Table of past invoices
   - Columns: Date, Amount, Status, Download
   - "View Invoice" links

   Actions:
   - Upgrade Plan: Opens Stripe Checkout
   - Manage Billing: Opens Stripe Portal
   - Cancel Plan: Confirmation modal

2. JavaScript:
   - Fetch subscription from /api/v1/subscriptions
   - Fetch usage from /api/v1/subscriptions/usage
   - Create checkout (POST /api/v1/subscriptions/checkout)
   - Open billing portal (POST /api/v1/subscriptions/portal)
   - Cancel subscription (DELETE /api/v1/subscriptions)

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Test billing page at /dashboard/billing
- Create commit: "feat(dashboard): add billing page"
- Push to remote
```

---

## Phase 9: Integration Tests

### Prompt for Phase 9
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 9: Integration Tests

Tasks:
1. Create tests/integration/dashboard.test.ts with:

   Route Tests:
   - GET /dashboard returns 200 (with auth)
   - GET /dashboard redirects to /login (without auth)
   - GET /dashboard/screenshots returns 200
   - GET /dashboard/api-keys returns 200
   - GET /dashboard/usage returns 200
   - GET /dashboard/settings returns 200
   - GET /dashboard/billing returns 200

   Structure Tests:
   - Dashboard contains sidebar
   - Dashboard contains header
   - Each page has proper title
   - Navigation links work

2. Run all tests

After completion:
- Run npm test
- Run npm run build
- Create commit: "test(dashboard): add dashboard integration tests"
- Push to remote
```

---

## Phase 10: Final Polish & Documentation

### Prompt for Phase 10
```
Read the file: D:\Screenshot-API\docs\plans\dashboard-pages-plan.md

Execute Phase 10: Final Polish & Documentation

Tasks:
1. Add loading states:
   - Skeleton loaders for tables
   - Spinner for buttons
   - Progress indicators

2. Add error handling:
   - Error boundaries
   - Retry buttons
   - Friendly error messages

3. Add empty states:
   - No screenshots
   - No API keys
   - No analytics data

4. Add toast notifications:
   - Success messages
   - Error messages
   - Copy confirmations

5. Add keyboard shortcuts:
   - Cmd/Ctrl + N: New screenshot
   - Cmd/Ctrl + K: Search
   - Escape: Close modals

6. Mobile optimizations:
   - Collapsible sidebar
   - Touch-friendly interactions
   - Responsive tables

7. Update CLAUDE.md with dashboard documentation

8. Update README.md with dashboard info

After completion:
- Run npm run lint:fix
- Run npm run typecheck
- Run npm test
- Run npm run build
- Manual testing of all pages
- Create commit: "feat(dashboard): complete dashboard with polish"
- Push to remote
```

---

## Success Criteria

- [ ] Dashboard layout with sidebar navigation
- [ ] Overview page with stats and recent activity
- [ ] Screenshots page with table, filters, and modals
- [ ] Screenshot detail page with preview and actions
- [ ] API Keys page with create, view, revoke functionality
- [ ] Usage page with charts and analytics
- [ ] Settings page with profile and security options
- [ ] Billing page with plan management
- [ ] All pages responsive (mobile, tablet, desktop)
- [ ] All pages accessible
- [ ] All tests pass
- [ ] Build succeeds
