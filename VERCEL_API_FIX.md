# Vercel API URL Issue - Root Cause and Fix

## Problem Identified

The deployed application was calling the wrong API URL:
- **Expected**: `/api/session/start` (relative URL on same domain)
- **Actual**: `https://height-dwrs0a6d6-tsang-project.vercel.app//api/session/start` (preview URL with double slash)

This caused CORS errors: "Redirect is not allowed for a preflight request"

## Root Cause

1. **Vercel Environment Variable Override**: The `VITE_API_URL` environment variable in Vercel was set to the preview deployment URL (`https://height-dwrs0a6d6-tsang-project.vercel.app/`)
2. **Environment Variable Precedence**: Vercel environment variables take precedence over `.env.production` file
3. **Empty String Check**: The original code didn't properly handle empty strings - `if (import.meta.env.VITE_API_URL)` returns true even for empty strings

## Solution Applied

### Code Fix (frontend/src/services/api.js)

Changed the environment variable check to properly handle empty strings:

```javascript
// Before
if (import.meta.env.VITE_API_URL) {
  return import.meta.env.VITE_API_URL;
}

// After
const envUrl = import.meta.env.VITE_API_URL;
if (envUrl && envUrl.trim() !== '') {
  return envUrl;
}
```

### Vercel Configuration Required

**You must delete or clear the `VITE_API_URL` environment variable in Vercel:**

1. Go to: Vercel Dashboard → Project → Settings → Environment Variables
2. Find `VITE_API_URL`
3. **Delete it** (recommended) or set to empty string

### Why This Works

- In production (`import.meta.env.PROD === true`), the code returns `''` (empty string)
- This makes all API calls use relative URLs: `/api/session/start`
- Vercel's routing (configured in `vercel.json`) routes `/api/*` to the serverless function
- No CORS issues because frontend and backend are on the same domain

## Deployment Steps

1. Commit the code fix to git
2. Push to GitHub
3. Delete `VITE_API_URL` from Vercel environment variables
4. Trigger a new deployment (or wait for auto-deploy)
5. Test the deployed application

## Verification

After deployment, check browser console:
- Should see: `API Base URL: relative (same domain)` or `API Base URL:`
- API calls should go to: `https://height-tsang-project.vercel.app/api/session/start`
- No CORS errors

## Alternative: Use Absolute URL

If you prefer to use an absolute URL instead of relative:

1. Set `VITE_API_URL` in Vercel to: `https://height-tsang-project.vercel.app`
2. Make sure there's NO trailing slash
3. The code will use this URL for all API calls

However, relative URLs are recommended for Vercel deployments as they work automatically with preview deployments and custom domains.

## Additional Fixes

### 1. Removed Rate Limiting
Rate limiting has been removed from the application as DDoS protection will be handled by Cloudflare.

**Changes:**
- Removed rate limiter import from [`backend/src/app.js`](backend/src/app.js:1)
- Removed rate limiter middleware application
- Rate limiting configuration in `config/index.js` is now unused but kept for reference

### 2. Fixed Question Counter UI
Changed "Question X of 10" to just "Question X" in [`QuestionScreen.jsx`](frontend/src/components/QuestionScreen/QuestionScreen.jsx:17) since the adaptive system doesn't have a fixed number of questions.

### 3. Trust Proxy Setting
Added `app.set('trust proxy', 1)` to [`backend/src/app.js`](backend/src/app.js:13) to enable Express to trust proxy headers from Vercel. This is required because Vercel acts as a reverse proxy.