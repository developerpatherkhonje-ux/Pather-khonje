// Serverless-compatible packages routes for Vercel deployment
const express = require('express');
const { body, validationResult } = require('express-validator');
const Package = require('../models/Package');
const Place = require('../models/Place');
const Hotel = require('../models/Hotel');
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
  error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta)
};

const router = express.Router();

// Apply sanitization middleware to all routes
router.use(sanitizeInput);

// Validation rules
const packageValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Package name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('duration')
    .isInt({ min: 1, max: 30 })
    .withMessage('Duration must be between 1 and 30 days'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('places')
    .isArray({ min: 1 })
    .withMessage('At least one place must be included'),
  body('places.*')
    .isMongoId()
    .withMessage('Each place must be a valid place ID'),
  body('includedServices')
    .optional()
    .isArray()
    .withMessage('Included services must be an array'),
  body('includedServices.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each included service must be between 2 and 100 characters'),
  body('excludedServices')
    .optional()
    .isArray()
    .withMessage('Excluded services must be an array'),
  body('excludedServices.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each excluded service must be between 2 and 100 characters'),
  body('itinerary')
    .optional()
    .isArray()
    .withMessage('Itinerary must be an array'),
  body('itinerary.*.day')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Day must be a positive integer'),
  body('itinerary.*.activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  body('itinerary.*.activities.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Each activity must be between 2 and 200 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get all packages (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    const duration = parseInt(req.query.duration) || '';
    const isActive = req.query.isActive !== 'false'; // Default to true
    
    // Build query
    const query = {};
    if (isActive) query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice > 0 || maxPrice < Infinity) {
      query.price = { $gte: minPrice, $lte: maxPrice };
    }
    if (duration) query.duration = duration;
    
    const packages = await Package.find(query)
      .populate('places', 'name location state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Package.countDocuments(query);
    
    logger.info('Packages list accessed', { 
      page, 
      limit, 
      search, 
      minPrice,
      maxPrice,
      duration,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        packages,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get packages error', { error: error.message, ip: req.ip });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get package by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id)
      .populate('places', 'name location state country description attractions');
    
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    logger.info('Package details accessed', { 
      packageId: req.params.id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: { package }
    });
  } catch (error) {
    logger.error('Get package error', { error: error.message, packageId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new package (admin/manager only)
router.post('/', authenticateToken, requireAdminOrManager, packageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Verify all places exist
    const places = await Place.find({ _id: { $in: req.body.places } });
    if (places.length !== req.body.places.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more places not found'
      });
    }
    
    const package = new Package({
      ...req.body,
      createdBy: req.user._id,
      metadata: {
        source: 'api',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await package.save();
    
    logger.info('Package created', { 
      packageId: package._id,
      packageName: package.name,
      createdBy: req.user._id,
      ip: req.ip 
    });
    
    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: { package }
    });
  } catch (error) {
    logger.error('Create package error', { error: error.message, createdBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Package with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update package (admin/manager only)
router.put('/:id', authenticateToken, requireAdminOrManager, packageValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    // Verify all places exist if places are being updated
    if (req.body.places) {
      const places = await Place.find({ _id: { $in: req.body.places } });
      if (places.length !== req.body.places.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more places not found'
        });
      }
    }
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    logger.info('Package updated', { 
      packageId: req.params.id,
      packageName: updatedPackage.name,
      updatedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Package updated successfully',
      data: { package: updatedPackage }
    });
  } catch (error) {
    logger.error('Update package error', { error: error.message, updatedBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Package with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete package (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    await Package.findByIdAndDelete(req.params.id);
    
    logger.info('Package deleted', { 
      packageId: req.params.id,
      packageName: package.name,
      deletedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    logger.error('Delete package error', { error: error.message, deletedBy: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
