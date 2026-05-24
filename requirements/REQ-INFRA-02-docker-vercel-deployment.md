# REQ-INFRA-02: Docker Compose & Vercel Serverless Deployment

**Status:** Draft

**Related Work Items:** REQ-UI-01, REQ-API-01, REQ-API-03, SAD-003

---

## Persona
As a developer deploying the height quiz application,
I need support for both local Docker Compose development and Vercel serverless production deployment, with Redis being optional so the application works in both environments.

---

## Context
To support flexible deployment options for the height quiz application,

**Background:**
- Local development needs Docker Compose for full-stack testing with Redis
- Production deployment uses Vercel for serverless frontend and backend
- Vercel doesn't provide managed Redis, so Redis must be optional
- Application should gracefully degrade when Redis is unavailable
- Need cost-effective production deployment (~$0-20/month)

**Constraints:**
- Must work with and without Redis
- Vercel serverless functions have 10-second timeout
- Vercel has no persistent storage (stateless)
- Docker Compose for local development only
- Frontend must be static (Vite build)
- Backend must be serverless-compatible (Node.js)

**Dependencies:**
- REQ-API-01, REQ-API-03 (backend API)
- REQ-UI-01 (frontend)
- Docker and Docker Compose installed locally
- Vercel account (free tier sufficient)
- Optional: Upstash Redis (for production caching)

---

## Requirements

### Functional Requirements

#### 1. Docker Compose Configuration

**FR1.1: Multi-Container Setup**
- Docker Compose file defines 3 services: frontend, backend, redis
- All services connected via Docker network
- Environment variables configured per service
- Volume mounts for development hot-reload

**FR1.2: Frontend Container**
- Nginx serving Vite production build
- Port 80 exposed and mapped to host
- Proxy API requests to backend container
- Static files served efficiently

**FR1.3: Backend Container**
- Node.js Express application
- Port 3000 exposed internally
- Redis connection configured via environment variables
- Hot-reload enabled for development

**FR1.4: Redis Container**
- Redis 7.x official image
- Port 6379 exposed internally only
- Persistent volume for data
- Health check configured

**FR1.5: Development Workflow**
- `docker-compose up` starts all services
- `docker-compose down` stops and cleans up
- Logs accessible via `docker-compose logs`
- Easy to rebuild individual services

#### 2. Vercel Deployment Configuration

**FR2.1: Frontend Deployment**
- Vite build output deployed to Vercel
- Static files served via Vercel CDN
- Environment variables configured in Vercel dashboard
- Automatic HTTPS enabled

**FR2.2: Backend Serverless Functions**
- Express app converted to Vercel serverless functions
- API routes under `/api/*`
- Each endpoint as separate serverless function
- Cold start optimization applied

**FR2.3: Vercel Configuration File**
- `vercel.json` defines routing rules
- Rewrites API calls to serverless functions
- Headers configured (CORS, security)
- Build settings specified

**FR2.4: Environment Variables**
- Separate env vars for preview and production
- Redis connection optional (check if defined)
- API keys stored securely in Vercel
- Frontend env vars prefixed with `VITE_`

#### 3. Optional Redis Support

**FR3.1: Redis Abstraction Layer**
- Redis service with fallback to in-memory storage
- Check Redis availability on startup
- Graceful degradation if Redis unavailable
- Log warnings when using fallback

**FR3.2: Session Storage Strategy**
- **With Redis**: Store sessions in Redis (1-hour TTL)
- **Without Redis**: Store sessions in memory (process-scoped)
- Session interface remains consistent
- No code changes needed in controllers

**FR3.3: Caching Strategy**
- **With Redis**: Cache country statistics and questions
- **Without Redis**: Load from JSON files on each request
- Cache interface remains consistent
- Performance acceptable without Redis for low traffic

**FR3.4: Production Redis (Optional)**
- Upstash Redis for serverless compatibility
- REST API instead of TCP connection
- Free tier: 10,000 commands/day
- Configured via environment variables

#### 4. Configuration Management

