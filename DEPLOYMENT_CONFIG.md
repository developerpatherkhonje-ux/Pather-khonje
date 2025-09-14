# Deployment Configuration Guide

## Environment Variables Setup

### Frontend (Vercel)

Set these environment variables in your Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
VITE_API_URL=https://pather-khonje.onrender.com/api
VITE_APP_NAME=Pather Khonje
VITE_APP_VERSION=1.0.0
```

### Backend (Render)

Set these environment variables in your Render dashboard:

1. Go to your service in Render dashboard
2. Navigate to Environment tab
3. Add the following variables:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
SESSION_SECRET=your_session_secret
COOKIE_SECRET=your_cookie_secret
FRONTEND_URL=https://www.patherkhonje.com
ALLOWED_ORIGINS=https://www.patherkhonje.com,https://patherkhonje.com,https://pather-khonje.vercel.app
```

## CORS Configuration

The backend has been configured to allow requests from:
- `https://www.patherkhonje.com`
- `https://patherkhonje.com`
- `https://pather-khonje.vercel.app`
- Any Vercel deployment URL (wildcard pattern)

## Troubleshooting

If you're still experiencing issues:

1. Check browser console for CORS errors
2. Verify environment variables are set correctly
3. Ensure backend is running and accessible
4. Check Render logs for any errors
5. Test API endpoint directly: `https://pather-khonje.onrender.com/api/health`
