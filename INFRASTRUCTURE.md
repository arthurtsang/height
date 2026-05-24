# Infrastructure Overview

Quick reference for the Height Quiz application infrastructure setup.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
│                                                              │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐         │
│  │ Frontend │─────▶│ Backend  │─────▶│  Redis   │         │
│  │  :5173   │      │  :3000   │      │  :6379   │         │
│  └──────────┘      └──────────┘      └──────────┘         │
│       │                  │                  │               │
│       └──────────────────┴──────────────────┘               │
│              Docker Compose Network                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION (VERCEL)                         │
│                                                              │
│  ┌──────────┐      ┌──────────────┐      ┌──────────┐     │
│  │ Frontend │─────▶│  Serverless  │─────▶│ Upstash  │     │
│  │   CDN    │      │  Functions   │      │  Redis   │     │
│  └──────────┘      └──────────────┘      └──────────┘     │
│                           │                (Optional)       │
│                           ▼                                 │
│                    ┌──────────┐                            │
│                    │  Memory  │                            │
│                    │ Fallback │                            │
│                    └──────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Components

### Frontend
- **Technology:** React + Vite
- **Local:** Port 5173 (Nginx in Docker)
- **Production:** Vercel CDN
- **Build:** Static files

### Backend
- **Technology:** Node.js + Express
- **Local:** Port 3000 (Docker container)
- **Production:** Vercel Serverless Functions
- **Features:** RESTful API, optional Redis

### Storage
- **Local:** Redis 7 (Docker container)
- **Production:** Upstash Redis (optional) or In-Memory
- **Fallback:** Automatic in-memory storage

## 🚀 Quick Commands

### Local Development

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up --build
```

### Production Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs
```

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Local development orchestration |
| `vercel.json` | Vercel deployment configuration |
| `backend/.env.example` | Environment variable template |
| `DEPLOYMENT.md` | Detailed deployment guide |

## 🌍 Environment Variables

### Required for All Environments

```bash
NODE_ENV=development|production
PORT=3000
```

### Redis Configuration

```bash
# Enable/disable Redis
REDIS_ENABLED=true|false

# Redis connection (if enabled)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional
```

### CORS Configuration

```bash
# Local
CORS_ORIGIN=http://localhost:5173

# Production
CORS_ORIGIN=https://your-app.vercel.app
```

## 📊 Storage Modes

### With Redis (Recommended)

**Local:**
- Docker Redis container
- Persistent storage
- Fast performance

**Production:**
- Upstash Redis (free tier: 10K commands/day)
- Sessions persist across function invocations
- Better for multiple concurrent users

### Without Redis (Fallback)

**Local:**
- In-memory storage
- Lost on restart
- Good for testing

**Production:**
- In-memory per function instance
- Zero cost
- Suitable for low traffic (<100 users/day)

## 🔄 Switching Storage Modes

### Enable Redis

```bash
# Docker Compose
# Edit docker-compose.yml: REDIS_ENABLED=true
docker-compose up

# Vercel
vercel env add REDIS_ENABLED
# Enter: true
vercel --prod
```

### Disable Redis

```bash
# Docker Compose
# Edit docker-compose.yml: REDIS_ENABLED=false
docker-compose up

# Vercel
vercel env add REDIS_ENABLED
# Enter: false
vercel --prod
```

## 🏥 Health Checks

### Local

```bash
curl http://localhost:3000/api/health
```

### Production

```bash
curl https://your-app.vercel.app/api/health
```

### Expected Response

```json
{
  "status": "ok",
  "timestamp": "2026-05-24T01:00:00.000Z",
  "uptime": 123.45,
  "storage": {
    "type": "redis|memory",
    "redis": {
      "enabled": true|false,
      "connected": true|false
    }
  },
  "questions": 10
}
```

## 💰 Cost Breakdown

### Local Development
- **Cost:** $0 (uses local resources)

### Production (Vercel Free Tier)
- **Bandwidth:** 100GB/month
- **Execution:** 100GB-hours/month
- **Cost:** $0/month

### Optional Upstash Redis
- **Commands:** 10,000/day
- **Storage:** 256MB
- **Cost:** $0/month

### Total
- **MVP:** $0/month
- **With Domain:** $10-15/year
- **Estimated (1000 DAU):** $0-20/month

## 🔍 Monitoring

### Docker Compose

```bash
# Resource usage
docker stats

# Container status
docker-compose ps

# Logs
docker-compose logs -f [service]
```

### Vercel

- Dashboard: https://vercel.com/dashboard
- Real-time logs
- Function metrics
- Analytics (free tier)

## 🐛 Common Issues

### Port Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Redis Connection Failed

```bash
# Check Redis status
docker-compose ps redis

# Restart Redis
docker-compose restart redis
```

### Build Fails

```bash
# Clear Docker cache
docker-compose down -v
docker-compose build --no-cache

# Check logs
docker-compose logs backend
```

## 📚 Documentation

- **Deployment Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Requirements:** [requirements/REQ-INFRA-02-docker-vercel-deployment.md](./requirements/REQ-INFRA-02-docker-vercel-deployment.md)
- **API Docs:** [backend/README.md](./backend/README.md)

## 🔐 Security

### Local Development
- No sensitive data in code
- Environment variables in `.env` (gitignored)
- CORS restricted to localhost

### Production
- HTTPS enforced
- Environment variables in Vercel dashboard
- Security headers configured
- Rate limiting enabled

## 🎯 Next Steps

1. **Local Setup:**
   ```bash
   docker-compose up
   ```

2. **Test Application:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000/api/health

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

4. **Monitor:**
   - Check health endpoint
   - Review Vercel logs
   - Monitor costs

---

**Last Updated:** 2026-05-24  
**Version:** 1.0.0  
**Maintainer:** Development Team