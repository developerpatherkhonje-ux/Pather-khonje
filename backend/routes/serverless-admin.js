// Serverless-compatible admin routes for Vercel deployment
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { 
  authenticateToken, 
  requireAdmin,
  requireAdminOrManager,
  sanitizeInput
} = require('../middleware/serverless-auth');

// Simple serverless-compatible logger
const logger = {
  info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
  error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta),
  security: {
    loginAttempt: (email, success, ip, userAgent) => {
      console.log(`[SECURITY] Login attempt - Email: ${email}, Success: ${success}, IP: ${ip}`);
    },
    loginFailure: (email, reason, ip, userAgent) => {
      console.warn(`[SECURITY] Login failure - Email: ${email}, Reason: ${reason}, IP: ${ip}`);
    }
  }
};

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
  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('designation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Designation must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role must be user, manager, or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get all users (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments();
    
    logger.info('Admin accessed users list', { 
      adminId: req.user._id, 
      page, 
      limit,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get users error', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.info('Admin accessed user details', { 
      adminId: req.user._id, 
      targetUserId: req.params.id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    logger.error('Get user error', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update user (admin only)
router.put('/users/:id', requireAdmin, userUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user fields
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.designation) updateData.designation = req.body.designation;
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    logger.info('Admin updated user', { 
      adminId: req.user._id, 
      targetUserId: req.params.id,
      updatedFields: Object.keys(updateData),
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    logger.error('Update user error', { error: error.message, adminId: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    logger.info('Admin deleted user', { 
      adminId: req.user._id, 
      deletedUserId: req.params.id,
      deletedUserEmail: user.email,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get admin dashboard statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const managerUsers = await User.countDocuments({ role: 'manager' });
    
    const recentUsers = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    logger.info('Admin accessed dashboard stats', { 
      adminId: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          adminUsers,
          managerUsers,
          regularUsers: totalUsers - adminUsers - managerUsers
        },
        recentUsers
      }
    });
  } catch (error) {
    logger.error('Get stats error', { error: error.message, adminId: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
