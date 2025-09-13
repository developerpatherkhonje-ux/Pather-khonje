# Pather Khonje - Vercel Deployment Guide

This guide will help you deploy the Pather Khonje travel agency application on Vercel.

## 🚀 Quick Deployment

### 1. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/pather-khonjes-projects)
2. Click "Import Project"
3. Connect your GitHub repository: `https://github.com/developerpatherkhonje-ux/Pather-khonje`

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Database Configuration
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pather-khonje?retryWrites=true&w=majority
```

#### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
JWT_EXPIRE=24h
```

#### Security Configuration
```
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-key-here
COOKIE_SECRET=your-cookie-secret-key-here
```

#### Admin Users
```
ADMIN_EMAIL=admin@patherkhonje.com
ADMIN_PASSWORD=admin@123
ADMIN_NAME=Superadmin

MANAGER_EMAIL=rajdip.mitra@patherkhonje.com
MANAGER_PASSWORD=rajdip@123
MANAGER_NAME=Rajdip Mitra

PROPRIETOR_EMAIL=somashah.mitra@patherkhonje.com
PROPRIETOR_PASSWORD=somashah@123
PROPRIETOR_NAME=Somashah Mitra
```

#### Frontend Configuration
```
VITE_API_URL=/api
VITE_APP_NAME=Pather Khonje
VITE_APP_VERSION=1.0.0
```

### 3. Deploy

1. Click "Deploy" in Vercel
2. Wait for the deployment to complete
3. Your app will be available at: `https://your-project-name.vercel.app`

## 📁 Project Structure

```
pather-khonje/
├── api/                    # Vercel serverless functions
│   ├── index.js           # Main API handler
│   └── package.json       # API dependencies
├── frontend/              # React frontend
│   ├── src/               # Source code
│   ├── dist/              # Build output (auto-generated)
│   └── package.json       # Frontend dependencies
├── backend/               # Original backend (for reference)
├── vercel.json           # Vercel configuration
└── vercel.env.example    # Environment variables template
```

## 🔧 Configuration Details

### Vercel Configuration (vercel.json)
- **Frontend**: Built as static site from `frontend/dist`
- **Backend**: Deployed as serverless functions in `api/`
- **Routes**: API calls go to `/api/*`, everything else serves the frontend

### API Endpoints
All API endpoints are prefixed with `/api/`:
- `/api/auth/*` - Authentication routes
- `/api/admin/*` - Admin routes
- `/api/places/*` - Places management
- `/api/hotels/*` - Hotels management
- `/api/packages/*` - Packages management
- `/api/upload/*` - File upload routes
- `/api/health` - Health check

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start frontend development server
cd frontend
npm run dev

# Start backend development server
cd ../backend
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/dist/
```

## 🔒 Security Features

- **CORS**: Configured for Vercel domains
- **Rate Limiting**: Applied to all API routes
- **Helmet**: Security headers
- **Input Sanitization**: MongoDB injection and XSS protection
- **JWT Authentication**: Secure token-based auth
- **Session Management**: Secure session handling

## 📊 Monitoring

- **Health Check**: Available at `/api/health`
- **Error Logging**: Winston logger configured
- **Audit Logs**: User action tracking
- **Security Events**: Login attempts and security violations

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `MONGODB_URI` environment variable
   - Ensure MongoDB Atlas allows connections from Vercel IPs

2. **CORS Errors**
   - Verify frontend URL is added to allowed origins
   - Check if API calls are using correct `/api/` prefix

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Authentication Issues**
   - Verify JWT secrets are set correctly
   - Check session configuration

### Support

For issues or questions:
- Check the logs in Vercel dashboard
- Review environment variables
- Test API endpoints individually

## 🎯 Features Included

- ✅ User Authentication & Authorization
- ✅ Hotel Management System
- ✅ Package Management System
- ✅ Places Management System
- ✅ File Upload System
- ✅ Admin Dashboard
- ✅ Responsive Design
- ✅ Security Middleware
- ✅ Error Handling
- ✅ Logging & Monitoring

## 📱 Mobile Responsive

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) features

---

**Ready to deploy?** Follow the steps above and your Pather Khonje application will be live on Vercel! 🚀
