const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const { 
  authenticateToken, 
  generateToken, 
  generateRefreshToken,
  verifyRefreshToken,
  sanitizeInput
} = require('../middleware/auth');
const config = require('../config/config');
const logger = require('../utils/logger');
const SecurityUtils = require('../utils/security');

const router = express.Router();

// Apply sanitization middleware to all routes
router.use(sanitizeInput);

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: config.SECURITY.passwordMinLength })
    .withMessage(`Password must be at least ${config.SECURITY.passwordMinLength} characters`)
    .custom((value) => {
      const validation = SecurityUtils.validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Designation cannot exceed 50 characters')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const profileUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Designation cannot exceed 50 characters'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('ZIP code cannot exceed 10 characters'),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Country cannot exceed 50 characters')
];

const passwordUpdateValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: config.SECURITY.passwordMinLength })
    .withMessage(`Password must be at least ${config.SECURITY.passwordMinLength} characters`)
    .custom((value) => {
      const validation = SecurityUtils.validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    })
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, phone, designation } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Check if this is an admin registration attempt
    let userRole = 'user';
    if (email === config.ADMIN_EMAIL || email.includes('@patherkhonje.com')) {
      userRole = 'admin';
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
      designation,
      role: userRole,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: 'web'
      }
    });
    
    await user.save();
    
    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = await generateRefreshToken(
      user._id,
      user.email,
      req.ip,
      req.get('User-Agent')
    );
    
    // Log successful registration
    await AuditLog.logEvent({
      action: 'CREATE',
      resource: 'USER',
      userId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.security.loginAttempt(email, true, req.ip, req.get('User-Agent'));
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken
      }
    });
    
  } catch (error) {
    logger.error('User registration error', { 
      error: error.message, 
      email: req.body.email,
      ip: req.ip 
    });
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      logger.security.loginFailure(email, 'User not found', req.ip, req.get('User-Agent'));
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      logger.security.loginFailure(email, 'Account locked', req.ip, req.get('User-Agent'));
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      logger.security.loginFailure(email, 'Account deactivated', req.ip, req.get('User-Agent'));
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      logger.security.loginFailure(email, 'Invalid password', req.ip, req.get('User-Agent'));
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = await generateRefreshToken(
      user._id,
      user.email,
      req.ip,
      req.get('User-Agent')
    );
    
    // Log successful login
    await AuditLog.logEvent({
      action: 'LOGIN',
      resource: 'AUTH',
      userId: user._id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.security.loginAttempt(email, true, req.ip, req.get('User-Agent'));
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token,
        refreshToken
      }
    });
    
  } catch (error) {
    logger.error('User login error', { 
      error: error.message, 
      email: req.body.email,
      ip: req.ip 
    });
    
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', verifyRefreshToken, async (req, res) => {
  try {
    const { refreshTokenData } = req;
    const user = refreshTokenData.userId;
    
    // Generate new access token
    const newToken = generateToken(user._id);
    
    // Log token refresh
    await AuditLog.logEvent({
      action: 'LOGIN',
      resource: 'AUTH',
      userId: user._id,
      details: { action: 'token_refresh' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.security.tokenRefresh(user._id, user.email);
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken
      }
    });
    
  } catch (error) {
    logger.error('Token refresh error', { error: error.message, ip: req.ip });
    
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    logger.error('Get user profile error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, profileUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...updates,
        'metadata.lastModifiedBy': userId
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Log profile update
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'USER',
      userId: userId,
      targetUserId: userId,
      details: { updatedFields: Object.keys(updates) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Profile update error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Profile update failed'
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Update user password
// @access  Private
router.put('/password', authenticateToken, passwordUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }
    
    // Check if password was used recently
    if (user.isPasswordRecentlyUsed(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password was used recently. Please choose a different password.'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Revoke all refresh tokens for security
    await RefreshToken.revokeAllUserTokens(userId);
    
    // Log password change
    await AuditLog.logEvent({
      action: 'PASSWORD_CHANGE',
      resource: 'AUTH',
      userId: userId,
      details: { passwordChanged: true },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.security.passwordChange(userId, user.email);
    
    res.json({
      success: true,
      message: 'Password updated successfully'
    });
    
  } catch (error) {
    logger.error('Password update error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Password update failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const token = req.token;
    
    // Revoke refresh token if provided
    const { refreshToken } = req.body;
    if (refreshToken) {
      await RefreshToken.revokeToken(refreshToken);
    }
    
    // Log logout
    await AuditLog.logEvent({
      action: 'LOGOUT',
      resource: 'AUTH',
      userId: userId,
      details: { logoutMethod: 'manual' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    logger.error('Logout error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/sessions
// @desc    Get user active sessions
// @access  Private
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const sessions = await RefreshToken.getUserActiveSessions(userId);
    
    res.json({
      success: true,
      data: {
        sessions: sessions.map(session => ({
          id: session._id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          lastUsed: session.lastUsed
        }))
      }
    });
    
  } catch (error) {
    logger.error('Get sessions error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions'
    });
  }
});

// @route   POST /api/auth/revoke-session
// @desc    Revoke a specific session
// @access  Private
router.post('/revoke-session', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Find and revoke the session
    const session = await RefreshToken.findOne({
      _id: sessionId,
      userId: userId,
      isRevoked: false
    });
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }
    
    await RefreshToken.revokeToken(session.token);
    
    // Log session revocation
    await AuditLog.logEvent({
      action: 'LOGOUT',
      resource: 'AUTH',
      userId: userId,
      details: { sessionRevoked: true, sessionId },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
    
  } catch (error) {
    logger.error('Revoke session error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify if token is valid
// @access  Private
router.post('/verify-token', authenticateToken, async (req, res) => {
  try {
    // If we reach here, the token is valid (authenticateToken middleware passed)
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          isActive: req.user.isActive,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
});

module.exports = router;