const express = require('express');
const { body, validationResult } = require('express-validator');
const Place = require('../models/Place');
const Hotel = require('../models/Hotel');
const { 
  authenticateToken, 
  requireAdmin,
  requireAdminOrManager,
  sanitizeInput
} = require('../middleware/auth');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');

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
  body('image')
    .custom((value) => {
      return typeof value === 'string' && (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('/uploads/')
      );
    })
    .withMessage('Image must be a valid URL or uploaded path'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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

// @route   GET /api/places
// @desc    Get all places (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const places = await Place.find({ isActive: true })
      .select('name description image rating hotelsCount createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: {
        places
      }
    });
    
  } catch (error) {
    logger.error('Get places error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get places'
    });
  }
});

// @route   GET /api/places/:id
// @desc    Get place by ID with hotels
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const placeId = req.params.id;
    
    const place = await Place.findById(placeId).populate('hotels');
    
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        place: place.getPublicProfile ? place.getPublicProfile() : place
      }
    });
    
  } catch (error) {
    logger.error('Get place error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get place'
    });
  }
});

// @route   GET /api/places/:id/hotels
// @desc    Get hotels for a specific place
// @access  Public
router.get('/:id/hotels', async (req, res) => {
  try {
    const placeId = req.params.id;
    
    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Get hotels for this place
    const hotels = await Hotel.findByPlaceId(placeId);
    
    res.json({
      success: true,
      data: {
        place: place.getPublicProfile(),
        hotels: hotels.map(hotel => hotel.getPublicProfile())
      }
    });
    
  } catch (error) {
    logger.error('Get place hotels error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get place hotels'
    });
  }
});

// @route   POST /api/places
// @desc    Create new place (admin only)
// @access  Admin only
router.post('/', authenticateToken, requireAdmin, placeValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description, image, rating } = req.body;
    const adminId = req.user._id;
    
    // Check if place already exists
    const existingPlace = await Place.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingPlace) {
      return res.status(400).json({
        success: false,
        message: 'Place with this name already exists'
      });
    }
    
    // Create new place
    const place = new Place({
      name,
      description,
      image,
      rating: rating || 4.5,
      metadata: {
        source: 'api',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdBy: adminId
      }
    });
    
    await place.save();
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'CREATE',
      resource: 'PLACE',
      userId: adminId,
      details: { 
        placeName: name,
        placeId: place._id
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Place created', { placeId: place._id, name, createdBy: adminId });
    
    res.status(201).json({
      success: true,
      message: 'Place created successfully',
      data: {
        place: place.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Create place error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create place'
    });
  }
});

// @route   PUT /api/places/:id
// @desc    Update place (admin only)
// @access  Admin only
router.put('/:id', authenticateToken, requireAdmin, placeValidation, handleValidationErrors, async (req, res) => {
  try {
    const placeId = req.params.id;
    const updates = req.body;
    const adminId = req.user._id;
    
    // Check if place exists
    const existingPlace = await Place.findById(placeId);
    if (!existingPlace) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Check if name is being changed and if it's already taken
    if (updates.name && updates.name !== existingPlace.name) {
      const nameExists = await Place.findOne({ 
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        _id: { $ne: placeId }
      });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Place with this name already exists'
        });
      }
    }
    
    // Update place
    const place = await Place.findByIdAndUpdate(
      placeId,
      { 
        ...updates,
        'metadata.lastModifiedBy': adminId
      },
      { new: true, runValidators: true }
    );
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'PLACE',
      userId: adminId,
      targetPlaceId: placeId,
      details: { 
        updatedFields: Object.keys(updates),
        changes: updates
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Place updated', { placeId, updatedBy: adminId, updates });
    
    res.json({
      success: true,
      message: 'Place updated successfully',
      data: {
        place: place.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Update place error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update place'
    });
  }
});

// @route   DELETE /api/places/:id
// @desc    Delete place (admin only)
// @access  Admin only
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const placeId = req.params.id;
    const adminId = req.user._id;
    
    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Check if place has hotels
    const hotelsCount = await Hotel.countDocuments({ placeId });
    if (hotelsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete place. It has ${hotelsCount} hotels associated with it.`
      });
    }
    
    // Delete place
    await Place.findByIdAndDelete(placeId);
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'DELETE',
      resource: 'PLACE',
      userId: adminId,
      targetPlaceId: placeId,
      details: { 
        deletedPlace: {
          name: place.name,
          description: place.description
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Place deleted', { placeId, deletedBy: adminId, placeName: place.name });
    
    res.json({
      success: true,
      message: 'Place deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete place error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete place'
    });
  }
});

// @route   GET /api/places/admin/stats
// @desc    Get places statistics (admin only)
// @access  Admin only
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Place.getPlaceStats();
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'PLACE',
      userId: req.user._id,
      details: { action: 'get_place_stats' },
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
    logger.error('Get place stats error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get place statistics'
    });
  }
});

module.exports = router;
