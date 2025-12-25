# Setup Guide

Complete guide for setting up the Screenshot API development environment.

## Prerequisites

### Required Software

| Software | Version | Description |
|----------|---------|-------------|
| Node.js | 20.0.0+ | JavaScript runtime |
| npm | 10.0.0+ | Package manager |
| MongoDB | 7.0+ | Primary database |
| Git | 2.40+ | Version control |

### Optional Software

| Software | Version | Description |
|----------|---------|-------------|
| Redis | 7.0+ | Caching and rate limiting (recommended) |
| Docker | 24.0+ | Containerized deployment |
| Docker Compose | 2.20+ | Multi-container orchestration |

### System Requirements

- **OS**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **RAM**: Minimum 4GB (8GB recommended for Puppeteer)
- **Disk**: 2GB free space
- **CPU**: 2+ cores recommended

---

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/mahmoodhamdi/Screenshot-API.git
cd Screenshot-API
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Express.js (web framework)
- Puppeteer (screenshot capture)
- Mongoose (MongoDB ODM)
- And 50+ other packages

### Step 3: Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
# Windows: notepad .env
# macOS/Linux: nano .env
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/screenshot-api` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-jwt-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) | `your-refresh-secret-key-min-32-chars` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REDIS_HOST` | Redis server host | `localhost` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password | - |
| `STRIPE_SECRET_KEY` | Stripe API key for payments | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | - |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key | - |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET` | S3 bucket name for screenshots | - |
| `LOG_LEVEL` | Logging level | `info` |

### Example `.env` File

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/screenshot-api

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=debug
```

---

## Database Setup

### MongoDB Setup

#### Option 1: Using Docker (Recommended)

```bash
# Start MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7

# Verify it's running
docker ps
```

#### Option 2: Local Installation

**Windows:**
1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Start MongoDB service

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Option 3: MongoDB Atlas (Cloud)

1. Create free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### Redis Setup (Optional)

#### Option 1: Using Docker

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:alpine
```

#### Option 2: Local Installation

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with:
- Hot reloading (auto-restart on file changes)
- Debug logging enabled
- TypeScript compilation on-the-fly

Server will be available at: `http://localhost:3000`

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Using Docker

```bash
# Start all services (API, MongoDB, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## Verify Installation

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "service": "screenshot-api",
  "version": "v1",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. API Documentation

Open in browser: [http://localhost:3000/docs](http://localhost:3000/docs)

You should see the Swagger UI with dark theme.

### 3. Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

All 533 tests should pass.

### 4. Register a Test User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests with coverage |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run test:e2e` | Run E2E tests only |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Check for linting issues |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Check TypeScript types |

---

## VS Code Setup (Recommended)

### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "mongodb.mongodb-vscode",
    "ms-azuretools.vscode-docker",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Recommended Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## Troubleshooting

### MongoDB Connection Failed

**Symptoms:**
- Error: `MongooseServerSelectionError`
- Error: `ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   docker ps  # If using Docker
   mongod --version  # If installed locally
   ```
2. Check `MONGODB_URI` in `.env`
3. Ensure MongoDB port 27017 is not blocked

### Redis Connection Failed

**Symptoms:**
- Warning: `Redis connection failed`

**Solutions:**
1. Redis is optional - the app works without it
2. If needed, verify Redis is running:
   ```bash
   docker ps  # If using Docker
   redis-cli ping  # Should return PONG
   ```
3. Check `REDIS_HOST` and `REDIS_PORT` in `.env`

### Puppeteer/Chrome Issues

**Symptoms:**
- Error: `Failed to launch the browser process`
- Error: `Could not find Chrome`

**Solutions:**

**Linux:**
```bash
# Install Chrome dependencies
sudo apt-get install -y \
  chromium-browser \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libnss3
```

**macOS:**
```bash
# Reinstall Puppeteer with Chrome
npm install puppeteer
```

**Docker:**
Puppeteer is pre-configured in the Dockerfile with all dependencies.

### Port Already in Use

**Symptoms:**
- Error: `EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

### TypeScript Compilation Errors

**Symptoms:**
- Build fails with type errors

**Solutions:**
```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
```

### JWT Secret Too Short

**Symptoms:**
- Error: `JWT_SECRET must be at least 32 characters`

**Solutions:**
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/mahmoodhamdi/Screenshot-API/issues)
- **Documentation**: [API Docs](http://localhost:3000/docs)
- **Email**: hmdy7486@gmail.com

---

## Next Steps

1. Read the [API Documentation](http://localhost:3000/docs)
2. Create your first API key
3. Capture your first screenshot
4. For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md)
