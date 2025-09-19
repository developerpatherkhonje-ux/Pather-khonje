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
const { uploadMultiple, uploadToCloudinary, deleteImage } = require('../utils/cloudinary');

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

// @route   POST /api/places/:id/images
// @desc    Upload images for a place (admin only)
// @access  Admin only
router.post('/:id/images', authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const uploadedImages = [];
    const errors = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Upload to Cloudinary only
        const result = await uploadToCloudinary(file.path, 'pather-khonje/places');
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          uploadedAt: new Date()
        });

        // Clean up temporary file
        const fs = require('fs');
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', file.originalname, error.message);
        errors.push({ file: file.originalname, error: error.message });
        
        // Clean up temporary file
        try {
          const fs = require('fs');
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload any images',
        errors
      });
    }

    // Add images to place
    place.images = [...(place.images || []), ...uploadedImages];
    await place.save();

    // Log admin action
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'PLACE',
      userId: adminId,
      targetPlaceId: placeId,
      details: { 
        action: 'upload_images',
        uploadedImages: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    logger.info('Place images uploaded', { 
      placeId, 
      uploadedBy: adminId, 
      uploadedCount: uploadedImages.length,
      errors: errors.length
    });

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: {
        uploadedImages,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    logger.error('Upload place images error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload images'
    });
  }
});

// @route   DELETE /api/places/:id/images/:imageId
// @desc    Delete a specific image from a place (admin only)
// @access  Admin only
router.delete('/:id/images/:imageId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const placeId = req.params.id;
    const imageId = req.params.imageId;
    const adminId = req.user._id;
    
    // Check if place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Place not found'
      });
    }

    // Find the image to delete
    const imageIndex = place.images.findIndex(img => img.public_id === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const imageToDelete = place.images[imageIndex];

    // Delete from Cloudinary
    try {
      await deleteImage(imageId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from place
    place.images.splice(imageIndex, 1);
    await place.save();

    // Log admin action
    await AuditLog.logEvent({
      action: 'UPDATE',
      resource: 'PLACE',
      userId: adminId,
      targetPlaceId: placeId,
      details: { 
        action: 'delete_image',
        deletedImageId: imageId
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    logger.info('Place image deleted', { 
      placeId, 
      deletedBy: adminId, 
      imageId 
    });

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    logger.error('Delete place image error', { error: error.message, userId: req.user._id });
    
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

module.exports = router;
