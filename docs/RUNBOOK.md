# Operations Runbook

This document provides operational procedures for the Screenshot API service.

## Table of Contents

- [Service Overview](#service-overview)
- [Health Checks](#health-checks)
- [Common Issues & Solutions](#common-issues--solutions)
- [Deployment](#deployment)
- [Scaling](#scaling)
- [Backup & Recovery](#backup--recovery)
- [Security Incidents](#security-incidents)
- [Monitoring & Alerting](#monitoring--alerting)

---

## Service Overview

### Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Load Balancer │────▶│  Screenshot API  │────▶│    MongoDB      │
│   (nginx/ALB)   │     │  (Node.js)       │     │                 │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │     Redis       │     │   S3 Storage    │
                        │  (Cache/Queue)  │     │  (Screenshots)  │
                        └─────────────────┘     └─────────────────┘
```

### Key Components

| Component | Purpose | Port | Dependencies |
|-----------|---------|------|--------------|
| API Server | Main application | 3000 | MongoDB, Redis |
| MongoDB | Primary database | 27017 | - |
| Redis | Cache & rate limiting | 6379 | - |
| Puppeteer | Screenshot capture | - | Chromium |

### Service Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/health` | Comprehensive health check |
| `/health/live` | Kubernetes liveness probe |
| `/health/ready` | Kubernetes readiness probe |
| `/health/startup` | Kubernetes startup probe |

---

## Health Checks

### Checking Service Status

```bash
# Comprehensive health check
curl -s https://api.screenshot-api.com/health | jq .

# Liveness probe
curl -s https://api.screenshot-api.com/health/live

# Readiness probe
curl -s https://api.screenshot-api.com/health/ready
```

### Health Status Meanings

| Status | HTTP Code | Action Required |
|--------|-----------|-----------------|
| `healthy` | 200 | None |
| `degraded` | 200 | Monitor, may need investigation |
| `unhealthy` | 503 | Immediate investigation required |

### Service-Specific Checks

```bash
# Check MongoDB
mongosh --eval "db.adminCommand('ping')"

# Check Redis
redis-cli ping

# Check API response
curl -w "@curl-format.txt" -o /dev/null -s https://api.screenshot-api.com/health
```

---

## Common Issues & Solutions

### 1. High Memory Usage

**Symptoms:**
- OOM errors in logs
- Slow response times
- Container restarts

**Investigation:**
```bash
# Check memory usage
docker stats screenshot-api

# Check for memory leaks
curl -s localhost:3000/health?details=true | jq '.services'
```

**Solutions:**
1. Restart the service to clear memory
2. Reduce `PUPPETEER_MAX_CONCURRENT` (default: 5)
3. Enable page cache cleanup in puppeteer config
4. Increase container memory limits

### 2. MongoDB Connection Issues

**Symptoms:**
- `unhealthy` status in /health
- "MongoNetworkError" in logs
- 503 responses

**Investigation:**
```bash
# Check MongoDB connectivity
mongosh --eval "db.adminCommand('ping')" --quiet

# Check connection pool
curl -s localhost:3000/health | jq '.services.mongodb'
```

**Solutions:**
1. Verify `MONGODB_URI` is correct
2. Check MongoDB server status
3. Verify network connectivity
4. Check connection pool limits

### 3. Redis Connection Issues

**Symptoms:**
- `degraded` status (service continues with fallback)
- Increased latency
- Rate limiting may be less accurate

**Investigation:**
```bash
# Check Redis connectivity
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# Check circuit breaker state
curl -s localhost:3000/health | jq '.services.rateLimiter'
```

**Solutions:**
1. Service continues with in-memory fallback
2. Verify Redis host/port configuration
3. Check Redis server memory
4. Restart Redis if unresponsive

### 4. Screenshot Failures

**Symptoms:**
- High error rate in analytics
- Timeout errors
- "Navigation timeout" errors

**Investigation:**
```bash
# Check recent failures
curl -s "https://api.screenshot-api.com/api/v1/analytics/screenshots?status=failed"

# Check browser pool
docker exec screenshot-api ps aux | grep chromium
```

**Solutions:**
1. Increase `PUPPETEER_TIMEOUT` (default: 30000ms)
2. Check target URL accessibility
3. Reduce concurrent screenshots
4. Restart to clear zombie browser processes

### 5. Rate Limiting Issues

**Symptoms:**
- Many 429 responses
- Circuit breaker in OPEN state
- Fallback mode active

**Investigation:**
```bash
# Check rate limiter state
curl -s localhost:3000/health | jq '.services.rateLimiter'
```

**Solutions:**
1. If Redis is down, service uses in-memory fallback
2. Wait for circuit breaker to transition to HALF_OPEN
3. Fix underlying Redis issue
4. Increase rate limits if legitimate traffic

---

## Deployment

### Pre-Deployment Checklist

- [ ] All tests passing in CI
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backup taken
- [ ] Monitoring alerts configured

### Deployment Steps

```bash
# 1. Pull latest image
docker pull ghcr.io/your-org/screenshot-api:latest

# 2. Stop current container (graceful)
docker stop screenshot-api --time 30

# 3. Start new container
docker run -d \
  --name screenshot-api \
  -p 3000:3000 \
  --env-file .env \
  ghcr.io/your-org/screenshot-api:latest

# 4. Verify health
curl -s localhost:3000/health/ready

# 5. Check logs for errors
docker logs screenshot-api --tail 100
```

### Kubernetes Deployment

```bash
# Update image
kubectl set image deployment/screenshot-api \
  screenshot-api=ghcr.io/your-org/screenshot-api:$TAG

# Monitor rollout
kubectl rollout status deployment/screenshot-api

# Rollback if needed
kubectl rollout undo deployment/screenshot-api
```

### Rollback Procedure

```bash
# Docker
docker stop screenshot-api
docker run -d --name screenshot-api-old \
  -p 3000:3000 \
  ghcr.io/your-org/screenshot-api:$PREVIOUS_TAG

# Kubernetes
kubectl rollout undo deployment/screenshot-api
```

---

## Scaling

### Horizontal Scaling

```bash
# Kubernetes
kubectl scale deployment/screenshot-api --replicas=3

# Docker Compose
docker-compose up -d --scale screenshot-api=3
```

### Vertical Scaling

Adjust container resources:

```yaml
# Kubernetes
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

### Scaling Considerations

| Resource | Recommendation |
|----------|----------------|
| CPU | 0.5-2 cores per instance |
| Memory | 512MB-2GB per instance |
| Puppeteer concurrent | 2-5 per instance |
| MongoDB connections | 10-50 per instance |
| Redis connections | 10-20 per instance |

---

## Backup & Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --uri="$MONGODB_URI" --out=/backup/$(date +%Y%m%d)

# Automated backup script
0 0 * * * /scripts/backup-mongodb.sh
```

### Database Recovery

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" /backup/20241230/

# Point-in-time recovery (if using replica set)
mongorestore --oplogReplay --oplogLimit <timestamp>
```

### Screenshot Storage

S3 screenshots are retained based on user plan:
- Free: 7 days
- Starter: 30 days
- Professional: 90 days
- Enterprise: 1 year

---

## Security Incidents

### Suspected Breach

1. **Immediate Actions:**
   ```bash
   # Rotate all secrets
   # JWT_SECRET, JWT_REFRESH_SECRET, API keys

   # Invalidate all sessions
   redis-cli FLUSHDB

   # Rotate webhook secrets
   # Notify affected users
   ```

2. **Investigation:**
   - Check audit logs
   - Review access patterns
   - Identify compromised accounts

3. **Recovery:**
   - Force password reset for affected users
   - Regenerate API keys
   - Document incident

### DDoS Attack

1. **Identify Attack:**
   - Check rate limiting metrics
   - Review access logs for patterns

2. **Mitigation:**
   ```bash
   # Block suspicious IPs at load balancer
   # Enable stricter rate limits
   # Scale up instances if needed
   ```

---

## Monitoring & Alerting

### Key Metrics to Monitor

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| CPU Usage | 70% | 90% |
| Memory Usage | 70% | 90% |
| Response Time (p95) | 1000ms | 3000ms |
| Error Rate | 1% | 5% |
| Redis Latency | 50ms | 100ms |
| MongoDB Latency | 100ms | 500ms |

### Alert Conditions

| Alert | Condition | Action |
|-------|-----------|--------|
| High Error Rate | >5% errors over 5min | Investigate immediately |
| Service Unhealthy | /health returns 503 | Check MongoDB |
| High Latency | p95 >3s | Scale or investigate |
| Memory Critical | >90% | Restart or scale |
| Redis Down | Circuit breaker OPEN | Fix Redis, service continues |

### Log Locations

```bash
# Application logs
docker logs screenshot-api

# Access logs (if using nginx)
/var/log/nginx/access.log

# System logs
journalctl -u screenshot-api
```

### Useful Queries

```bash
# Count errors in last hour
docker logs screenshot-api --since 1h 2>&1 | grep -c "error"

# Find slow requests
docker logs screenshot-api --since 1h 2>&1 | grep "X-Response-Time" | awk '$NF > 1000'

# Check rate limit hits
docker logs screenshot-api --since 1h 2>&1 | grep "rate limit"
```

---

## Contact & Escalation

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 | On-call engineer | 15 minutes |
| L2 | Senior engineer | 30 minutes |
| L3 | Tech lead | 1 hour |

### Escalation Criteria

- **L2**: Issue not resolved within 30 minutes
- **L3**: Major outage affecting >50% of users
- **Executive**: Security breach or data loss

---

## Appendix

### Environment Variables Reference

See `.env.example` for complete list.

### Useful Commands

```bash
# View running config
docker exec screenshot-api printenv | grep -E "^(NODE_|MONGODB_|REDIS_)"

# Check disk space
df -h

# Check open connections
netstat -an | grep 3000 | wc -l

# Monitor in real-time
docker stats screenshot-api
```
