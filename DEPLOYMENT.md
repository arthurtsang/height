# Deployment Guide

This guide covers deploying the Height Quiz application using Docker Compose (local) and Vercel (production).

## Table of Contents

- [Local Development with Docker Compose](#local-development-with-docker-compose)
- [Production Deployment with Vercel](#production-deployment-with-vercel)
- [Environment Variables](#environment-variables)
- [Redis Configuration](#redis-configuration)
- [Troubleshooting](#troubleshooting)

---

## Local Development with Docker Compose

### Prerequisites

- Docker Desktop installed
- Docker Compose v2.0+
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd height
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/api/health

### Development Workflow

**Hot Reload Enabled:**
- Backend code changes in `backend/src/` automatically reload
- Frontend changes require rebuild: `docker-compose restart frontend`

**View Logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f redis
```

**Stop Services:**
```bash
# Stop and remove containers
docker-compose down

# Stop and remove volumes (clears Redis data)
docker-compose down -v
```

**Rebuild After Changes:**
```bash
# Rebuild specific service
docker-compose up --build backend

# Rebuild all services
docker-compose up --build
```

### Testing Without Redis

To test the in-memory fallback mode:

1. **Stop Redis container:**
   ```bash
   docker-compose stop redis
   ```

2. **Backend will automatically switch to memory fallback**
   - Check logs: `docker-compose logs backend`
   - Should see: "Using in-memory fallback storage"

3. **Verify health endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should show: `"type": "memory"`

---

## Production Deployment with Vercel

### Prerequisites

- Vercel account (free tier works)
- Vercel CLI installed: `npm i -g vercel`
- Git repository connected to Vercel

### Deployment Steps

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Link Project

```bash
vercel link
```

#### 4. Configure Environment Variables

In Vercel Dashboard (Settings → Environment Variables):

**Required:**
```
NODE_ENV=production
REDIS_ENABLED=false
CORS_ORIGIN=https://your-domain.vercel.app
```

**Optional (if using Upstash Redis):**
```
REDIS_ENABLED=true
REDIS_HOST=your-upstash-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
```

#### 5. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Vercel Configuration

The `vercel.json` file is already configured with:
- Static frontend serving
- Serverless backend functions
- CORS headers
- Security headers
- 10-second function timeout
- 1GB memory allocation

### Using Upstash Redis (Optional)

For better performance in production, you can add Upstash Redis:

1. **Create Upstash Account**
   - Go to https://upstash.com
   - Create a new Redis database
   - Select region closest to your users

2. **Get Connection Details**
   - Copy endpoint, port, and password
   - Add to Vercel environment variables

3. **Update Environment Variables**
   ```
   REDIS_ENABLED=true
   REDIS_HOST=your-endpoint.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

**Upstash Free Tier:**
- 10,000 commands/day
- 256MB storage
- Perfect for MVP and testing

---

## Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3000` | Server port |
| `REDIS_ENABLED` | No | `false` | Enable Redis (true/false) |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | No | - | Redis password |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Logging level |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `http://localhost:3000` | Backend API URL |

### Environment Files

**Local Development:**
- Copy `backend/.env.example` to `backend/.env`
- Modify as needed for local setup

**Docker Compose:**
- Environment variables defined in `docker-compose.yml`
- Override with `.env` file in project root

**Vercel:**
- Set in Vercel Dashboard
- Separate values for Preview and Production

---

## Redis Configuration

### With Redis (Recommended for Production)

**Advantages:**
- Sessions persist across serverless function invocations
- Better performance with caching
- Supports multiple concurrent users

**Setup:**
1. Set `REDIS_ENABLED=true`
2. Provide Redis connection details
3. Use Upstash for serverless compatibility

### Without Redis (Fallback Mode)

**Advantages:**
- Zero cost
- No external dependencies
- Simpler setup

**Limitations:**
- Sessions stored in memory (per function instance)
- No persistence across restarts
- Limited to single function instance

**When to Use:**
- MVP/testing phase
- Low traffic (<100 users/day)
- Cost-sensitive deployments

### Switching Between Modes

**Enable Redis:**
```bash
# Vercel
vercel env add REDIS_ENABLED
# Enter: true

# Docker Compose
# Edit docker-compose.yml: REDIS_ENABLED=true
docker-compose up
```

**Disable Redis:**
```bash
# Vercel
vercel env rm REDIS_ENABLED
# Or set to: false

# Docker Compose
# Edit docker-compose.yml: REDIS_ENABLED=false
docker-compose up
```

---

## Troubleshooting

### Docker Compose Issues

**Problem: Port already in use**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Find process using port
lsof -i :3000
lsof -i :6379

# Kill process or change port in docker-compose.yml
```

**Problem: Redis connection failed**
```
Redis Client Error: connect ECONNREFUSED
```

**Solution:**
```bash
# Check Redis is running
docker-compose ps

# Restart Redis
docker-compose restart redis

# Check Redis logs
docker-compose logs redis
```

**Problem: Backend not starting**
```
Failed to start server
```

**Solution:**
```bash
# Check backend logs
docker-compose logs backend

# Rebuild backend
docker-compose up --build backend

# Check environment variables
docker-compose config
```

### Vercel Deployment Issues

**Problem: Build fails**
```
Error: Build failed
```

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `vercel.json` configuration
3. Ensure all dependencies in `package.json`
4. Test build locally: `npm run build`

**Problem: Function timeout**
```
Error: Function execution timed out
```

**Solution:**
1. Optimize slow operations
2. Increase timeout in `vercel.json` (max 10s on free tier)
3. Consider upgrading Vercel plan

**Problem: CORS errors**
```
Access to fetch blocked by CORS policy
```

**Solution:**
1. Check `CORS_ORIGIN` environment variable
2. Verify `vercel.json` headers configuration
3. Ensure frontend URL matches CORS_ORIGIN

### Redis Issues

**Problem: Redis not connecting in production**
```
Redis unavailable, using in-memory fallback
```

**Solution:**
1. Verify `REDIS_ENABLED=true`
2. Check Redis credentials
3. Ensure Upstash database is active
4. Test connection with redis-cli

**Problem: Memory fallback not working**
```
TypeError: Cannot read property 'get' of undefined
```

**Solution:**
1. Update to latest code
2. Ensure Redis service properly handles fallback
3. Check logs for initialization errors

### Health Check

**Check Application Status:**
```bash
# Local
curl http://localhost:3000/api/health

# Production
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-24T01:00:00.000Z",
  "uptime": 123.45,
  "storage": {
    "type": "redis",
    "redis": {
      "enabled": true,
      "connected": true
    }
  },
  "questions": 10
}
```

---

## Performance Optimization

### Docker Compose

1. **Use BuildKit:**
   ```bash
   DOCKER_BUILDKIT=1 docker-compose build
   ```

2. **Multi-stage builds:**
   - Already configured in Dockerfiles
   - Reduces image size

3. **Volume caching:**
   - Node modules cached in volumes
   - Faster rebuilds

### Vercel

1. **Enable caching:**
   - Vercel automatically caches builds
   - Use `vercel --prod` for production builds

2. **Optimize bundle size:**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   
   # Remove unused dependencies
   npm prune --production
   ```

3. **Use CDN:**
   - Static assets automatically served via Vercel CDN
   - Images optimized automatically

---

## Monitoring

### Docker Compose

**Resource Usage:**
```bash
docker stats
```

**Container Health:**
```bash
docker-compose ps
```

### Vercel

**Deployment Logs:**
- View in Vercel Dashboard
- Real-time function logs
- Error tracking

**Analytics:**
- Vercel Analytics (free tier)
- Function invocation metrics
- Performance insights

---

## Cost Estimates

### Local Development
- **Cost:** $0 (uses local resources)

### Vercel Free Tier
- **Bandwidth:** 100GB/month
- **Function Execution:** 100GB-hours/month
- **Deployments:** Unlimited
- **Cost:** $0/month

### Upstash Redis Free Tier
- **Commands:** 10,000/day
- **Storage:** 256MB
- **Cost:** $0/month

### Total Production Cost
- **MVP:** $0/month (Vercel + Upstash free tiers)
- **With Custom Domain:** $10-15/year
- **Estimated for 1000 DAU:** $0-20/month

---

## Support

For issues or questions:
1. Check this deployment guide
2. Review application logs
3. Check health endpoint
4. Consult Vercel documentation
5. Open GitHub issue

---

**Last Updated:** 2026-05-24  
**Version:** 1.0.0