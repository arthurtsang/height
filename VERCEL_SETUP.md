# Vercel Setup Guide

Complete step-by-step guide to deploy the Height Quiz application on Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git repository with your code
- Node.js installed locally (for testing)

---

## 🚀 Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Height Quiz app"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/height.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import Project to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   
   **Framework Preset:** Other (or leave as detected)
   
   **Root Directory:** `./` (leave as default)
   
   **Build Command:**
   ```bash
   cd frontend && npm install && npm run build
   ```
   
   **Output Directory:**
   ```
   frontend/dist
   ```
   
   **Install Command:**
   ```bash
   npm install
   ```

### Step 3: Configure Environment Variables

In the "Environment Variables" section, add:

**For Production:**

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `REDIS_ENABLED` | `false` | Production |
| `CORS_ORIGIN` | `https://your-app.vercel.app` | Production |

**Optional (if using Upstash Redis):**

| Name | Value | Environment |
|------|-------|-------------|
| `REDIS_ENABLED` | `true` | Production |
| `REDIS_HOST` | `your-redis.upstash.io` | Production |
| `REDIS_PORT` | `6379` | Production |
| `REDIS_PASSWORD` | `your-password` | Production |

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Click on the deployment URL to view your app

### Step 5: Update CORS Origin

After first deployment:

1. Copy your Vercel URL (e.g., `https://height-quiz.vercel.app`)
2. Go to Settings → Environment Variables
3. Update `CORS_ORIGIN` to your actual URL
4. Redeploy: Deployments → Click "..." → "Redeploy"

---

## 🖥️ Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Link Project

```bash
# From project root
vercel link
```

Answer the prompts:
- **Set up and deploy?** Y
- **Which scope?** Select your account
- **Link to existing project?** N
- **Project name?** height-quiz (or your preferred name)
- **Directory?** ./ (press Enter)

### Step 4: Configure Environment Variables

```bash
# Add environment variables
vercel env add NODE_ENV
# Enter: production
# Select: Production

vercel env add REDIS_ENABLED
# Enter: false
# Select: Production

vercel env add CORS_ORIGIN
# Enter: https://your-app.vercel.app (update after first deploy)
# Select: Production
```

### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Step 6: Update CORS Origin

After first deployment:

```bash
# Get your deployment URL from the output
# Update CORS_ORIGIN
vercel env rm CORS_ORIGIN production
vercel env add CORS_ORIGIN
# Enter: https://your-actual-url.vercel.app
# Select: Production

# Redeploy
vercel --prod
```

---

## 🔧 Vercel Configuration Explained