**FR4.1: Environment Files**
- `.env.example` with all required variables
- `.env.local` for Docker Compose (gitignored)
- Vercel environment variables in dashboard
- Clear documentation for each variable

**FR4.2: Feature Flags**
- `REDIS_ENABLED` flag to enable/disable Redis
- `USE_MEMORY_FALLBACK` for explicit fallback
- Flags checked at runtime
- Default to safe fallback behavior

**FR4.3: Build Configuration**
- Separate build commands for local and production
- Vercel build optimizations enabled
- Source maps disabled in production
- Bundle size monitoring

### Non-Functional Requirements

#### NFR1: Performance
- **Local (Docker Compose)**:
  - Startup time < 30 seconds
  - Hot-reload < 2 seconds
  - API response time < 100ms (with Redis)
  
- **Production (Vercel)**:
  - Cold start < 3 seconds
  - Warm response < 200ms
  - Static assets via CDN (< 50ms)
  - API response < 500ms (without Redis acceptable)

#### NFR2: Reliability
- Application works without Redis (degraded but functional)
- Automatic reconnection if Redis becomes available
- No crashes when Redis unavailable
- Graceful error handling for all scenarios

#### NFR3: Developer Experience
- One command to start local environment
- Clear error messages for missing configuration
- Hot-reload for both frontend and backend
- Easy to switch between Redis and no-Redis modes

#### NFR4: Cost Optimization
- **Local**: Free (uses local resources)
- **Vercel Free Tier**:
  - 100GB bandwidth/month
  - 100GB-hours serverless execution
  - Unlimited static requests
- **Optional Upstash Redis Free Tier**:
  - 10,000 commands/day
  - 256MB storage
- **Total Production Cost**: $0-20/month

#### NFR5: Security
- No secrets in code or Docker images
- Environment variables for all sensitive data
- HTTPS enforced in production
- CORS properly configured
- Rate limiting applied

#### NFR6: Maintainability
- Single codebase for all environments
- Environment-specific configuration only
- Clear separation of concerns
- Well-documented deployment process

---

## Acceptance Criteria

### AC1: Docker Compose Startup
**Given** Docker and Docker Compose are installed
**When** developer runs `docker-compose up`
**Then** all services start successfully:
- Frontend accessible at http://localhost
- Backend API at http://localhost/api
- Redis running and connected
- No error messages in logs
- Hot-reload working for code changes

**Test Category:** @req-infra-02 @docker
**Verification:** Manual

### AC2: Docker Compose with Redis
**Given** Docker Compose is running
**When** application makes Redis calls
**Then** Redis operations succeed:
- Sessions stored in Redis
- Session TTL set to 1 hour
- Cache hits logged
- Redis health check passing

**Test Category:** @req-infra-02 @redis
**Verification:** Automated

### AC3: Docker Compose without Redis
**Given** Redis container is stopped
**When** application starts
**Then** application works with fallback:
- Warning logged about Redis unavailable
- In-memory storage used
- All API endpoints functional
- No crashes or errors

**Test Category:** @req-infra-02 @fallback
**Verification:** Automated

### AC4: Vercel Frontend Deployment
**Given** code is pushed to main branch
**When** Vercel deploys frontend
**Then** deployment succeeds:
- Build completes without errors
- Static files served via CDN
- HTTPS enabled automatically
- Environment variables loaded
- Application loads in browser

**Test Category:** @req-infra-02 @vercel
**Verification:** Manual

### AC5: Vercel Serverless Functions
**Given** backend code is deployed
**When** API endpoints are called
**Then** serverless functions work:
- All endpoints respond correctly
- Response time < 500ms (warm)
- Cold start < 3 seconds
- No timeout errors
- Logs visible in Vercel dashboard

**Test Category:** @req-infra-02 @serverless
**Verification:** Manual

### AC6: Vercel without Redis
**Given** no Redis configured in Vercel
**When** application runs in production
**Then** application works correctly:
- Sessions stored in memory (per function)
- No Redis connection attempts
- All features functional
- Performance acceptable for low traffic
- No error logs about Redis

