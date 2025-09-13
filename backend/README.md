# Pather Khonje Backend API

A secure, enterprise-grade backend API for the Pather Khonje Travel Agency built with Node.js, Express, and MongoDB.

## 🚀 Features

### 🔐 Security Features
- **JWT Authentication** with refresh tokens
- **Rate Limiting** (100 req/15min, 5 login attempts/15min)
- **Account Lockout** after 5 failed attempts
- **Password Hashing** with bcryptjs (12 rounds)
- **Data Sanitization** against NoSQL injection & XSS
- **CORS Protection** with configurable origins
- **Security Headers** with Helmet.js
- **Session Management** with MongoDB store
- **Comprehensive Logging** with Winston
- **Database Indexing** for optimal performance

### 👥 User Management
- User registration with validation
- Profile management
- Password updates with strength validation
- Role-based access control (user, manager, admin)
- Account activation/deactivation
- User statistics and analytics

### 📊 Admin Features
- Complete user management (CRUD operations)
- Admin dashboard with statistics
- Audit logging for all actions
- Security event monitoring
- Account unlock functionality
- Role management

### 🗄️ Database Features
- MongoDB with Mongoose ODM
- Database indexing for performance
- Connection pooling and error handling
- Data validation at schema level
- Automatic cleanup of expired tokens
- Backup system (basic implementation)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pather-khonje-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your settings:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/pather-khonje
   
   # JWT Configuration (Generate strong secrets!)
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
   JWT_EXPIRE=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret-key-here
   JWT_REFRESH_EXPIRE=30d
   
   # Security Configuration
   BCRYPT_ROUNDS=12
   SESSION_SECRET=your-session-secret-key-here
   COOKIE_SECRET=your-cookie-secret-key-here
   ENCRYPTION_KEY=your-32-character-encryption-key
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   
   # Admin Configuration
   ADMIN_EMAIL=admin@patherkhonje.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=System Administrator
   ```

4. **Database Setup**
   ```bash
   # Run automated setup (creates indexes, default admin, etc.)
   npm run setup
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🔧 Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run setup` - Run database setup and create default admin
- `npm run backup` - Create a database backup
- `npm run logs` - View application logs
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "designation": "Customer"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer your-access-token
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

#### Update Password
```http
PUT /api/auth/password
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Admin Endpoints (Admin Only)

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=user&isActive=true&search=john
Authorization: Bearer your-admin-token
```

#### Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer your-admin-token
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer your-admin-token
Content-Type: application/json

{
  "name": "John Smith",
  "role": "manager",
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer your-admin-token
```

#### Get Dashboard Statistics
```http
GET /api/admin/stats
Authorization: Bearer your-admin-token
```

#### Get Audit Logs
```http
GET /api/admin/audit?page=1&limit=50&action=LOGIN&success=false
Authorization: Bearer your-admin-token
```

#### Get Security Events
```http
GET /api/admin/security?hours=24
Authorization: Bearer your-admin-token
```

#### Unlock User Account
```http
POST /api/admin/users/:id/unlock
Authorization: Bearer your-admin-token
```

### System Endpoints

#### Health Check
```http
GET /api/health
```

#### API Documentation
```http
GET /api-docs
```

## 🔐 Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character
- Cannot reuse recent passwords

### Rate Limiting
- General API: 100 requests per 15 minutes
- Login attempts: 5 attempts per 15 minutes
- Account lockout after 5 failed attempts

### Data Protection
- All passwords are hashed with bcryptjs
- Sensitive data is encrypted
- Input sanitization against XSS and NoSQL injection
- CORS protection with whitelist
- Security headers with Helmet.js

### Audit Logging
- All user actions are logged
- Failed login attempts are tracked
- Suspicious activities are monitored
- Admin actions are audited
- Security events are recorded

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, validated),
  password: String (required, hashed),
  role: String (enum: ['user', 'manager', 'admin']),
  designation: String (max 50 chars),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  phone: String (validated),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    language: String,
    timezone: String,
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    }
  },
  security: {
    twoFactorEnabled: Boolean,
    apiKey: String,
    lastPasswordChange: Date,
    passwordHistory: Array
  },
  metadata: {
    createdBy: ObjectId,
    lastModifiedBy: ObjectId,
    ipAddress: String,
    userAgent: String,
    source: String
  }
}
```

### RefreshToken Model
```javascript
{
  token: String (required, unique),
  userId: ObjectId (required, ref: 'User'),
  email: String (required),
  expiresAt: Date (required, TTL index),
  isRevoked: Boolean (default: false),
  ipAddress: String (required),
  userAgent: String (required),
  createdAt: Date (default: now),
  lastUsed: Date (default: now)
}
```

### AuditLog Model
```javascript
{
  action: String (enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'ACCOUNT_LOCK', 'ACCOUNT_UNLOCK']),
  resource: String (enum: ['USER', 'ADMIN', 'AUTH', 'SYSTEM']),
  userId: ObjectId (required, ref: 'User'),
  targetUserId: ObjectId (ref: 'User'),
  details: Mixed,
  ipAddress: String (required),
  userAgent: String (required),
  timestamp: Date (default: now, TTL index),
  success: Boolean (default: true),
  errorMessage: String
}
```

## 📊 Monitoring & Logging

### Log Files
- `logs/combined-YYYY-MM-DD.log` - All application logs
- `logs/error-YYYY-MM-DD.log` - Error logs only
- `logs/exceptions-YYYY-MM-DD.log` - Uncaught exceptions
- `logs/rejections-YYYY-MM-DD.log` - Unhandled promise rejections
- `logs/security-YYYY-MM-DD.log` - Security events
- `logs/audit-YYYY-MM-DD.log` - Audit trail

### Health Monitoring
- Server health endpoint: `GET /api/health`
- Database connection status
- Memory usage monitoring
- Uptime tracking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/pather-khonje |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `JWT_REFRESH_SECRET` | Refresh token secret | (required) |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 30d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `SESSION_SECRET` | Session secret | (required) |
| `COOKIE_SECRET` | Cookie secret | (required) |
| `ENCRYPTION_KEY` | Data encryption key | (required) |
| `FRONTEND_URL` | Frontend URL | http://localhost:5173 |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:5173 |
| `ADMIN_EMAIL` | Default admin email | admin@patherkhonje.com |
| `ADMIN_PASSWORD` | Default admin password | admin123 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `RATE_LIMIT_LOGIN_MAX` | Max login attempts | 5 |
| `MAX_LOGIN_ATTEMPTS` | Account lockout threshold | 5 |
| `LOCKOUT_TIME_MS` | Account lockout duration | 1800000 (30 min) |

## 🚀 Deployment

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong, unique secrets for all keys
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Configure log monitoring
- [ ] Set up database backups
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run setup

EXPOSE 5000

CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the logs in `logs/` directory
- Use the health check endpoint: `GET /api/health`
- Review the API documentation: `GET /api-docs`

## 🔄 Changelog

### v1.0.0
- Initial release
- Complete authentication system
- Admin dashboard
- Security features
- Audit logging
- Database management
- Backup system