The `vercel.json` file in your project root configures Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
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
  ]
}
```

**What this does:**
- Builds frontend as static files
- Routes `/api/*` to backend serverless functions
- Routes everything else to frontend
- Configures headers and security

---

## 📦 Project Structure for Vercel

Vercel expects this structure:

```
height/
├── frontend/              # Frontend code
│   ├── dist/             # Build output (generated)
│   ├── src/              # Source code
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── backend/              # Backend code
│   ├── src/              # Source code
│   │   └── index.js      # Entry point for serverless
│   └── package.json      # Backend dependencies
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json (optional)
```

---

## 🔐 Setting Up Upstash Redis (Optional)

If you want to use Redis in production:

### Step 1: Create Upstash Account

1. Go to https://upstash.com
2. Sign up (free tier available)
3. Verify email

### Step 2: Create Redis Database

1. Click "Create Database"
2. **Name:** height-quiz-redis
3. **Type:** Regional
4. **Region:** Select closest to your users
5. **TLS:** Enabled (recommended)
6. Click "Create"

### Step 3: Get Connection Details

1. Click on your database
2. Copy the following:
   - **Endpoint** (e.g., `us1-example.upstash.io`)
   - **Port** (usually `6379`)
   - **Password** (click "Show" to reveal)

### Step 4: Add to Vercel

**Via Dashboard:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add:
   - `REDIS_ENABLED` = `true`
   - `REDIS_HOST` = `your-endpoint.upstash.io`
   - `REDIS_PORT` = `6379`
   - `REDIS_PASSWORD` = `your-password`

**Via CLI:**
```bash
vercel env add REDIS_ENABLED
# Enter: true

vercel env add REDIS_HOST
# Enter: your-endpoint.upstash.io

vercel env add REDIS_PORT
# Enter: 6379

vercel env add REDIS_PASSWORD
# Enter: your-password
```

### Step 5: Redeploy

```bash
vercel --prod
```

---

## 🧪 Testing Your Deployment

### 1. Test Frontend

Visit your Vercel URL:
```
https://your-app.vercel.app
```

Should see the Height Quiz welcome screen.

### 2. Test Backend API

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Expected response:
{
  "status": "ok",
  "storage": {
    "type": "memory" or "redis",
    "redis": {
      "enabled": true/false,
      "connected": true/false
    }
  }
}
```

### 3. Test Full Flow

1. Click "Start Quiz"
2. Answer questions
3. View results
4. Check browser console for errors

---

## 🔄 Continuous Deployment

Once set up, Vercel automatically deploys:

**Automatic Deployments:**
- **Push to `main`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

**Manual Deployments:**
```bash
# Deploy current branch to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
git checkout feature-branch
vercel
```

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard

1. **Deployments Tab:**
   - View all deployments
   - See build logs
   - Check deployment status

2. **Analytics Tab:**
   - Page views
   - Top pages
   - Performance metrics

3. **Logs Tab:**
   - Real-time function logs
   - Error tracking
   - Request logs

### View Logs via CLI

```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# Filter by deployment
vercel logs <deployment-url>
```

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Command "npm run build" exited with 1`

**Solution:**
1. Check build logs in Vercel dashboard
2. Test build locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Fix any errors
4. Push changes

### API Routes Not Working

**Error:** `404 Not Found` on `/api/*`

**Solution:**
1. Verify `vercel.json` exists in project root
2. Check routes configuration
3. Ensure backend entry point is `backend/src/index.js`
4. Redeploy

### CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Update `CORS_ORIGIN` environment variable
2. Set to your actual Vercel URL
3. Redeploy
4. Clear browser cache

### Redis Connection Issues

**Error:** `Redis unavailable, using in-memory fallback`

**Solution:**
1. Check Upstash database is active
2. Verify environment variables are correct
3. Test connection from Upstash dashboard
4. Check Redis password (no extra spaces)

### Function Timeout

**Error:** `Function execution timed out`

**Solution:**
1. Optimize slow operations
2. Check for infinite loops
3. Reduce data processing
4. Consider upgrading Vercel plan (Pro: 60s timeout)

---

## 💡 Best Practices

### 1. Use Environment Variables

Never hardcode:
- API keys
- Database credentials
- URLs

Always use environment variables.

### 2. Test Locally First

Before deploying:
```bash
# Test frontend build
cd frontend && npm run build

# Test backend
cd backend && npm test

# Test with Docker Compose
docker-compose up
```

### 3. Use Preview Deployments

- Test changes in preview before production
- Share preview URLs with team
- Verify everything works

### 4. Monitor Costs

- Check Vercel usage dashboard
- Stay within free tier limits
- Set up billing alerts

### 5. Keep Dependencies Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after updates
npm test
```

---

## 📈 Scaling Considerations

### Free Tier Limits

- **Bandwidth:** 100GB/month
- **Execution:** 100GB-hours/month
- **Deployments:** Unlimited
- **Team Members:** 1

### When to Upgrade

Consider upgrading to Pro ($20/month) when:
- Traffic exceeds free tier
- Need longer function timeout (60s)
- Want team collaboration
- Need advanced analytics

### Optimization Tips

1. **Enable caching:**
   - Static assets cached automatically
   - Use Redis for session caching

2. **Optimize images:**
   - Use Vercel Image Optimization
   - Compress images before upload

3. **Reduce bundle size:**
   - Code splitting
   - Tree shaking
   - Remove unused dependencies

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

### Important URLs

- **Dashboard:** https://vercel.com/dashboard
- **Documentation:** https://vercel.com/docs
- **Status:** https://vercel-status.com
- **Support:** https://vercel.com/support

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Code pushed to GitHub
- [ ] `vercel.json` configured
- [ ] Environment variables set
- [ ] Build tested locally
- [ ] CORS origin configured
- [ ] Redis setup (if using)
- [ ] Health check endpoint working
- [ ] Frontend loads correctly
- [ ] API endpoints responding
- [ ] No console errors

After deployment:

- [ ] Test all features
- [ ] Check health endpoint
- [ ] Verify Redis connection (if using)
- [ ] Test on mobile devices
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

---

**Last Updated:** 2026-05-24  
**Version:** 1.0.0  
**For Questions:** Check DEPLOYMENT.md or INFRASTRUCTURE.md