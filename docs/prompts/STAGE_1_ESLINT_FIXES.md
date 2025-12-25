# Stage 1: ESLint Warnings Fix

## Overview
Fix all 30 ESLint warnings in the codebase to achieve 0 warnings.

## Current Issues (30 warnings)

### Files with Warnings:

| File | Warnings | Issue Type |
|------|----------|------------|
| `src/config/index.ts` | 2 | Missing return type |
| `src/config/puppeteer.ts` | 1 | Missing return type |
| `src/config/redis.ts` | 2 | Missing return type |
| `src/controllers/auth.controller.ts` | 1 | Missing return type |
| `src/controllers/subscription.controller.ts` | 1 | Missing return type |
| `src/middlewares/rateLimit.middleware.ts` | 3 | Missing return type |
| `src/middlewares/validation.middleware.ts` | 3 | Missing return type |
| `src/models/apiKey.model.ts` | 1 | Missing return type |
| `src/models/screenshot.model.ts` | 4 | Missing return type |
| `src/models/usage.model.ts` | 2 | Missing return type |
| `src/models/user.model.ts` | 1 | Missing return type |

## Execution Steps

### Step 1: Run ESLint to identify exact issues
```bash
npm run lint
```

### Step 2: Fix each file

#### 2.1 Fix `src/config/index.ts`
- Add explicit return types to exported functions
- Ensure all async functions have proper Promise<T> return types

#### 2.2 Fix `src/config/puppeteer.ts`
- Add return type to browser initialization function

#### 2.3 Fix `src/config/redis.ts`
- Add return types to Redis client functions

#### 2.4 Fix `src/controllers/auth.controller.ts`
- Add return type annotations to controller methods

#### 2.5 Fix `src/controllers/subscription.controller.ts`
- Add return type annotations to controller methods

#### 2.6 Fix `src/middlewares/rateLimit.middleware.ts`
- Add return types to middleware factory functions
- Fix async functions without await

#### 2.7 Fix `src/middlewares/validation.middleware.ts`
- Add return types to validation middleware functions

#### 2.8 Fix `src/models/apiKey.model.ts`
- Add return types to schema methods and statics

#### 2.9 Fix `src/models/screenshot.model.ts`
- Add return types to schema methods (4 methods)

#### 2.10 Fix `src/models/usage.model.ts`
- Add return types to aggregation methods

#### 2.11 Fix `src/models/user.model.ts`
- Add return type to schema methods

### Step 3: Verify fixes
```bash
npm run lint
npm run typecheck
npm test
```

## Success Criteria
- [ ] `npm run lint` returns 0 warnings
- [ ] `npm run typecheck` passes
- [ ] All tests still pass
- [ ] No functionality changes

## Commit Message
```
fix: resolve all ESLint warnings for code quality

- Add explicit return type annotations to all functions
- Fix async functions without await expressions
- Improve type safety across configuration and models
```
