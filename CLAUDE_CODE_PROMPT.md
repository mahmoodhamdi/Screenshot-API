# 🤖 CLAUDE CODE EXECUTION PROMPT

Copy and paste this entire prompt to Claude Code after running `claude init` in your project directory.

---

## PROMPT START

```
أنت مطور Full-Stack خبير. مهمتك هي تنفيذ مشروع Screenshot API بالكامل بناءً على الخطة الموجودة في ملف SCREENSHOT_API_MASTER_PLAN.md

## 📋 التعليمات الأساسية:

### 1. قواعد صارمة يجب اتباعها:
- اقرأ ملف SCREENSHOT_API_MASTER_PLAN.md بالكامل أولاً
- نفذ كل Phase بالترتيب ولا تنتقل للـ Phase التالي إلا بعد:
  1. كتابة كل الكود المطلوب
  2. كتابة الاختبارات
  3. تشغيل الاختبارات والتأكد من نجاحها
  4. عمل commit و push للـ GitHub
- لا تترك أي ملف فارغ أو غير مكتمل
- كل ملف يجب أن يكون production-ready
- استخدم TypeScript strict mode
- اتبع best practices في كل شيء

### 2. Git Workflow:
بعد كل Phase ناجح:
```bash
git add .
git commit -m "feat(phase-X): [description]"
git push origin main
```

### 3. Repository Setup:
```bash
git remote add origin https://github.com/mahmoodhamdi/Screenshot-API.git
```

### 4. ترتيب التنفيذ:

## Phase 1: Project Setup
1. أنشئ مجلد المشروع وهيكله الكامل
2. أنشئ package.json مع كل الـ dependencies
3. أنشئ tsconfig.json
4. أنشئ .env.example
5. أنشئ .gitignore
6. أنشئ .eslintrc.js و .prettierrc
7. أنشئ jest.config.js
8. شغل npm install
9. تأكد من أن npm run build يعمل بدون أخطاء
10. Commit: "feat(phase-1): project initialization and configuration"

## Phase 2: Core Infrastructure
1. أنشئ src/config/index.ts - Environment config with Zod validation
2. أنشئ src/config/database.ts - MongoDB connection
3. أنشئ src/config/redis.ts - Redis connection and cache helpers
4. أنشئ src/config/puppeteer.ts - Browser management
5. أنشئ src/utils/logger.ts - Winston logger
6. أنشئ src/utils/helpers.ts - Utility functions
7. أنشئ src/utils/validators.ts - Zod schemas
8. أنشئ src/utils/constants.ts - Constants and error messages
9. أنشئ src/types/index.ts - TypeScript interfaces
10. اكتب unit tests لـ helpers و validators
11. Commit: "feat(phase-2): core infrastructure and utilities"

## Phase 3: Database Models
1. أنشئ src/models/user.model.ts - مع password hashing
2. أنشئ src/models/apiKey.model.ts - مع key generation
3. أنشئ src/models/screenshot.model.ts - مع كل الـ options
4. أنشئ src/models/usage.model.ts - للـ analytics
5. اكتب unit tests للـ models
6. Commit: "feat(phase-3): database models"

## Phase 4: Authentication System
1. أنشئ src/services/auth.service.ts:
   - register, login, logout
   - JWT generation (access + refresh)
   - API key CRUD
   - validateApiKey
2. أنشئ src/middlewares/auth.middleware.ts:
   - authenticateJWT
   - authenticateApiKey
   - requireAdmin
   - requirePermission
3. أنشئ src/middlewares/rateLimit.middleware.ts:
   - apiRateLimiter
   - usageQuotaLimiter
4. أنشئ src/middlewares/error.middleware.ts
5. أنشئ src/controllers/auth.controller.ts
6. أنشئ src/routes/auth.routes.ts
7. اكتب integration tests للـ auth endpoints
8. Commit: "feat(phase-4): authentication and authorization system"

## Phase 5: Screenshot Service (CORE)
1. أنشئ src/services/storage.service.ts:
   - S3 upload/delete (with local fallback)
   - getSignedUrl
2. أنشئ src/services/screenshot.service.ts:
   - capture() - الدالة الأساسية
   - validateOptions() - التحقق من الـ plan limits
   - extractMetadata() - استخراج معلومات الصفحة
   - sendWebhook() - إرسال الـ webhook
   - Ad/tracker blocking
   - Dark mode support
3. أنشئ src/controllers/screenshot.controller.ts
4. أنشئ src/routes/screenshot.routes.ts
5. اكتب unit tests للـ screenshot service
6. اكتب integration tests للـ screenshot endpoints
7. Commit: "feat(phase-5): screenshot capture service"

## Phase 6: Subscription & Payment
1. أنشئ src/services/subscription.service.ts:
   - createCheckoutSession
   - createPortalSession
   - handleWebhook (all Stripe events)
   - cancelSubscription
   - updatePlan
   - getUsageStats
   - resetMonthlyUsage
2. أنشئ src/controllers/subscription.controller.ts
3. أنشئ src/routes/subscription.routes.ts
4. اكتب tests للـ subscription service
5. Commit: "feat(phase-6): subscription and payment system"

## Phase 7: Analytics Service
1. أنشئ src/services/analytics.service.ts:
   - trackScreenshot()
   - getOverview()
   - getScreenshotStats()
   - getUsageOverTime()
   - getErrorBreakdown()
2. أنشئ src/controllers/analytics.controller.ts
3. أنشئ src/routes/analytics.routes.ts
4. Commit: "feat(phase-7): analytics and usage tracking"

## Phase 8: App Assembly
1. أنشئ src/routes/index.ts - تجميع كل الـ routes
2. أنشئ src/app.ts:
   - Express app setup
   - Middleware chain
   - Routes mounting
   - Error handling
3. أنشئ src/server.ts:
   - Database connection
   - Server startup
   - Graceful shutdown
4. تأكد من أن الـ app يعمل
5. Commit: "feat(phase-8): application assembly"

## Phase 9: Comprehensive Testing
1. اكتب E2E tests في tests/e2e/api.test.ts:
   - Full user registration flow
   - API key creation and usage
   - Screenshot capture flow
   - Rate limiting verification
   - Quota enforcement
2. شغل كل الاختبارات: npm test
3. تأكد من coverage > 80%
4. Commit: "test: comprehensive test suite with 80%+ coverage"

## Phase 10: Documentation
1. أنشئ docs/API.md - Full API documentation
2. أنشئ docs/SETUP.md - Setup guide
3. أنشئ docs/DEPLOYMENT.md - Deployment guide
4. حدث README.md بشكل شامل
5. Commit: "docs: complete API documentation"

## Phase 11: Docker & Deployment
1. أنشئ Dockerfile
2. أنشئ docker-compose.yml
3. أنشئ .dockerignore
4. تأكد من أن docker-compose up يعمل
5. Commit: "chore: docker setup for deployment"

## Phase 12: Final Polish
1. راجع كل الكود
2. أصلح أي warnings
3. تأكد من أن كل شيء يعمل
4. Final commit: "chore: final polish and ready for production"

### 5. معايير الجودة:
- كل function يجب أن يكون لها JSDoc
- كل error يجب أن يكون logged
- كل endpoint يجب أن يكون validated
- كل response يجب أن يكون consistent
- لا يوجد any في TypeScript إلا للضرورة القصوى
- استخدم async/await وليس callbacks
- استخدم try/catch للـ error handling

### 6. بعد كل ملف:
- تأكد من أنه يعمل
- تأكد من أنه لا يوجد TypeScript errors
- تأكد من أن الـ tests تمر

### 7. هام جداً:
- لا تختصر أي كود
- اكتب كل شيء بالكامل
- لا تقل "implement this" أو "add more"
- كل ملف يجب أن يكون جاهز للـ production
- نفذ بالترتيب ولا تتخطى أي خطوة

ابدأ الآن بـ Phase 1. أخبرني عند الانتهاء من كل Phase وقبل الانتقال للـ Phase التالي تأكد من عمل commit و push.
```

