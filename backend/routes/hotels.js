const express = require('express');
const { body, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
const Place = require('../models/Place');
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
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional({ nullable: true })
    .custom((value) => {
      return typeof value === 'string' && (
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('/uploads/') ||
        value.startsWith('/api/upload/gridfs/')
      );
    })
    .withMessage('Each image must be a valid URL or uploaded path'),
  body('address')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Address must be between 3 and 500 characters'),
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  body('priceRange')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Price range is required'),
  body('roomTypes')
    .optional()
    .isArray()
    .withMessage('Room types must be an array')
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

// @route   GET /api/hotels
// @desc    Get all hotels (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const hotels = await Hotel.find({ isActive: true })
      .populate('placeId', 'name')
      .select('name placeId description images address rating reviews amenities priceRange createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Hotel.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      data: {
        hotels: hotels.map(hotel => hotel.getPublicProfile()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error('Get hotels error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get hotels'
    });
  }
});

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;
    
    const hotel = await Hotel.findByHotelId(hotelId);
    
    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        hotel: hotel.getPublicProfile ? hotel.getPublicProfile() : hotel
      }
    });
    
  } catch (error) {
    logger.error('Get hotel error', { error: error.message });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get hotel'
    });
  }
});

// @route   GET /api/hotels/place/:placeId
// @desc    Get hotels for a specific place
// @access  Public
router.get('/place/:placeId', async (req, res) => {
  try {
    const placeId = req.params.placeId;
    
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

// @route   POST /api/hotels
// @desc    Create new hotel (admin only)
// @access  Admin only
router.post('/', authenticateToken, requireAdmin, hotelValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, placeId, description, images, address, rating, amenities, priceRange, roomTypes } = req.body;
    const adminId = req.user._id;
    
    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }
    
    // Check if hotel already exists in this place
    const existingHotel = await Hotel.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      placeId 
    });
    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: 'Hotel with this name already exists in this place'
      });
    }
    
    // Normalize images (accept objects or strings)
    const normalizedImages = (Array.isArray(images) ? images : [])
      .map((img) => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object') return img.relativeUrl || img.url || '';
        return '';
      })
      .filter(Boolean);

    // Create new hotel
    const hotel = new Hotel({
      name,
      placeId,
      description: (description && String(description).trim().length > 0) ? description : 'Hotel',
      images: normalizedImages,
      address,
      rating: rating || 4.0,
      amenities: amenities || [],
      priceRange,
      roomTypes: roomTypes || [],
      metadata: {
        source: 'api',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdBy: adminId
      }
    });
    
    try {
      await hotel.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }
      throw err;
    }
    
    // Update place hotels count
    await place.updateHotelsCount();
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'CREATE',
      resource: 'HOTEL',
      userId: adminId,
      details: { 
        hotelName: name,
        hotelId: hotel._id,
        placeId,
        placeName: place.name
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Hotel created', { hotelId: hotel._id, name, placeId, createdBy: adminId });
    
    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: {
        hotel: hotel.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Create hotel error', { error: error.message, userId: req.user?._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel'
    });
  }
});

// @route   PUT /api/hotels/:id
// @desc    Update hotel (admin only)
// @access  Admin only
router.put('/:id', authenticateToken, requireAdmin, hotelValidation, handleValidationErrors, async (req, res) => {
  try {
    const hotelId = req.params.id;
    const updates = req.body;
    const adminId = req.user._id;
    
    // Check if hotel exists
    const existingHotel = await Hotel.findById(hotelId);
    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Check if place exists (if placeId is being updated)
    if (updates.placeId && updates.placeId !== existingHotel.placeId.toString()) {
      const place = await Place.findById(updates.placeId);
      if (!place || !place.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Place not found'
        });
      }
    }
    
    // Check if name is being changed and if it's already taken in the same place
    if (updates.name && updates.name !== existingHotel.name) {
      const nameExists = await Hotel.findOne({ 
        name: { $regex: new RegExp(`^${updates.name}$`, 'i') },
        placeId: updates.placeId || existingHotel.placeId,
        _id: { $ne: hotelId }
      });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Hotel with this name already exists in this place'
        });
      }
    }
    
    // Update hotel
    const hotel = await Hotel.findByIdAndUpdate(
      hotelId,
      { 
        ...updates,
        'metadata.lastModifiedBy': adminId
      },
      { new: true, runValidators: true }
    );
    
    // Update hotels count for both old and new places if placeId changed
    if (updates.placeId && updates.placeId !== existingHotel.placeId.toString()) {
      const oldPlace = await Place.findById(existingHotel.placeId);
      const newPlace = await Place.findById(updates.placeId);
      
      if (oldPlace) await oldPlace.updateHotelsCount();
      if (newPlace) await newPlace.updateHotelsCount();
    }
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'HOTEL',
      userId: adminId,
      targetHotelId: hotelId,
      details: { 
        updatedFields: Object.keys(updates),
        changes: updates
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Hotel updated', { hotelId, updatedBy: adminId, updates });
    
    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: {
        hotel: hotel.getPublicProfile()
      }
    });
    
  } catch (error) {
    logger.error('Update hotel error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel'
    });
  }
});

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel (admin only)
// @access  Admin only
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hotelId = req.params.id;
    const adminId = req.user._id;
    
    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Get place to update hotels count
    const place = await Place.findById(hotel.placeId);
    
    // Delete hotel
    await Hotel.findByIdAndDelete(hotelId);
    
    // Update place hotels count
    if (place) {
      await place.updateHotelsCount();
    }
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'DELETE',
      resource: 'HOTEL',
      userId: adminId,
      targetHotelId: hotelId,
      details: { 
        deletedHotel: {
          name: hotel.name,
          placeId: hotel.placeId
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    
    logger.info('Hotel deleted', { hotelId, deletedBy: adminId, hotelName: hotel.name });
    
    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
    
  } catch (error) {
    logger.error('Delete hotel error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete hotel'
    });
  }
});

// @route   GET /api/hotels/admin/stats
// @desc    Get hotels statistics (admin only)
// @access  Admin only
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Hotel.getHotelStats();
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'READ',
      resource: 'HOTEL',
      userId: req.user._id,
      details: { action: 'get_hotel_stats' },
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
    logger.error('Get hotel stats error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get hotel statistics'
    });
  }
});

module.exports = router;
