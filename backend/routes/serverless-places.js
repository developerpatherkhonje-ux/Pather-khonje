// Serverless-compatible places routes for Vercel deployment
const express = require('express');
const { body, validationResult } = require('express-validator');
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
const placeValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Place name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-/&',.()]+$/)
    .withMessage('Place name may include letters, numbers, spaces, hyphens, slashes, ampersands, apostrophes, commas, periods, and parentheses'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('bestTimeToVisit')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Best time to visit must be between 2 and 100 characters'),
  body('attractions')
    .optional()
    .isArray()
    .withMessage('Attractions must be an array'),
  body('attractions.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Each attraction must be between 2 and 100 characters'),
  body('climate')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Climate must be between 2 and 100 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get all places (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const state = req.query.state || '';
    const isActive = req.query.isActive !== 'false'; // Default to true
    
    // Build query
    const query = {};
    if (isActive) query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (state) query.state = { $regex: state, $options: 'i' };
    
    const places = await Place.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Place.countDocuments(query);
    
    logger.info('Places list accessed', { 
      page, 
      limit, 
      search, 
      state,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        places,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get places error', { error: error.message, ip: req.ip });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch places',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get place by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Get hotels in this place
    const hotels = await Hotel.find({ placeId: req.params.id, isActive: true })
      .select('name description priceRange rating images')
      .limit(5);
    
    logger.info('Place details accessed', { 
      placeId: req.params.id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        place,
        hotels
      }
    });
  } catch (error) {
    logger.error('Get place error', { error: error.message, placeId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch place',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new place (admin/manager only)
router.post('/', authenticateToken, requireAdminOrManager, placeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const place = new Place({
      ...req.body,
      createdBy: req.user._id,
      metadata: {
        source: 'api',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await place.save();
    
    logger.info('Place created', { 
      placeId: place._id,
      placeName: place.name,
      createdBy: req.user._id,
      ip: req.ip 
    });
    
    res.status(201).json({
      success: true,
      message: 'Place created successfully',
      data: { place }
    });
  } catch (error) {
    logger.error('Create place error', { error: error.message, createdBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Place with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create place',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update place (admin/manager only)
router.put('/:id', authenticateToken, requireAdminOrManager, placeValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    logger.info('Place updated', { 
      placeId: req.params.id,
      placeName: updatedPlace.name,
      updatedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Place updated successfully',
      data: { place: updatedPlace }
    });
  } catch (error) {
    logger.error('Update place error', { error: error.message, updatedBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Place with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update place',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete place (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Check if there are hotels associated with this place
    const hotelsCount = await Hotel.countDocuments({ placeId: req.params.id });
    
    if (hotelsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete place. ${hotelsCount} hotel(s) are associated with this place.`
      });
    }
    
    await Place.findByIdAndDelete(req.params.id);
    
    logger.info('Place deleted', { 
      placeId: req.params.id,
      placeName: place.name,
      deletedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Place deleted successfully'
    });
  } catch (error) {
    logger.error('Delete place error', { error: error.message, deletedBy: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete place',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
