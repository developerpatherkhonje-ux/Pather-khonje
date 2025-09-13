# Pather Khonje - Complete Setup Guide

This guide will help you set up and run the complete Pather Khonje application with authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp env.example .env

# Edit the .env file with your settings
# Important: Generate strong secrets for production!
nano .env

# Run automated setup (creates indexes, default admin, etc.)
npm run setup

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

**🔐 Security Features Included:**
- JWT Authentication with refresh tokens
- Rate limiting (100 req/15min, 5 login attempts/15min)
- Account lockout after 5 failed attempts
- Password hashing with bcryptjs (12 rounds)
- Data sanitization against NoSQL injection & XSS
- CORS protection with configurable origins
- Security headers with Helmet.js
- Session management with MongoDB store
- Comprehensive logging with Winston
- Database indexing for optimal performance

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🔐 Authentication Flow

### Initial Access
1. **First Visit**: Users see a beautiful landing page with login/signup options
2. **Login/Signup**: Users can authenticate using the login or signup forms
3. **Dashboard Access**: After authentication, users are redirected to the dashboard
4. **Website Access**: Authenticated users can access the public website via `/website` routes

### Default Admin Account
- **Email**: `admin@patherkhonje.com`
- **Password**: `admin123`
- **Role**: `admin`

⚠️ **Important**: Change the default admin password after first login!

## 📱 Application Structure

### Routes
- `/` - Landing page (shows login/signup options)
- `/login` - Login page
- `/signup` - Registration page
- `/dashboard/*` - Admin dashboard (protected)
- `/website/*` - Public website (protected)

### User Roles
- **user**: Regular user with basic access
- **manager**: Manager with elevated permissions  
- **admin**: Administrator with full access

## 🎯 Features

### Authentication System
- ✅ JWT-based authentication with refresh tokens
- ✅ Secure password hashing (bcryptjs, 12 rounds)
- ✅ Role-based access control
- ✅ Token verification and automatic refresh
- ✅ Account lockout after failed attempts
- ✅ Password strength validation
- ✅ Automatic logout on token expiry

### User Management
- ✅ User registration with comprehensive validation
- ✅ Profile management with address and preferences
- ✅ Password updates with current password verification
- ✅ Admin user management (CRUD operations)
- ✅ Account activation/deactivation
- ✅ User statistics and analytics

### Dashboard Features
- ✅ Analytics and statistics dashboard
- ✅ Hotel management system
- ✅ Package management system
- ✅ Payment vouchers management
- ✅ Invoice management system
- ✅ User profile management
- ✅ Real-time data updates

### Security Features
- ✅ Rate limiting (configurable per endpoint)
- ✅ CORS protection with whitelist
- ✅ Input validation and sanitization
- ✅ XSS and NoSQL injection protection
- ✅ Security headers (Helmet.js)
- ✅ Request/response logging
- ✅ Error handling and monitoring
- ✅ Session management with MongoDB store

### Database Features
- ✅ MongoDB with Mongoose ODM
- ✅ Database indexing for performance
- ✅ Connection pooling and error handling
- ✅ Data validation at schema level
- ✅ Automatic cleanup of expired tokens
- ✅ Backup system (basic implementation)

## 🔧 Configuration

### Backend Configuration
Edit `backend/.env` file:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://jigyansumishra000_db_user:Pai9aZYd6o0jXvTU@cluster0.lcdyqov.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration (Generate strong secrets!)
JWT_SECRET=1312185340e7ea782d1e403e6db53cb4a32a11d74c1139acdd1e091ff0df84813f86c5dae64826ed2cb5b9dd6033beab6aa230c686e51a4560e213a19a4f0a06
JWT_REFRESH_SECRET=188d617f34789c33fbc82733448f4ddc1dca6fa087f488b60f47d8fb83d742f1cf6460596a67910ce94ba7be99e5b930625e4a762ebeee9766ad45604df96086

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=d463ae9b119eb7edcdba6eed0a9dc46707de7436ae1add55c14ec24c0bef7f2c60e1678162664c75693e06fa0cd5e7a3d47e443427a33b97ad27d48ff06a0ab0
COOKIE_SECRET=8fd06b2f1a589cb0109113ac9ff8504828aa6aaaff72aac99b830ab4a19f715a652da20f6bde1acd83a25fbcce22dea96a16432fdbe935c9a0e674e1f352c2be

# Admin Configuration
ADMIN_EMAIL=admin@patherkhonje.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Super_Admin

# Account Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME_MS=1800000
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SYMBOLS=true
```

### Frontend Configuration
The frontend automatically connects to `http://localhost:5000/api` by default.

To change the API URL, set the environment variable:
```env
VITE_API_URL=http://your-backend-url/api
```

## 🗄️ Database Setup

### MongoDB Installation

**Option 1: Local MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS with Homebrew
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in `.env` file

### Database Features
- **Automatic Indexing**: Performance indexes created automatically
- **Connection Pooling**: 10 concurrent connections
- **Error Handling**: Automatic reconnection and error logging
- **Data Validation**: Schema-level validation
- **Cleanup**: Automatic removal of expired tokens

## 📊 Monitoring & Logging

### Log Files
- `logs/combined-YYYY-MM-DD.log` - All application logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `logs/rejections-YYYY-MM-DD.log` - Unhandled promise rejections

### Security Logging
- Login attempts (success/failure)
- Suspicious activities
- Rate limit violations
- Data breach attempts
- Authentication failures

### Health Monitoring
- Server health endpoint: `GET /api/health`
- Database connection status
- Memory usage monitoring
- Uptime tracking

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check if MongoDB is running
   - Verify the MONGODB_URI in .env
   - Check if port 5000 is available
   - Run `npm run setup` to initialize database

2. **Database connection issues**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure database permissions
   - Check network connectivity

3. **Authentication not working**
   - Check JWT_SECRET is set and strong
   - Verify token expiration settings
   - Check CORS configuration
   - Review authentication logs

4. **Rate limiting issues**
   - Check rate limit configuration
   - Verify IP detection (proxy settings)
   - Review rate limit logs
   - Adjust limits if needed

5. **Frontend can't connect to backend**
   - Ensure backend is running on port 5000
   - Check CORS configuration
   - Verify API URL in frontend
   - Check browser console for errors

### Development Tips

- Use browser dev tools to check network requests
- Check backend console for error logs
- Verify environment variables are loaded correctly
- Test with different user roles
- Monitor log files for security events

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/logout` - Logout

### Admin Endpoints (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get statistics
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Health Check
- `GET /api/health` - Server health and status

## 🚀 Production Deployment

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong, unique secrets for all keys
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Configure log monitoring
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting

### Performance Optimization
- Enable MongoDB connection pooling
- Configure proper indexes
- Set up Redis for session storage (optional)
- Enable compression
- Configure CDN for static assets
- Set up load balancing

## 🎉 Success!

Once both servers are running:
1. Visit `http://localhost:5173`
2. You'll see the landing page
3. Click "Staff Login" or "Create Account"
4. Use the demo credentials or create a new account
5. Access the dashboard and website features

The application is now ready for development and testing with enterprise-grade security!

## 📞 Support

For support and questions:
- Backend Documentation: `backend/README.md`
- API Documentation: `http://localhost:5000/api-docs`
- Logs: Check `backend/logs/` directory
- Health Check: `http://localhost:5000/api/health`