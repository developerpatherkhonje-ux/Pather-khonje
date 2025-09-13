const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { 
  authenticateToken, 
  requireAdmin,
  requireAdminOrManager,
  sanitizeInput
} = require('../middleware/auth');
const config = require('../config/config');
const logger = require('../utils/logger');
const SecurityUtils = require('../utils/security');

const router = express.Router();

// Apply authentication and sanitization middleware to all routes
router.use(authenticateToken);
router.use(sanitizeInput);

// Validation rules
const userUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role must be user, manager, or admin'),
  body('designation')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Designation cannot exceed 50 characters'),
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin only
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.role) {
      filter.role = req.query.role;
    }
    
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { designation: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -security')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'ADMIN',
      userId: req.user._id,
      details: { 
        action: 'list_users',
        filter,
        page,
        limit
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Get users error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin only
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password -security');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'ADMIN',
      userId: req.user._id,
      targetUserId: userId,
      details: { action: 'get_user' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      data: {
        user
      }
    });
    
  } catch (error) {
    logger.error('Get user error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Admin only
router.put('/users/:id', requireAdmin, userUpdateValidation, handleValidationErrors, async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const adminId = req.user._id;
    
    // Don't allow admin to update their own role
    if (userId === adminId && updates.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }
    
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being changed and if it's already taken
    if (updates.email && updates.email !== existingUser.email) {
      const emailExists = await User.findByEmail(updates.email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Track role change for audit
    const roleChanged = updates.role && updates.role !== existingUser.role;
    const oldRole = existingUser.role;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        ...updates,
        'metadata.lastModifiedBy': adminId
      },
      { new: true, runValidators: true }
    );
    
    // Log role change if applicable
    if (roleChanged) {
      await AuditLog.logEvent({
        action: 'ROLE_CHANGE',
        resource: 'ADMIN',
        userId: adminId,
        targetUserId: userId,
        details: { 
          oldRole,
          newRole: updates.role,
          changedBy: adminId
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });
      
      logger.audit.roleChanged(adminId, userId, oldRole, updates.role);
    }
    
    // Log user update
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'ADMIN',
      userId: adminId,
      targetUserId: userId,
      details: { 
        updatedFields: Object.keys(updates),
        changes: updates
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.audit.userUpdated(adminId, userId, updates);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Update user error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user._id;
    
    // Don't allow admin to delete themselves
    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    // Log user deletion
    await AuditLog.logEvent({
      action: 'DELETE',
      resource: 'ADMIN',
      userId: adminId,
      targetUserId: userId,
      details: { 
        deletedUser: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.audit.userDeleted(adminId, userId, user.email);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete user error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.getUserStats();
    
    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });
    
    // Get locked accounts
    const lockedAccounts = await User.countDocuments({
      lockUntil: { $gt: new Date() }
    });
    
    // Get audit statistics
    const auditStats = await AuditLog.getAuditStats(30);
    
    // Get failed login attempts (last 24 hours)
    const failedLogins = await AuditLog.getFailedLogins(24);
    
    // Get suspicious activities (last 24 hours)
    const suspiciousActivities = await AuditLog.getSuspiciousActivities(24);
    
    const stats = {
      users: {
        total: userStats.totalUsers,
        active: userStats.activeUsers,
        inactive: userStats.totalUsers - userStats.activeUsers,
        byRole: {
          admin: userStats.adminUsers,
          manager: userStats.managerUsers,
          user: userStats.regularUsers
        },
        recentRegistrations,
        activeUsers,
        lockedAccounts
      },
      security: {
        failedLogins: failedLogins.length,
        suspiciousActivities: suspiciousActivities.length,
        auditEvents: auditStats.totalEvents,
        successRate: auditStats.successRate
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: config.NODE_ENV
      }
    };
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'ADMIN',
      userId: req.user._id,
      details: { action: 'get_stats' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      data: {
        stats
      }
    });
    
  } catch (error) {
    logger.error('Get stats error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics'
    });
  }
});

// @route   GET /api/admin/audit
// @desc    Get audit logs
// @access  Admin only
router.get('/audit', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    if (req.query.action) {
      filter.action = req.query.action;
    }
    
    if (req.query.resource) {
      filter.resource = req.query.resource;
    }
    
    if (req.query.success !== undefined) {
      filter.success = req.query.success === 'true';
    }
    
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    if (req.query.startDate && req.query.endDate) {
      filter.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }
    
    // Get audit logs
    const auditLogs = await AuditLog.find(filter)
      .populate('userId', 'name email role')
      .populate('targetUserId', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count
    const total = await AuditLog.countDocuments(filter);
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'ADMIN',
      userId: req.user._id,
      details: { action: 'get_audit_logs', filter },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Get audit logs error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs'
    });
  }
});

// @route   GET /api/admin/security
// @desc    Get security events
// @access  Admin only
router.get('/security', requireAdmin, async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    
    // Get failed login attempts
    const failedLogins = await AuditLog.getFailedLogins(hours);
    
    // Get suspicious activities
    const suspiciousActivities = await AuditLog.getSuspiciousActivities(hours);
    
    // Get locked accounts
    const lockedAccounts = await User.find({
      lockUntil: { $gt: new Date() }
    }).select('name email role lockUntil loginAttempts');
    
    // Get recent security events
    const recentSecurityEvents = await AuditLog.find({
      $or: [
        { action: 'ACCOUNT_LOCK' },
        { action: 'PASSWORD_CHANGE' },
        { action: 'ROLE_CHANGE' },
        { success: false }
      ],
      timestamp: { $gte: new Date(Date.now() - hours * 60 * 60 * 1000) }
    })
    .populate('userId', 'name email role')
    .populate('targetUserId', 'name email role')
    .sort({ timestamp: -1 })
    .limit(100);
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'ADMIN',
      userId: req.user._id,
      details: { action: 'get_security_events', hours },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      data: {
        failedLogins,
        suspiciousActivities,
        lockedAccounts,
        recentSecurityEvents,
        summary: {
          failedLoginsCount: failedLogins.length,
          suspiciousActivitiesCount: suspiciousActivities.length,
          lockedAccountsCount: lockedAccounts.length,
          recentEventsCount: recentSecurityEvents.length
        }
      }
    });
    
  } catch (error) {
    logger.error('Get security events error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get security events'
    });
  }
});

// @route   POST /api/admin/users/:id/unlock
// @desc    Unlock user account
// @access  Admin only
router.post('/users/:id/unlock', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const adminId = req.user._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'User account is not locked'
      });
    }
    
    // Unlock account
    user.lockUntil = null;
    user.loginAttempts = 0;
    await user.save();
    
    // Log account unlock
    await AuditLog.logEvent({
      action: 'ACCOUNT_UNLOCK',
      resource: 'ADMIN',
      userId: adminId,
      targetUserId: userId,
      details: { 
        unlockedBy: adminId,
        reason: 'admin_unlock'
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    res.json({
      success: true,
      message: 'User account unlocked successfully'
    });
    
  } catch (error) {
    logger.error('Unlock user error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to unlock user account'
    });
  }
});

module.exports = router;