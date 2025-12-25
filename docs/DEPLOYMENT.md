# Deployment Guide

Complete guide for deploying Screenshot API to production.

## Deployment Options

| Platform | Difficulty | Cost | Best For |
|----------|------------|------|----------|
| Docker | Easy | Self-hosted | Full control, any cloud |
| Railway | Easy | $5+/mo | Quick deployment |
| Render | Easy | $7+/mo | Simple hosting |
| Heroku | Medium | $7+/mo | Familiar workflow |
| DigitalOcean | Medium | $6+/mo | Droplets, App Platform |
| AWS ECS | Hard | Variable | Enterprise scale |
| Google Cloud Run | Medium | Pay-per-use | Serverless containers |

---

## Docker Deployment (Recommended)

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- Server with 2GB+ RAM

### Step 1: Build Production Image

```bash
# Clone repository
git clone https://github.com/mahmoodhamdi/Screenshot-API.git
cd Screenshot-API

# Build image
docker build -t screenshot-api:latest .
```

### Step 2: Create Environment File

```bash
# Create production environment file
cat > .env.production << EOF
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://mongo:27017/screenshot-api

# Authentication (CHANGE THESE!)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
EOF
```

### Step 3: Deploy with Docker Compose

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  api:
    image: screenshot-api:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - mongo
      - redis
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: always

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    restart: always

volumes:
  mongo_data:
  redis_data:
```

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

---

## Railway Deployment

### Step 1: Connect Repository

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository

### Step 2: Add Services

```bash
# Using Railway CLI
railway login
railway init
railway add --database mongodb
railway add --database redis
```

### Step 3: Set Environment Variables

In Railway dashboard:
```
NODE_ENV=production
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

### Step 4: Deploy

```bash
railway up
```

---

## Render Deployment

### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository

### Step 2: Configure Build

```yaml
# render.yaml
services:
  - type: web
    name: screenshot-api
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
```

### Step 3: Add MongoDB

1. Create MongoDB database (or use MongoDB Atlas)
2. Copy connection string
3. Add as `MONGODB_URI` environment variable

---

## Heroku Deployment

### Step 1: Create App

```bash
# Login to Heroku
heroku login

# Create app
heroku create screenshot-api-prod

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://github.com/jontewks/puppeteer-heroku-buildpack
```

### Step 2: Add Add-ons

```bash
# MongoDB
heroku addons:create mongolab:sandbox

# Redis (optional)
heroku addons:create heroku-redis:mini
```

### Step 3: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -hex 32)
```

### Step 4: Deploy

```bash
git push heroku main
```

### Step 5: Verify

```bash
heroku open
heroku logs --tail
```

---

## AWS ECS Deployment

### Step 1: Create ECR Repository

```bash
aws ecr create-repository --repository-name screenshot-api
```

### Step 2: Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag screenshot-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/screenshot-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/screenshot-api:latest
```

### Step 3: Create Task Definition

```json
{
  "family": "screenshot-api",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/screenshot-api:latest",
      "memory": 2048,
      "cpu": 1024,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "environment": [
        { "name": "NODE_ENV", "value": "production" }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:screenshot-api/jwt-secret"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      }
    }
  ]
}
```

### Step 4: Create ECS Service

```bash
aws ecs create-service \
  --cluster default \
  --service-name screenshot-api \
  --task-definition screenshot-api \
  --desired-count 2 \
  --launch-type FARGATE
```

---

## Google Cloud Run Deployment

### Step 1: Build and Push Image

```bash
# Build image
gcloud builds submit --tag gcr.io/PROJECT_ID/screenshot-api

# Or use Docker
docker build -t gcr.io/PROJECT_ID/screenshot-api .
docker push gcr.io/PROJECT_ID/screenshot-api
```

### Step 2: Deploy to Cloud Run

```bash
gcloud run deploy screenshot-api \
  --image gcr.io/PROJECT_ID/screenshot-api \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-secrets JWT_SECRET=jwt-secret:latest
```

---

## Production Checklist

### Security

