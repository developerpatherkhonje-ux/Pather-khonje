# Frontend-Backend Connection Guide

## ✅ Backend Status
Your backend is successfully deployed and running at: **https://pather-khonje.onrender.com**

### Health Check Results:
- ✅ **Status**: OK
- ✅ **Environment**: production
- ✅ **Version**: 1.0.0
- ✅ **API Endpoints**: Working properly
- ✅ **Database**: Connected
- ✅ **CORS**: Configured

## 🔧 Frontend Configuration Updates

### Files Updated:
1. **`frontend/src/config/config.js`** - Updated API_BASE_URL to use deployed backend
2. **`frontend/src/services/api.js`** - Updated default API URL
3. **`frontend/env.production`** - Created production environment template

### Configuration Changes:
```javascript
// Before (Local Development)
API_BASE_URL: 'http://localhost:5000/api'

// After (Production)
API_BASE_URL: 'https://pather-khonje.onrender.com/api'
```

## 🚀 Deployment Options

### Option 1: Vercel Deployment (Recommended)
1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

2. **Environment Variables** (in Vercel dashboard):
   ```
   VITE_API_URL=https://pather-khonje.onrender.com/api
   VITE_APP_NAME=Pather Khonje
   VITE_NODE_ENV=production
   ```

3. **Deploy**: Vercel will automatically deploy your frontend

### Option 2: Netlify Deployment
1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Import your GitHub repository
   - Set **Base Directory** to `frontend`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

2. **Environment Variables** (in Netlify dashboard):
   ```
   VITE_API_URL=https://pather-khonje.onrender.com/api
   VITE_APP_NAME=Pather Khonje
   VITE_NODE_ENV=production
   ```

### Option 3: Render Frontend Deployment
1. **Create New Static Site**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Set **Root Directory** to `frontend`

2. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://pather-khonje.onrender.com/api
   VITE_APP_NAME=Pather Khonje
   VITE_NODE_ENV=production
   ```

## 🔧 Local Development Setup

### For Local Development:
1. **Create `.env.local` file** in frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Pather Khonje
   VITE_NODE_ENV=development
   ```

2. **Start Backend** (if testing locally):
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## 🧪 Testing the Connection

### Test API Endpoints:
```bash
# Health Check
curl https://pather-khonje.onrender.com/api/health

# Get Places
curl https://pather-khonje.onrender.com/api/places

# Get Hotels
curl https://pather-khonje.onrender.com/api/hotels

# Get Packages
curl https://pather-khonje.onrender.com/api/packages
```

### Test Frontend Connection:
1. Open browser developer tools
2. Check Network tab for API calls
3. Verify requests go to `https://pather-khonje.onrender.com/api`
4. Check for CORS errors (should be none)

## 🔒 CORS Configuration

Your backend is already configured to accept requests from:
- `https://your-frontend-domain.com` (update this with your actual frontend URL)
- `http://localhost:5173` (for local development)

### Update CORS in Backend (if needed):
In Render dashboard, update environment variable:
```
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-admin-domain.com
```

## 📱 Mobile App Considerations

If you plan to create a mobile app:
- The API is already configured for mobile access
- CORS is set to allow all origins for mobile apps
- JWT authentication is ready for mobile use

## 🔍 Troubleshooting

### Common Issues:
1. **CORS Errors**: Update `ALLOWED_ORIGINS` in backend environment variables
2. **API Not Responding**: Check Render dashboard for service status
3. **Authentication Issues**: Verify JWT secrets are properly set
4. **Image Upload Issues**: Check file upload endpoints

### Debug Steps:
1. Check browser console for errors
2. Verify API URL in network requests
3. Test API endpoints directly with curl/Postman
4. Check Render logs for backend issues

## 🎯 Next Steps

1. **Deploy Frontend**: Choose one of the deployment options above
2. **Update CORS**: Set your frontend domain in backend environment variables
3. **Test Everything**: Verify all features work in production
4. **Set Up Monitoring**: Monitor both frontend and backend performance
5. **Configure Domain**: Set up custom domain for both frontend and backend

## 📞 Support

- **Backend Logs**: Available in Render dashboard
- **Frontend Logs**: Available in your hosting platform dashboard
- **API Documentation**: Available at `https://pather-khonje.onrender.com/api-docs`