**Test Category:** @req-infra-02 @production
**Verification:** Manual

### AC7: Vercel with Upstash Redis
**Given** Upstash Redis configured
**When** application runs in production
**Then** Redis integration works:
- REST API connection successful
- Sessions persisted across function invocations
- Cache hits improve performance
- Within free tier limits
- Fallback works if Redis unavailable

**Test Category:** @req-infra-02 @upstash
**Verification:** Manual

### AC8: Environment Variable Management
**Given** environment variables are defined
**When** application starts in any environment
**Then** configuration is correct:
- All required variables present
- Optional variables handled gracefully
- Secrets not exposed in logs
- Frontend vars prefixed with VITE_
- Clear error if required var missing

**Test Category:** @req-infra-02 @config
**Verification:** Automated

### AC9: Redis Abstraction Layer
**Given** Redis service is implemented
**When** code calls Redis methods
**Then** abstraction works correctly:
- Same interface with or without Redis
- Automatic fallback to memory
- No code changes in controllers
- Type safety maintained
- Unit tests pass for both modes

**Test Category:** @req-infra-02 @abstraction
**Verification:** Automated

### AC10: Build Optimization
**Given** production build is created
**When** build process completes
**Then** output is optimized:
- Bundle size < 500KB (frontend)
- Code splitting applied
- Tree shaking enabled
- Source maps excluded
- Vercel build succeeds

**Test Category:** @req-infra-02 @build
**Verification:** Automated

### AC11: CORS Configuration
**Given** frontend and backend deployed
**When** frontend makes API calls
**Then** CORS works correctly:
- Preflight requests succeed
- Credentials included if needed
- Allowed origins configured
- No CORS errors in browser
- Works in all environments

**Test Category:** @req-infra-02 @cors
**Verification:** Manual

### AC12: Health Checks
**Given** application is running
**When** health endpoint is called
**Then** health status is accurate:
- `/api/health` returns 200 OK
- Redis status included (connected/disconnected)
- Response time < 100ms
- Works in all environments
- Useful for monitoring

**Test Category:** @req-infra-02 @health
**Verification:** Automated

---

## Design References

- **SAD:** [designs/SAD-003-statistical-adaptive-quiz.md]
- **Docker Compose:** [docker-compose.yml]
- **Vercel Config:** [vercel.json] (to be created)
- **Redis Service:** [backend/src/services/redis.service.js]

**Design/Implementation Parity:**
- [ ] Docker Compose matches development needs
- [ ] Vercel config matches serverless requirements
- [ ] Redis abstraction layer implemented
- [ ] All environments tested

---

## Implementation Guide

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3000

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - redis
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
      - REDIS_ENABLED=true
    volumes:
      - ./backend/src:/app/src

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis-data:
```

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "REDIS_ENABLED": "false"
  }
}
```

### Redis Service Abstraction

```javascript
// backend/src/services/redis.service.js
class RedisService {
  constructor() {
    this.client = null;
    this.memoryStore = new Map();
    this.isRedisAvailable = false;
  }

  async connect() {
    if (!process.env.REDIS_ENABLED || process.env.REDIS_ENABLED === 'false') {
      console.warn('Redis disabled, using in-memory fallback');
      return;
    }

    try {
      // Attempt Redis connection
      this.client = await createRedisClient();
      this.isRedisAvailable = true;
      console.log('Redis connected successfully');
    } catch (error) {
      console.warn('Redis unavailable, using in-memory fallback:', error.message);
      this.isRedisAvailable = false;
    }
  }

  async set(key, value, ttl) {
    if (this.isRedisAvailable) {
      return this.client.setex(key, ttl, JSON.stringify(value));
    }
    // Fallback to memory
    this.memoryStore.set(key, { value, expires: Date.now() + ttl * 1000 });
  }

  async get(key) {
    if (this.isRedisAvailable) {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    }
    // Fallback to memory
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }
}
```

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | manual/docker-startup.md | @req-infra-02 Docker | Pending |
| AC2 | backend/src/services/__tests__/redis.service.test.js | @req-infra-02 Redis | Pending |
| AC3 | backend/src/services/__tests__/redis.service.test.js | @req-infra-02 Fallback | Pending |
| AC4 | manual/vercel-deploy.md | @req-infra-02 Frontend | Pending |
| AC5 | manual/vercel-deploy.md | @req-infra-02 API | Pending |
| AC6 | manual/vercel-prod.md | @req-infra-02 No Redis | Pending |
| AC7 | manual/vercel-prod.md | @req-infra-02 Upstash | Pending |
| AC8 | backend/src/config/__tests__/index.test.js | @req-infra-02 Config | Pending |
| AC9 | backend/src/services/__tests__/redis.service.test.js | @req-infra-02 Abstract | Pending |
| AC10 | manual/build-check.md | @req-infra-02 Build | Pending |
| AC11 | manual/cors-test.md | @req-infra-02 CORS | Pending |
| AC12 | backend/src/controllers/__tests__/health.controller.test.js | @req-infra-02 Health | Pending |

