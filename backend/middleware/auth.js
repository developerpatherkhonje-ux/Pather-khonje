const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const config = require('../config/config');
const logger = require('../utils/logger');
const SecurityUtils = require('../utils/security');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    // Log successful authentication
    logger.api.request(req.method, req.originalUrl, req.ip, req.get('User-Agent'), user._id);
    
    next();
  } catch (error) {
    logger.api.error(req.method, req.originalUrl, error, null);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    logger.error('Auth middleware error', { error: error.message, ip: req.ip });
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      // Log unauthorized access attempt
      await AuditLog.logEvent({
        action: 'READ',
        resource: 'ADMIN',
        userId: req.user._id,
        details: { attemptedAccess: 'admin-only endpoint' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient privileges'
      });
      
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Admin middleware error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check'
    });
  }
};

// Middleware to check if user is admin or manager
const requireAdminOrManager = async (req, res, next) => {
  try {
    if (!['admin', 'manager'].includes(req.user.role)) {
      // Log unauthorized access attempt
      await AuditLog.logEvent({
        action: 'READ',
        resource: 'ADMIN',
        userId: req.user._id,
        details: { attemptedAccess: 'admin/manager-only endpoint' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: false,
        errorMessage: 'Insufficient privileges'
      });
      
      return res.status(403).json({
        success: false,
        message: 'Admin or Manager access required'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Admin/Manager middleware error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization check'
    });
  }
};

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    const tokenData = await RefreshToken.verifyToken(
      refreshToken,
      req.ip,
      req.get('User-Agent')
    );
    
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    req.refreshTokenData = tokenData;
    next();
  } catch (error) {
    logger.error('Refresh token verification error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Server error during refresh token verification'
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
};

// Generate refresh token
const generateRefreshToken = async (userId, email, ipAddress, userAgent) => {
  return await RefreshToken.createToken(userId, email, ipAddress, userAgent);
};

// Middleware to log API requests
const logAPIRequest = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user ? req.user._id : null;
    
    logger.api.response(req.method, req.originalUrl, res.statusCode, duration, userId);
  });
  
  next();
};

// Middleware to check rate limiting (basic implementation)
const checkRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }
    
    // Check current IP
    const ipRequests = requests.get(key) || [];
    const recentRequests = ipRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { ip: key, requests: recentRequests.length });
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);
    
    next();
  };
};

// Middleware to validate CSRF token (if using sessions)
const validateCSRF = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;
  
  if (!csrfToken || !SecurityUtils.verifyCSRFToken(csrfToken, sessionToken)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

// Middleware to sanitize input
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = SecurityUtils.sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Middleware to validate API key (for external API access)
const validateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    if (!SecurityUtils.isValidAPIKeyFormat(apiKey)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key format'
      });
    }
    
    const user = await User.findOne({ 'security.apiKey': apiKey, isActive: true });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('API key validation error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Server error during API key validation'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrManager,
  verifyRefreshToken,
  generateToken,
  generateRefreshToken,
  logAPIRequest,
  checkRateLimit,
  validateCSRF,
  sanitizeInput,
  validateAPIKey
};