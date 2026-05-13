# Customer Deployment Guide — Screenshot API

> Note: the existing `docs/DEPLOYMENT.md` is developer-facing. This file is the customer-facing summary.

## Scenario A — العميل عنده infrastructure

### يقدمه العميل
- VPS (4 vCPU / 8 GB RAM / 80 GB SSD) — Puppeteer/Chromium memory-hungry
- Ubuntu 22.04 / 24.04
- Domain + DNS
- AWS S3 bucket (or compatible — R2، MinIO)
- Stripe account
- SMTP credentials (for password reset emails)

### نقدمه نحن
- ✅ كل الـ source code (Express 5 API + Express views dashboard)
- ✅ Dockerfile + docker-compose (dev + production)
- ✅ Nginx reverse-proxy config
- ✅ Stripe + S3 setup guides
- ✅ توثيق: API، DEPLOYMENT (technical)، RATE_LIMITS، RUNBOOK، SETUP، WEBHOOKS
- ✅ Plans seed (Free / Pro / Business / Enterprise)
- ✅ 90-min Zoom deployment session
- ✅ 60-min training (admin dashboard، Stripe، rate limits، webhooks)
- ✅ Support حسب الـ tier

### Timeline (2 يوم)
- VPS + DNS + TLS
- MongoDB 7 + Redis 7 (docker compose)
- S3 bucket + Stripe webhook setup
- Backend + worker deploy (PM2 / docker)
- Plans seed + Stripe product mapping
- Training + go-live

---

## Scenario B — إحنا اللي بنشتري ونجهز

### يقدمه العميل
- بيانات الشركة + Domain
- Stripe (نسجل ونديره معاه)

### نقدمه نحن
- ✅ كل اللي في Scenario A
- ✅ VPS + Domain + DNS setup
- ✅ TLS via Let's Encrypt
- ✅ AWS S3 setup (or Cloudflare R2 — كلهم متكاملين)
- ✅ Stripe account setup + webhook keys
- ✅ Daily backups (MongoDB dump + S3 mirror)
- ✅ Uptime monitoring
- ✅ 3 شهور Priority support

### تكاليف infra تقديرية
| البند | شهرياً |
|------|-------|
| VPS (4 vCPU / 8 GB) | $20–$40 |
| Domain | $1 |
| S3 storage (10 GB) | $0.23 |
| S3 egress (10 GB/month) | $0.90 |
| Backups | $2 |
| Stripe fees | ~3% per transaction |
| Monitoring | $0 |

---

## Compliance & Security

- 🔒 **JWT** (access 7d / refresh 30d) + HttpOnly cookies
- 🔒 **API key hashing** — stored as bcrypt، prefix-only displayed
- 🔒 **IP whitelist** per API key (optional)
- 🔒 **Rate limiting** per plan + per key + per IP
- 🔒 **Webhook signature verification** — HMAC SHA256
- 🔒 **Stripe webhook signature verification** — built-in
- 🔒 **CSRF** for dashboard mutations
- 🔒 **Helmet headers** + CSP
- 🔒 **Audit log** — every API key creation، revocation، login
- 🔒 **Puppeteer sandbox** — `--no-sandbox` flag controlled

تفاصيل أكتر في `docs/DEPLOYMENT.md` (technical)، `docs/RUNBOOK.md` (ops)، `docs/RATE_LIMITS.md`.