- [ ] **Strong Secrets**: JWT_SECRET and JWT_REFRESH_SECRET are 32+ characters
- [ ] **HTTPS Only**: SSL/TLS certificate configured
- [ ] **CORS Origins**: Set specific allowed origins, not `*`
- [ ] **Rate Limiting**: Enabled and properly configured
- [ ] **Database Auth**: MongoDB authentication enabled
- [ ] **Redis Auth**: Redis password set (if applicable)
- [ ] **Firewall**: Only necessary ports exposed (443, 80)
- [ ] **No Debug**: `NODE_ENV=production`, no debug logs exposed

### Performance

- [ ] **Compression**: Response compression enabled (default: yes)
- [ ] **Browser Pool**: Appropriate pool size for traffic
- [ ] **Timeouts**: Reasonable timeout values set
- [ ] **Caching**: Redis caching enabled
- [ ] **CDN**: Static assets served via CDN (if applicable)

### Monitoring

- [ ] **Logging**: Log aggregation configured (ELK, CloudWatch, etc.)
- [ ] **Health Checks**: `/health` endpoint monitored
- [ ] **Error Tracking**: Sentry or similar configured
- [ ] **Uptime Monitoring**: External uptime checks (UptimeRobot, etc.)
- [ ] **Alerts**: Email/Slack alerts for errors

### Backup & Recovery

- [ ] **Database Backup**: Automated MongoDB backups
- [ ] **S3 Lifecycle**: Screenshot retention policies
- [ ] **Recovery Plan**: Documented disaster recovery procedure
- [ ] **Secrets Backup**: Secure backup of environment variables

---

## SSL/HTTPS Setup

### Using nginx (Recommended)

```nginx
# /etc/nginx/sites-available/screenshot-api
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }
}
```

### Using Let's Encrypt

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.example.com

# Auto-renewal (usually set up automatically)
sudo certbot renew --dry-run
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  api:
    image: screenshot-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 2G
    environment:
      - NODE_ENV=production
    depends_on:
      - mongo
      - redis

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

  mongo:
    image: mongo:7
    deploy:
      replicas: 3
    command: mongod --replSet rs0

  redis:
    image: redis:alpine
```

### Vertical Scaling

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Increase browser pool size (in config)
BROWSER_POOL_SIZE=10
```

---

## Monitoring & Logging

### Health Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Basic health check |
| `GET /` | API info and status |
| `GET /api/v1/health` | API version health |

### Log Format

Logs are output in JSON format:

```json
{
  "level": "info",
  "message": "Screenshot captured successfully",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "abc-123",
  "duration": 2340,
  "userId": "user-id"
}
```

### Log Aggregation

**AWS CloudWatch:**
```bash
# Install CloudWatch agent
aws logs create-log-group --log-group-name /screenshot-api/production
```

**ELK Stack:**
```yaml
# docker-compose.logging.yml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
  logstash:
    image: logstash:8.11.0
  kibana:
    image: kibana:8.11.0
```

### Metrics

Available via Analytics API:
- Total screenshots
- Success/failure rates
- Average response times
- Error breakdown

---

## Troubleshooting Production

### High Memory Usage

```bash
# Check memory
docker stats

# Restart containers
docker-compose restart api

# Reduce browser pool
BROWSER_POOL_SIZE=3
```

### Slow Response Times

1. Check MongoDB indexes
2. Enable Redis caching
3. Increase instance size
4. Add more replicas

### Connection Timeouts

```bash
# Check network
docker network inspect screenshot-api_default

# Check service health
docker-compose exec api curl http://localhost:3000/health
```

### Database Issues

```bash
# Check MongoDB status
docker-compose exec mongo mongosh --eval "rs.status()"

# Check connections
docker-compose exec mongo mongosh --eval "db.serverStatus().connections"
```

---

## Zero-Downtime Deployment

### Using Docker Compose

```bash
# Pull new image
docker-compose pull

# Restart with zero downtime
docker-compose up -d --no-deps --scale api=2 api

# Wait for health checks
sleep 30

# Remove old containers
docker-compose up -d --no-deps --scale api=1 api
```

### Using Kubernetes

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: screenshot-api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/mahmoodhamdi/Screenshot-API/issues)
- **Documentation**: [API Docs](http://localhost:3000/docs)
- **Email**: hmdy7486@gmail.com
