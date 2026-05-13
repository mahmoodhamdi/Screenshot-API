# Features Inventory — Screenshot API

Legend: ✅ ships / 🟡 caveat / 🔵 optional / ⛔ out of scope

---

## Authentication
| Feature | Status | Notes |
|---------|:------:|-------|
| User registration | ✅ | email + password |
| Login + Logout | ✅ | JWT access 7d + refresh 30d |
| Password reset flow | ✅ | SMTP + token + 24h expiry |
| Email verification | ✅ | optional |
| HttpOnly + Secure cookies | ✅ | |
| Password complexity (bcrypt 12 rounds) | ✅ | |
| Rate limiting on /auth | ✅ | |

## API Keys
| Feature | Status | Notes |
|---------|:------:|-------|
| Create + revoke API keys | ✅ | |
| Key hashing | ✅ | stored as bcrypt، prefix-only displayed |
| Per-key permissions | ✅ | scoped to endpoints |
| IP whitelisting per key | ✅ | |
| Rate limiting per key | ✅ | |
| Audit log per key | ✅ | |

## Screenshot Capture
| Feature | Status | Notes |
|---------|:------:|-------|
| POST /api/v1/screenshots | ✅ | sync + async via queue |
| Output formats | ✅ | PNG، JPEG، WebP، PDF |
| Custom viewport | ✅ | width، height، scale |
| Full-page capture | ✅ | |
| Element-level capture | ✅ | CSS selector |
| Wait conditions | ✅ | networkidle، selector، timeout |
| Mobile emulation | ✅ | user agent + viewport |
| Custom headers + cookies | ✅ | |
| Block ads / trackers | 🟡 | custom URL blocklist |
| HAR file capture | 🔵 | Enterprise add-on |
| Video recording | 🔵 | Enterprise add-on |

## Webhooks
| Feature | Status | Notes |
|---------|:------:|-------|
| Outbound webhooks | ✅ | success، failure، quota events |
| HMAC SHA256 signing | ✅ | |
| Retry with backoff | ✅ | exponential |
| Webhook log | ✅ | |
| Custom event types | ✅ | per webhook subscription |

## Billing & Subscriptions
| Feature | Status | Notes |
|---------|:------:|-------|
| Stripe integration | ✅ | |
| Plans (Free / Pro / Business / Enterprise) | ✅ | seeded |
| Plan upgrade / downgrade | ✅ | |
| Usage metering | ✅ | screenshots per period |
| Quota enforcement | ✅ | hard cap + soft warnings |
| Invoice history | ✅ | |
| Webhook signature verification | ✅ | Stripe webhook secret |

## Storage
| Feature | Status | Notes |
|---------|:------:|-------|
| AWS S3 | ✅ | with presigned URLs |
| Local storage fallback | ✅ | |
| Auto-expiry | ✅ | configurable retention days |
| CDN-ready | ✅ | works behind CloudFront/Cloudflare |

## Dashboard
| Feature | Status | Notes |
|---------|:------:|-------|
| Landing page | ✅ | pricing، features، CTA |
| Authentication pages | ✅ | login، register، forgot password |
| Dashboard home | ✅ | usage charts |
| API keys management | ✅ | create، list، revoke |
| Webhooks management | ✅ | configure، test، history |
| Billing portal | ✅ | plan management، invoices |
| Usage analytics | ✅ | per-day، per-key |
| Settings | ✅ | profile، password change |

## Operations
| Feature | Status | Notes |
|---------|:------:|-------|
| BullMQ queue | ✅ | screenshot rendering |
| Worker concurrency | ✅ | tunable |
| Circuit breaker (Redis) | ✅ | with fallback rate limiter |
| Health endpoint | ✅ | `/health` and `/api/v1/health` |
| Audit log | ✅ | login، API key، webhook events |
| Structured logging | ✅ | Winston/JSON |
| Error tracking | 🔵 | Sentry integration available |

## Tests
| Suite | Tests | Status |
|-------|-------|:------:|
| Unit (Jest) | 995 | ✅ all passing |
| Integration (Jest + supertest) | ~150 | 🟡 needs Redis + Mongo running |
| E2E (Playwright) | available | 🟡 needs running server |

## Out of Scope (current scope)
| Feature | Why |
|---------|-----|
| Web-scraping primitives (HTML extraction) | Different product class; can integrate Cheerio in Enterprise add-on |
| OCR on screenshots | Add-on |
| AI summarization | Add-on; integrate any LLM provider |
| Distributed multi-region capture | Enterprise add-on |
