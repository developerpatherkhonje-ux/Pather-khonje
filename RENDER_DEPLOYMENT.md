# Render Deployment Guide for Pather Khonje Backend

## Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas account (for production database)

## Step-by-Step Deployment Process

### 1. Prepare Your Repository
✅ **Already Done**: Your backend is ready with:
- Updated `package.json` with production scripts
- Updated `config.js` for production environment
- Created `render.yaml` configuration file
- Created `env.production` example file

### 2. Create Render Account and Connect GitHub
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 3. Create a New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:

#### Basic Settings:
- **Name**: `pather-khonje-backend`
- **Environment**: `Node`
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Advanced Settings:
- **Plan**: Free (or choose paid plan for better performance)
- **Auto-Deploy**: Yes (deploys automatically on git push)

### 4. Set Environment Variables
In Render dashboard, go to Environment tab and add these variables:

#### Required Variables (Mark as "Secret" for sensitive data):
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://developerpatherkhonje_db_user:RGmlrQBp1w3nTJm9@cluster0.laqjbze.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=e2c5188c473409104d7cbc226e11aa4f2fe2e51ab59511b9b1a4a2ce3f9e3ac3e907b98996447809b34d3bc63d9c27aef7b0d2d0664535228030a4c3e51703fb
JWT_REFRESH_SECRET=de0a762d84fabe9e33160d831ce7bb2e3e98e4b4d630d785b522fab97357e2fe5949b4d651b6a98549f56524d1d11650242311db7aeffe875f7dfacc4d2fd105
SESSION_SECRET=9dc8e337d9fd8e8c4903edaad8e29d5f7e3b69719729810fa446b7c23a749ae6f77fe8eef568024bd17f2a326acb09c8ecbba50db25555741c3c28e1731aa6ca
COOKIE_SECRET=4e82bcfe9a26309565b9deefff07a66f2e4cd0246b4f8c4f2a3b319e5830968529599f6607d0ef5204fc9dc2809adbce6f004665d74f77cd43fe337137aa58f0
```

#### Admin Configuration:
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

#### CORS Configuration (Update with your actual frontend URLs):
```
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-admin-domain.com
```

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Start your application (`npm start`)
   - Provide you with a public URL

### 6. Test Your Deployment
1. Wait for deployment to complete (usually 2-5 minutes)
2. Check the logs for any errors
3. Test the health endpoint: `https://your-app-name.onrender.com/api/health`
4. Test API endpoints to ensure they're working

### 7. Configure Custom Domain (Optional)
1. Go to Settings → Custom Domains
2. Add your custom domain
3. Update DNS records as instructed by Render

## Important Notes

### Security Considerations:
- ✅ All sensitive data is marked as "Secret" in Render
- ✅ Production rate limits are lower than development
- ✅ CORS is configured for production domains
- ✅ Strong JWT secrets are used

### Performance Optimization:
- ✅ Compression middleware enabled
- ✅ Database indexes created
- ✅ Rate limiting configured
- ✅ Security headers with Helmet

### Monitoring:
- ✅ Winston logging configured
- ✅ Health check endpoint available
- ✅ Error handling implemented

## Troubleshooting

### Common Issues:
1. **Build Fails**: Check if all dependencies are in `package.json`
2. **Database Connection Error**: Verify MongoDB URI is correct
3. **CORS Errors**: Update `ALLOWED_ORIGINS` with your frontend URL
4. **Port Issues**: Ensure `PORT` environment variable is set

### Logs:
- Check Render dashboard → Logs tab for real-time logs
- Check your MongoDB Atlas logs for database issues

## Next Steps After Deployment:
1. Update your frontend to use the new API URL
2. Test all functionality thoroughly
3. Set up monitoring and alerts
4. Configure backup strategies
5. Consider upgrading to paid plan for better performance

## Support:
- Render Documentation: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
- Your backend logs are available in Render dashboard
