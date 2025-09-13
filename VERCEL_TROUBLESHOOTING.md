# Vercel Deployment Troubleshooting Guide

## Current Issue Analysis

### Build Warnings (Non-Critical):
1. **npm warn deprecated rimraf@3.0.2** - This is just a warning about an outdated dependency
2. **npm warn deprecated inflight@1.0.6** - Another deprecation warning
3. **npm warn deprecated glob@7.2.3** - Deprecation warning
4. **Browserslist: caniuse-lite is outdated** - Database needs updating

### ✅ Fixes Applied:
1. **Added postinstall script** to update browserslist database
2. **Created vercel.json** configuration file
3. **Updated vite.config.js** with better production settings
4. **Added chunk size warning limit** to prevent build failures

## Vercel Configuration

### Environment Variables (Set in Vercel Dashboard):
```
VITE_API_URL=https://pather-khonje.onrender.com/api
VITE_APP_NAME=Pather Khonje
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### Build Settings:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Common Vercel Deployment Issues & Solutions

### 1. Build Command Issues
**Problem**: Build fails with "command not found"
**Solution**: Ensure build command is `npm run build` (not `vite build`)

### 2. Environment Variables Not Loading
**Problem**: API calls fail because environment variables aren't loaded
**Solution**: 
- Set variables in Vercel dashboard
- Use `VITE_` prefix for client-side variables
- Redeploy after adding variables

### 3. Routing Issues (SPA)
**Problem**: Direct URL access returns 404
**Solution**: The `vercel.json` file handles this with rewrites

### 4. Chunk Size Warnings
**Problem**: Build fails due to large chunks
**Solution**: Updated vite.config.js with `chunkSizeWarningLimit: 1000`

### 5. Dependency Issues
**Problem**: Outdated dependencies causing warnings
**Solution**: Added postinstall script to update browserslist

## Step-by-Step Vercel Deployment

### 1. Update Vercel Settings:
1. Go to your Vercel project dashboard
2. Go to Settings → General
3. Set **Root Directory** to `frontend`
4. Go to Settings → Environment Variables
5. Add all required environment variables

### 2. Redeploy:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Or push new commit to trigger automatic deployment

### 3. Verify Deployment:
1. Check build logs for errors
2. Test your deployed URL
3. Verify API connections work

## Debugging Steps

### If Build Still Fails:

1. **Check Build Logs**:
   - Look for specific error messages
   - Check if it's a dependency issue
   - Verify environment variables are set

2. **Test Locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

3. **Check Dependencies**:
   ```bash
   npm audit
   npm outdated
   ```

4. **Clear Cache**:
   - In Vercel dashboard, go to Settings → Functions
   - Clear build cache
   - Redeploy

## Alternative Deployment Options

### If Vercel Continues to Have Issues:

#### Option 1: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set **Base Directory** to `frontend`
4. **Build Command**: `npm run build`
5. **Publish Directory**: `dist`

#### Option 2: Render Static Site
1. Go to [render.com](https://render.com)
2. Create "Static Site"
3. Connect GitHub repository
4. Set **Root Directory** to `frontend`
5. **Build Command**: `npm run build`
6. **Publish Directory**: `dist`

## Expected Build Output

A successful build should show:
```
✓ transforming...
✓ building for production...
✓ built in X.XXs
```

## Next Steps

1. **Commit the fixes** to GitHub
2. **Redeploy** on Vercel
3. **Test** the deployed application
4. **Monitor** for any remaining issues

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/
- **Build Logs**: Available in Vercel dashboard
