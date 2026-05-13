# Screenshot API — جاهز للبيع

> **Production-ready screenshot API service with billing, webhooks, and dashboard. Source-code delivery + deployment + training.**

API كامل لخدمة الـ screenshots عند الطلب. مبني على Express 5 + MongoDB + Redis (BullMQ) + Puppeteer. يدعم API key auth، rate limiting per plan، Stripe billing، webhook notifications، S3 storage، dashboard مع landing page.

---

## ليه Screenshot-API ده؟

### Core API
- **POST /api/v1/screenshots** — capture full-page or viewport
- **Custom viewport** — width، height، deviceScaleFactor
- **Output formats** — PNG، JPEG، WebP، PDF
- **Wait conditions** — waitFor selector، networkidle، timeout
- **Auth in URL** — basic auth، cookies، custom headers
- **Full-page screenshots** — يلتقط الصفحة كلها مش الـ viewport بس
- **Element-level capture** — capture محدد بـ CSS selector
- **Mobile emulation** — user agent + viewport

### Authentication
- **JWT** للـ dashboard (access 7d + refresh 30d)
- **API keys** للـ programmatic use
- **API key permissions** — fine-grained per endpoint
- **IP whitelisting** per API key
- **Rate limiting** per key + per plan

### Billing & Subscriptions
- **Stripe** integration
- **3 plans** — Free / Pro / Business / Enterprise
- **Usage metering** — screenshots taken per month
- **Plan auto-routing** — over-limit handling

### Storage
- **AWS S3** + presigned URLs
- **Local storage** fallback
- **CDN-ready** delivery

### Webhooks
- **Outbound webhooks** — success، failure، quota events
- **Signature verification** — HMAC SHA256
- **Retry policy** — exponential backoff

### Dashboard
- **Landing page** — pricing، features، CTA
- **Auth pages** — login، register، forgot password
- **Dashboard** — usage charts، API keys management، webhook config، billing portal، settings

### Operations
- **BullMQ queue** — async screenshot rendering
- **Worker concurrency** tunable
- **Circuit breaker** — Redis health
- **Audit log** — all actions
- **Health endpoint** — liveness + readiness

---

## التقنيات (Tech Stack)

| Layer | Stack |
|-------|-------|
| API | **Node 20+ / Express 5 / TypeScript** |
| Database | **MongoDB 7** (Mongoose) |
| Cache + Queue | **Redis 7** + BullMQ |
| Browser engine | **Puppeteer (Chromium)** |
| Auth | **JWT + API keys** |
| Billing | **Stripe** |
| Storage | **AWS S3** + presigned URLs |
| Views | Express templated landing + dashboard |
| Tests | **Jest** — 995 unit tests passing |

---

## كيف بيوصل المنتج

### كل ما يتم تسليمه
- ✅ Source code كامل (monolith API + worker + Express views)
- ✅ Docker (Dockerfile + docker-compose.yml dev + prod)
- ✅ Nginx config للـ reverse proxy
- ✅ Stripe + S3 setup guides
- ✅ Webhook + rate-limit policies
- ✅ توثيق: API.md، DEPLOYMENT.md، RATE_LIMITS.md، RUNBOOK.md، SETUP.md، WEBHOOKS.md
- ✅ 8 screenshots احترافية + 1:52 walkthrough video
- ✅ جلسة zoom 90 دقيقة للنشر + 60 دقيقة training
- ✅ دعم فني حسب الـ tier

### Timeline (2 يوم)
- يوم 1: VPS + Domain + TLS + MongoDB + Redis + S3
- يوم 2: Deploy API + worker + dashboard، Stripe setup، Puppeteer/Chromium، warm-up + training

---

## السعر والتراخيص

| البند | السعر |
|------|------|
| **Source code license** (single client) | حسب الاتفاق |
| **Deployment + training** | مشمول |
| **Support — Standard** | $90 / شهر |
| **Support — Priority** | $220 / شهر |
| **Support — Enterprise** | $500 / شهر |

تفاصيل tiers الدعم في `SUPPORT-PLANS.md`.

---

## تواصل

**Mahmoud Hamdy** — Full-Stack Developer
- **GitHub**: [github.com/mahmoodhamdi](https://github.com/mahmoodhamdi)
- **Email**: hmdy7486@gmail.com
- **Repository**: [github.com/mahmoodhamdi/Screenshot-API](https://github.com/mahmoodhamdi/Screenshot-API)
