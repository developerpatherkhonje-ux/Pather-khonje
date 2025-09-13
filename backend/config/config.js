const path = require('path');
require('dotenv').config();

module.exports = {
  // Server Configuration (default values)
  PORT: 5000,
  NODE_ENV: 'development',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pather-khonje',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-here',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '24h',

  // Security Configuration
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-key-here',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret-key-here',

  // CORS Configuration (default values)
  FRONTEND_URL: 'http://localhost:5173',
  ALLOWED_ORIGINS: ['http://localhost:5173', 'http://localhost:3000'],

  // Admin Configuration
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@patherkhonje.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin@123',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Superadmin',
  
  // Additional Admin Users
  MANAGER_EMAIL: process.env.MANAGER_EMAIL || 'rajdip.mitra@patherkhonje.com',
  MANAGER_PASSWORD: process.env.MANAGER_PASSWORD || 'rajdip@123',
  MANAGER_NAME: process.env.MANAGER_NAME || 'Rajdip Mitra',
  
  PROPRIETOR_EMAIL: process.env.PROPRIETOR_EMAIL || 'somashah.mitra@patherkhonje.com',
  PROPRIETOR_PASSWORD: process.env.PROPRIETOR_PASSWORD || 'somashah@123',
  PROPRIETOR_NAME: process.env.PROPRIETOR_NAME || 'Somashah Mitra',

  // Rate Limiting Configuration (default values)
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for development
    loginMax: 20, // Increased for development
  },

  // Account Security Configuration
  SECURITY: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutTimeMs: parseInt(process.env.LOCKOUT_TIME_MS) || 30 * 60 * 1000, // 30 minutes
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    passwordRequireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true',
  },

  // Logging Configuration (default values)
  LOGGING: {
    level: 'info',
    file: './logs/app.log',
    maxSize: '10m',
    maxFiles: 5,
  },

  // Paths
  PATHS: {
    root: path.join(__dirname, '..'),
    logs: path.join(__dirname, '..', 'logs'),
  },
};