### Human Verification Required
- [ ] Docker Compose starts all services successfully
- [ ] Application works locally with Redis
- [ ] Application works locally without Redis
- [ ] Vercel deployment succeeds
- [ ] Production application functional
- [ ] Performance acceptable in production
- [ ] Costs within budget ($0-20/month)

---

## Definition of Done Checklist

### 1. Requirement Completeness
- [x] Context explains deployment strategy
- [x] Requirements (functional & non-functional) documented
- [x] Acceptance criteria testable and unambiguous
- [x] Design references linked
- [ ] Design/implementation parity confirmed

### 2. Tests and Traceability
- [ ] Test scenarios documented and mapped
- [ ] Test scenarios annotated with REQ-INFRA-02
- [ ] Redis abstraction layer tested
- [ ] Docker Compose tested locally
- [ ] Vercel deployment tested
- [ ] Test report documented

### 3. Code Integration
- [ ] Docker Compose file created
- [ ] Vercel configuration created
- [ ] Redis service abstraction implemented
- [ ] Environment variable handling updated
- [ ] Documentation updated

### 4. Deployment
- [ ] Docker Compose working locally
- [ ] Vercel deployment successful
- [ ] Both Redis and no-Redis modes tested
- [ ] Performance validated
- [ ] Monitoring configured

### 5. Documentation
- [ ] Docker Compose usage documented
- [ ] Vercel deployment guide created
- [ ] Environment variables documented
- [ ] Troubleshooting guide created
- [ ] Cost breakdown provided

---

## Notes

**Open Questions:**
- Should we use Upstash Redis in production or rely on memory?
- Do we need Redis for the adaptive quiz system?
- Should we implement session persistence across serverless invocations?
- Do we want preview deployments for PRs?

**Assumptions:**
- Vercel free tier sufficient for initial launch
- In-memory storage acceptable for low traffic
- Redis optional for MVP
- Single region deployment (Vercel auto-selects)
- No database needed (stateless application)

**Follow-up Items:**
- Test Upstash Redis integration - Owner: TBD, Due: TBD
- Create deployment runbook - Owner: TBD, Due: TBD
- Set up monitoring and alerts - Owner: TBD, Due: TBD
- Optimize cold start performance - Owner: TBD, Due: TBD
- Create CI/CD pipeline - Owner: TBD, Due: TBD

**Cost Breakdown:**
- **Local Development**: $0 (uses local resources)
- **Vercel Free Tier**: $0 (sufficient for MVP)
- **Upstash Redis Free Tier**: $0 (10K commands/day)
- **Custom Domain (optional)**: $10-15/year
- **Total Monthly**: $0-2/month

**Performance Expectations:**
- **With Redis**: Session lookup ~10ms, cache hit ~5ms
- **Without Redis**: Session lookup ~1ms (memory), no cache
- **Acceptable for**: <1000 daily active users
- **Scale up**: Add Upstash Redis when traffic increases