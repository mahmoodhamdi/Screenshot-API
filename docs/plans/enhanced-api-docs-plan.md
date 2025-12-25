# Enhanced API Documentation Plan

## Overview

إضافة صفحة توثيق API متطورة وسهلة الاستخدام للمطورين مع أكواد جاهزة بلغات برمجة متعددة و SDKs.

## Current State

الموجود حالياً:
- Swagger UI (`/docs`)
- ReDoc (`/redoc`)
- OpenAPI JSON/YAML
- Landing page بسيطة (`/api-docs`)

## What We're Adding

### 1. Developer Portal (`/developer`)

صفحة رئيسية للمطورين تحتوي على:
- Quick Start Guide
- Authentication Guide
- Code Examples بكل اللغات
- SDK Downloads
- Interactive API Explorer

### 2. Code Examples Hub (`/developer/examples`)

أمثلة أكواد جاهزة للـ endpoints الرئيسية بـ:
- **JavaScript/Node.js** - fetch, axios
- **Python** - requests, httpx
- **PHP** - cURL, Guzzle
- **cURL** - Command line
- **Ruby** - Net::HTTP
- **Go** - net/http
- **Java** - HttpClient
- **C#/.NET** - HttpClient

### 3. Interactive Code Playground

- اختيار اللغة
- Copy to clipboard
- Syntax highlighting
- Live response preview

### 4. Additional Documentation Formats

| Format | Route | Description |
|--------|-------|-------------|
| Postman Collection | `/docs/postman.json` | Import مباشر في Postman |
| Insomnia Export | `/docs/insomnia.json` | Import في Insomnia |
| HTTPie Examples | `/developer/httpie` | أوامر HTTPie جاهزة |
| Bruno Collection | `/docs/bruno.json` | Import في Bruno |

### 5. SDK Section

صفحة مخصصة للـ SDKs:
- Installation commands
- Quick start code
- Full documentation links
- npm/pip/composer badges

## Implementation Details

### File Structure

```
src/
├── config/
│   └── swagger.ts (existing - no changes)
├── routes/
│   └── docs.routes.ts (new - documentation routes)
├── views/
│   └── docs/
│       ├── developer-portal.html (main portal)
│       ├── components/
│       │   ├── code-examples.ts (code snippets generator)
│       │   └── postman-generator.ts (collection generator)
│       └── styles/
│           └── docs.css (shared styles)
└── utils/
    └── docs/
        ├── code-generator.ts (generates code for all languages)
        └── collection-generator.ts (generates Postman/Insomnia)
```

### New Routes

```typescript
// Documentation Routes
GET /developer                 // Developer Portal (main page)
GET /developer/quickstart      // Quick Start Guide
GET /developer/authentication  // Auth Guide
GET /developer/examples        // Code Examples Hub
GET /developer/sdks            // SDKs Page
GET /developer/webhooks        // Webhooks Guide

// Export Formats
GET /docs/postman.json         // Postman Collection v2.1
GET /docs/insomnia.json        // Insomnia Export
GET /docs/bruno.json           // Bruno Collection
GET /docs/httpie              // HTTPie Commands
```

### Code Examples Structure

```typescript
interface CodeExample {
  language: string;
  label: string;
  icon: string;
  code: string;
  installCommand?: string;
}

// Example for Screenshot endpoint
const screenshotExamples: CodeExample[] = [
  {
    language: 'javascript',
    label: 'Node.js',
    icon: 'fab fa-node-js',
    installCommand: 'npm install axios',
    code: `const axios = require('axios');

const response = await axios.post('https://api.screenshot-api.com/api/v1/screenshots', {
  url: 'https://example.com',
  width: 1920,
  height: 1080,
  format: 'png'
}, {
  headers: {
    'X-API-Key': 'your_api_key',
    'Content-Type': 'application/json'
  }
});

console.log(response.data);`
  },
  // ... more languages
];
```

### Developer Portal Features

1. **Tabbed Code Examples**
   - Switch بين اللغات بسهولة
   - Copy button لكل snippet
   - Syntax highlighting مع Prism.js

2. **Quick Start Steps**
   - Step 1: Get API Key
   - Step 2: Make First Request
   - Step 3: Handle Response
   - Step 4: Error Handling

3. **Interactive Try It**
   - Form لإدخال parameters
   - Response preview
   - cURL command generator

4. **SDK Cards**
   - Installation badge
   - GitHub stars
   - Last update
   - Quick install command

## UI Design

### Color Scheme (Dark Mode)
```css
:root {
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #21262d;
  --text-primary: #f0f6fc;
  --text-secondary: #8b949e;
  --accent-blue: #58a6ff;
  --accent-green: #3fb950;
  --accent-purple: #a371f7;
  --accent-orange: #d29922;
  --border-color: #30363d;
}
```

### Language Icons
- JavaScript: Yellow (#f7df1e)
- Python: Blue/Yellow (#3776ab)
- PHP: Purple (#777bb4)
- Ruby: Red (#cc342d)
- Go: Cyan (#00add8)
- Java: Orange (#ed8b00)
- C#: Purple (#512bd4)
- cURL: Green (#073551)

## Implementation Steps

### Phase 1: Code Generator Utility
1. Create `src/utils/docs/code-generator.ts`
2. Implement code templates for all languages
3. Support all main endpoints

### Phase 2: Collection Generators
1. Create Postman collection generator
2. Create Insomnia export generator
3. Create Bruno collection generator

### Phase 3: Developer Portal HTML
1. Create main portal page
2. Implement tabbed code examples
3. Add copy functionality
4. Add syntax highlighting

### Phase 4: Documentation Routes
1. Create `/developer` routes
2. Serve static HTML/CSS
3. Implement JSON exports

### Phase 5: Integration
1. Add links from existing docs
2. Update `/api-docs` landing page
3. Test all exports

## Testing

```bash
# Unit tests for generators
npm run test:unit -- code-generator.test.ts
npm run test:unit -- collection-generator.test.ts

# Integration tests for routes
npm run test:integration -- docs.routes.test.ts
```

## After Implementation

### How to Access

1. **Developer Portal**: `http://localhost:3000/developer`
2. **Code Examples**: `http://localhost:3000/developer/examples`
3. **Postman Collection**: `http://localhost:3000/docs/postman.json`
4. **Insomnia Export**: `http://localhost:3000/docs/insomnia.json`

### How to Use Postman Collection

```bash
# Download collection
curl -o screenshot-api.postman.json http://localhost:3000/docs/postman.json

# Or import directly in Postman via URL
```

### How to Use Code Examples

1. اختار اللغة من الـ tabs
2. انسخ الكود بالـ copy button
3. غير `your_api_key` بالـ API key بتاعك
4. شغل الكود

## Dependencies

لا يوجد dependencies جديدة - نستخدم vanilla JS و CSS فقط.

## Estimated Files

| File | Lines | Purpose |
|------|-------|---------|
| `code-generator.ts` | ~400 | Generate code snippets |
| `collection-generator.ts` | ~200 | Generate Postman/Insomnia |
| `docs.routes.ts` | ~100 | Route handlers |
| `developer-portal.html` | ~800 | Main portal page |
| `docs.css` | ~300 | Styles |

## Success Criteria

- [ ] Developer portal accessible at `/developer`
- [ ] Code examples for 8+ languages
- [ ] Postman collection downloadable
- [ ] Insomnia export working
- [ ] Copy to clipboard working
- [ ] Syntax highlighting working
- [ ] All tests passing
- [ ] Dark mode consistent
