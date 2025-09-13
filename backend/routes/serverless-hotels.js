// Serverless-compatible hotels routes for Vercel deployment
const express = require('express');
const { body, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
const Place = require('../models/Place');
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
const hotelValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Hotel name must be between 2 and 200 characters'),
  body('placeId')
    .isMongoId()
    .withMessage('Valid place ID is required'),
  body('description')
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage('Description must be between 3 and 2000 characters'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Address must be between 5 and 300 characters'),
  body('priceRange')
    .isIn(['budget', 'mid-range', 'luxury'])
    .withMessage('Price range must be budget, mid-range, or luxury'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('amenities.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each amenity must be between 2 and 50 characters'),
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Contact info must be an object'),
  body('contactInfo.phone')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Please provide a valid phone number'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('contactInfo.website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// Get all hotels (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const placeId = req.query.placeId || '';
    const priceRange = req.query.priceRange || '';
    const isActive = req.query.isActive !== 'false'; // Default to true
    
    // Build query
    const query = {};
    if (isActive) query.isActive = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    if (placeId) query.placeId = placeId;
    if (priceRange) query.priceRange = priceRange;
    
    const hotels = await Hotel.find(query)
      .populate('placeId', 'name location state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Hotel.countDocuments(query);
    
    logger.info('Hotels list accessed', { 
      page, 
      limit, 
      search, 
      placeId,
      priceRange,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    logger.error('Get hotels error', { error: error.message, ip: req.ip });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get hotel by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('placeId', 'name location state country');
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    logger.info('Hotel details accessed', { 
      hotelId: req.params.id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      data: { hotel }
    });
  } catch (error) {
    logger.error('Get hotel error', { error: error.message, hotelId: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create new hotel (admin/manager only)
router.post('/', authenticateToken, requireAdminOrManager, hotelValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    // Verify place exists
    const place = await Place.findById(req.body.placeId);
    if (!place) {
      return res.status(400).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    const hotel = new Hotel({
      ...req.body,
      createdBy: req.user._id,
      metadata: {
        source: 'api',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
    
    await hotel.save();
    
    logger.info('Hotel created', { 
      hotelId: hotel._id,
      hotelName: hotel.name,
      placeId: hotel.placeId,
      createdBy: req.user._id,
      ip: req.ip 
    });
    
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { hotel }
    });
  } catch (error) {
    logger.error('Create hotel error', { error: error.message, createdBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hotel with this name already exists in this place'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Update hotel (admin/manager only)
router.put('/:id', authenticateToken, requireAdminOrManager, hotelValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Verify place exists if placeId is being updated
    if (req.body.placeId && req.body.placeId !== hotel.placeId.toString()) {
      const place = await Place.findById(req.body.placeId);
      if (!place) {
        return res.status(400).json({
          success: false,
          message: 'Place not found'
        });
      }
    }
    
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    logger.info('Hotel updated', { 
      hotelId: req.params.id,
      hotelName: updatedHotel.name,
      updatedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: { hotel: updatedHotel }
    });
  } catch (error) {
    logger.error('Update hotel error', { error: error.message, updatedBy: req.user._id });
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Hotel with this name already exists in this place'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Delete hotel (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    await Hotel.findByIdAndDelete(req.params.id);
    
    logger.info('Hotel deleted', { 
      hotelId: req.params.id,
      hotelName: hotel.name,
      deletedBy: req.user._id,
      ip: req.ip 
    });
    
    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    logger.error('Delete hotel error', { error: error.message, deletedBy: req.user._id });
    res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
