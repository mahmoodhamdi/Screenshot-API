# Handover Checklist — Screenshot API

**Client**: ___________________________
**Delivery date**: ____ / ____ / ______
**Tier**: ☐ Standard / ☐ Priority / ☐ Enterprise

---

## Infrastructure
- [ ] VPS (4 vCPU / 8 GB RAM / 80 GB SSD)
- [ ] Ubuntu 22.04 / 24.04 patched
- [ ] ufw + Fail2ban
- [ ] Swap configured (4 GB) — Puppeteer needs headroom
- [ ] Timezone configured

## Domain + TLS
- [ ] DNS A record for api domain
- [ ] DNS A record for dashboard subdomain (optional)
- [ ] TLS via Let's Encrypt (auto-renew configured)
- [ ] HSTS + HTTPS redirect

## Database
- [ ] MongoDB 7 running (managed or self-hosted)
- [ ] Database `screenshot-api` created
- [ ] User credentials configured
- [ ] Daily backups configured (mongodump → S3)

## Redis
- [ ] Redis 7 running
- [ ] Persistence enabled
- [ ] Password protected
- [ ] BullMQ screenshot queue verified

## API
- [ ] Node 20+
- [ ] `npm ci` + `npm run build` succeeded
- [ ] `.env` populated (MONGODB_URI، REDIS_*، JWT_SECRET، JWT_REFRESH_SECRET، AWS_*، STRIPE_*، SMTP)
- [ ] JWT secrets rotated from defaults (≥32 chars each)
- [ ] systemd / PM2 service running
- [ ] Health endpoint returns 200

## Worker
- [ ] Worker process running
- [ ] PUPPETEER_EXECUTABLE_PATH set (Chromium)
- [ ] PUPPETEER_HEADLESS=true
- [ ] PUPPETEER_MAX_CONCURRENT tuned to VPS

## Storage
- [ ] S3 bucket created
- [ ] IAM user created with bucket-only permissions
- [ ] Lifecycle policy configured (auto-delete after SCREENSHOT_EXPIRY_DAYS)
- [ ] Bucket CORS configured

## Stripe
- [ ] Stripe account active
- [ ] Webhook endpoint configured (`/api/v1/billing/webhook`)
- [ ] Webhook secret in env
- [ ] Plans created in Stripe (Free / Pro / Business / Enterprise)
- [ ] Plan IDs mapped in db
- [ ] Test transaction completed

## Email
- [ ] SMTP credentials configured
- [ ] Test password-reset email sent
- [ ] Sender domain SPF + DKIM configured

## Initial Seed
- [ ] Plans seeded (Free / Pro / Business / Enterprise)
- [ ] First admin user created
- [ ] Admin password CHANGED from default

## Security
- [ ] `npm audit` clean (or known-acceptable)
- [ ] `.env` chmod 600
- [ ] Rate limiting verified
- [ ] CSRF tokens issued + verified
- [ ] API key hashing verified

## Training
- [ ] API walkthrough — capture endpoints (15 min)
- [ ] Dashboard tour (15 min)
- [ ] API key creation + revocation (10 min)
- [ ] Webhook setup + signature verification (15 min)
- [ ] Billing flow + plan tiers (15 min)
- [ ] Operations — queue monitoring، logs، Stripe portal (15 min)

## Documentation
- [ ] README + docs/ folder shared
- [ ] SUPPORT-PLANS signed
- [ ] This checklist signed

## 24h go/no-go
- [ ] Admin login works
- [ ] Register a test user
- [ ] Create an API key
- [ ] Capture a test screenshot via API
- [ ] Webhook delivered on success
- [ ] Stripe test transaction → plan upgrade
- [ ] Rate limit fires after exceeding plan quota

---

**Client**: ____________________  Date: ____ / ____ / ______
**Developer**: Mahmoud Hamdy — Date: ____ / ____ / ______
