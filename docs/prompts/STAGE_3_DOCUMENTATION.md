# Stage 3: Missing Documentation

## Overview
Create missing documentation files: SETUP.md and DEPLOYMENT.md

## Files to Create

### File 1: `docs/SETUP.md`
### File 2: `docs/DEPLOYMENT.md`

---

## File 1: SETUP.md Content Structure

### Sections to Include:

#### 1. Prerequisites
```markdown
## Prerequisites

### Required Software
- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- MongoDB 7.0 or higher
- Redis 7.0 or higher (optional but recommended)
- Git

### Optional Software
- Docker & Docker Compose (for containerized setup)
- VS Code with recommended extensions
```

#### 2. Installation Steps
```markdown
## Installation

### Step 1: Clone Repository
git clone https://github.com/mahmoodhamdi/Screenshot-API.git
cd Screenshot-API

### Step 2: Install Dependencies
npm install

### Step 3: Environment Configuration
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Environment Variables Guide
```markdown
## Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection | mongodb://localhost:27017/screenshot-api |
| JWT_SECRET | JWT signing secret (min 32 chars) | your-super-secret-key-here |
| JWT_REFRESH_SECRET | Refresh token secret | your-refresh-secret-key |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| STRIPE_SECRET_KEY | Stripe API key | - |
| AWS_ACCESS_KEY_ID | S3 access key | - |
```

#### 4. Database Setup
```markdown
## Database Setup

### MongoDB Setup (Local)
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Or install locally
# See: https://www.mongodb.com/docs/manual/installation/

### Redis Setup (Local)
# Using Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# Or install locally
# See: https://redis.io/docs/getting-started/installation/
```

#### 5. Running the Application
```markdown
## Running the Application

### Development Mode
npm run dev
# Server starts at http://localhost:3000

### Production Mode
npm run build
npm start

### Using Docker
docker-compose up -d
```

#### 6. Verification
```markdown
## Verify Installation

### Health Check
curl http://localhost:3000/health

### API Documentation
Open http://localhost:3000/docs in browser

### Run Tests
npm test
```

#### 7. Troubleshooting
```markdown
## Troubleshooting

### Common Issues

#### MongoDB Connection Failed
- Ensure MongoDB is running: `docker ps` or `mongod --version`
- Check MONGODB_URI in .env

#### Redis Connection Failed
- Redis is optional, app works without it
- Check REDIS_HOST and REDIS_PORT

#### Puppeteer/Chrome Issues
- Install Chrome dependencies (Linux):
  apt-get install -y chromium-browser
- Set PUPPETEER_EXECUTABLE_PATH if needed
```

---

## File 2: DEPLOYMENT.md Content Structure

### Sections to Include:

#### 1. Deployment Options
```markdown
## Deployment Options

### Supported Platforms
- Docker (Recommended)
- Heroku
- AWS EC2/ECS
- Google Cloud Run
- DigitalOcean App Platform
- Railway
- Render
```

#### 2. Docker Deployment
```markdown
## Docker Deployment

### Build Production Image
docker build -t screenshot-api:latest .

### Run with Docker Compose
docker-compose -f docker-compose.yml up -d

### Environment Variables
Create `.env` file or pass via docker-compose:
environment:
  - NODE_ENV=production
  - MONGODB_URI=mongodb://mongo:27017/screenshot-api
```

#### 3. Cloud Platform Deployments
```markdown
## Cloud Deployments

### Heroku
# Create app
heroku create screenshot-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

### AWS ECS
# See detailed guide in docs/aws-deployment.md

### Google Cloud Run
gcloud run deploy screenshot-api \
  --image gcr.io/PROJECT/screenshot-api \
  --platform managed \
  --set-env-vars NODE_ENV=production
```

#### 4. Production Checklist
```markdown
## Production Checklist

### Security
- [ ] Use strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Use MongoDB authentication
- [ ] Use Redis authentication (if applicable)

### Performance
- [ ] Enable response compression
- [ ] Configure browser pool size
- [ ] Set appropriate timeouts
- [ ] Enable Redis caching

### Monitoring
- [ ] Configure logging level (info/warn)
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure health checks
- [ ] Set up uptime monitoring

### Backup
- [ ] Configure MongoDB backups
- [ ] Set up S3 lifecycle policies
- [ ] Document recovery procedures
```

#### 5. Scaling
```markdown
## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Run multiple API instances
- Use Redis for session sharing
- Use MongoDB replica set

### Vertical Scaling
- Increase browser pool size
- Increase Node.js memory limit
- Optimize MongoDB queries
```

#### 6. Monitoring & Logging
```markdown
## Monitoring

### Health Endpoints
GET /health - Basic health check
GET /api/v1 - API info and status

### Logging
- Logs are written to stdout in JSON format
- Use log aggregation (ELK, CloudWatch, etc.)
- Log levels: error, warn, info, debug

### Metrics
- Response times logged per request
- Screenshot capture duration tracked
- Error rates available via analytics API
```

#### 7. SSL/HTTPS Setup
```markdown
## SSL/HTTPS

### Using nginx (Recommended)
server {
  listen 443 ssl;
  server_name api.example.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}

### Using Let's Encrypt
certbot --nginx -d api.example.com
```

---

## Execution Steps

### Step 1: Create SETUP.md
Create comprehensive setup guide with all sections above.

### Step 2: Create DEPLOYMENT.md
Create deployment guide with all sections above.

### Step 3: Update README.md
Add links to new documentation files:
```markdown
## Documentation
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [API Documentation](docs/API.md)
```

### Step 4: Verify
- Check all links work
- Verify commands are correct
- Test setup instructions on fresh environment

---

## Success Criteria
- [ ] `docs/SETUP.md` created with all sections
- [ ] `docs/DEPLOYMENT.md` created with all sections
- [ ] README.md updated with links
- [ ] All commands tested and verified
- [ ] No broken links

## Commit Message
```
docs: add comprehensive setup and deployment guides

- Add SETUP.md with installation and configuration
- Add DEPLOYMENT.md with production deployment guides
- Include Docker, cloud platforms, and scaling guides
- Add troubleshooting sections
```