---

## PROMPT END

---

## 📝 How to Use This Prompt:

1. **Create the repository on GitHub:**
   ```bash
   # Go to github.com/new
   # Create: mahmoodhamdi/Screenshot-API
   # Don't initialize with README
   ```

2. **Clone and setup locally:**
   ```bash
   mkdir Screenshot-API
   cd Screenshot-API
   git init
   git remote add origin https://github.com/mahmoodhamdi/Screenshot-API.git
   ```

3. **Copy the master plan file:**
   - Copy `SCREENSHOT_API_MASTER_PLAN.md` to your project folder

4. **Open in VS Code:**
   ```bash
   code .
   ```

5. **Initialize Claude Code:**
   ```bash
   claude init
   ```

6. **Paste the prompt above**

7. **Let Claude execute the entire plan**

---

## 🔄 If Claude Stops or Errors:

Use this continuation prompt:

```
استمر من حيث توقفت. آخر phase أكملته كان Phase [X].
- تأكد من أن كل الـ commits تمت
- انتقل للـ Phase التالي
- لا تكرر أي كود سبق كتابته
- اكمل بنفس مستوى الجودة
```

---

## ⚠️ Important Notes:

1. **MongoDB & Redis:** Make sure you have them running locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:7
   docker run -d -p 6379:6379 --name redis redis:alpine
   ```

2. **Environment Variables:** Create `.env` file from `.env.example` after Phase 1

3. **Stripe:** You'll need a Stripe account for the subscription feature
   - Get your API keys from https://dashboard.stripe.com/apikeys
   - Create products and prices in Stripe dashboard

4. **AWS S3:** Optional - the code includes local storage fallback

---

## 📊 Expected Commits:

After successful execution, you should have these commits:

1. `feat(phase-1): project initialization and configuration`
2. `feat(phase-2): core infrastructure and utilities`
3. `feat(phase-3): database models`
4. `feat(phase-4): authentication and authorization system`
5. `feat(phase-5): screenshot capture service`
6. `feat(phase-6): subscription and payment system`
7. `feat(phase-7): analytics and usage tracking`
8. `feat(phase-8): application assembly`
9. `test: comprehensive test suite with 80%+ coverage`
10. `docs: complete API documentation`
11. `chore: docker setup for deployment`
12. `chore: final polish and ready for production`

---

## 🎯 Success Criteria:

- [ ] All 12 phases completed
- [ ] All tests passing
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Docker builds successfully
- [ ] API documentation complete
- [ ] All commits pushed to GitHub