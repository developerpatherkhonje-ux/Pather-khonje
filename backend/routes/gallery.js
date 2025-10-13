const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { uploadToCloudinary, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

// @route   GET /api/gallery
// @desc    Get all gallery items (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50, page = 1 } = req.query;
    
    // Build filter
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const galleries = await Gallery.find(filter)
      .select('title description category image displayOrder createdAt')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Gallery.countDocuments(filter);

    res.json({
      success: true,
      data: {
        galleries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch galleries'
    });
  }
});

// @route   GET /api/gallery/admin
// @desc    Get all gallery items for admin
// @access  Admin only
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const galleries = await Gallery.find(filter)
      .populate('metadata.createdBy', 'name email')
      .populate('metadata.lastModifiedBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Gallery.countDocuments(filter);

    res.json({
      success: true,
      data: {
        galleries,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin galleries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch galleries'
    });
  }
});

// @route   GET /api/gallery/:id
// @desc    Get single gallery item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .select('title description category image displayOrder createdAt');

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      data: gallery
    });
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery item'
    });
  }
});

// @route   POST /api/gallery
// @desc    Create new gallery item
// @access  Admin only
router.post('/', authenticateToken, requireAdmin, uploadSingle, async (req, res) => {
  try {
    const { title, description, category, displayOrder = 0 } = req.body;
    const adminId = req.user._id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    let imageData;
    
    // Try to upload to Cloudinary first, fallback to local storage
    try {
      const result = await uploadToCloudinary(req.file.path, 'pather-khonje/gallery');
      imageData = {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        uploadedAt: new Date()
      };
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      
      // Fallback to local storage
      const relativePath = `/uploads/gallery/${req.file.filename}`;
      const absolutePath = path.join(__dirname, '..', 'uploads', 'gallery');
      
      // Ensure gallery upload directory exists
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
      }
      
      // Move file to gallery directory
      const newPath = path.join(absolutePath, req.file.filename);
      fs.renameSync(req.file.path, newPath);
      
      imageData = {
        public_id: `local-${req.file.filename}`,
        url: relativePath,
        width: null,
        height: null,
        format: path.extname(req.file.originalname).slice(1),
        uploadedAt: new Date()
      };
    }

    // Create gallery item
    const gallery = new Gallery({
      title,
      description,
      category,
      displayOrder: parseInt(displayOrder) || 0,
      image: imageData,
      metadata: {
        source: 'admin',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        createdBy: adminId
      }
    });

    await gallery.save();

    // Populate creator info
    await gallery.populate('metadata.createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // More specific error messages
    let errorMessage = 'Failed to create gallery item';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.name === 'MongoError' || error.name === 'MongooseError') {
      errorMessage = 'Database error: Unable to save gallery item';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery item
// @access  Admin only
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, displayOrder, isActive } = req.body;
    const adminId = req.user._id;

    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Update fields
    if (title) gallery.title = title;
    if (description) gallery.description = description;
    if (category) gallery.category = category;
    if (displayOrder !== undefined) gallery.displayOrder = parseInt(displayOrder);
    if (isActive !== undefined) gallery.isActive = isActive === 'true' || isActive === true;
    
    gallery.metadata.lastModifiedBy = adminId;

    await gallery.save();

    // Populate creator info
    await gallery.populate('metadata.createdBy', 'name email');
    await gallery.populate('metadata.lastModifiedBy', 'name email');

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery item'
    });
  }
});

// @route   PUT /api/gallery/:id/image
// @desc    Update gallery item image
// @access  Admin only
router.put('/:id/image', authenticateToken, requireAdmin, uploadSingle, async (req, res) => {
  try {
    const adminId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete old image
    if (gallery.image && gallery.image.public_id) {
      try {
        if (gallery.image.public_id.startsWith('local-')) {
          // Delete local file
          const localPath = path.join(__dirname, '..', 'uploads', 'gallery', gallery.image.public_id.replace('local-', ''));
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        } else {
          // Delete from Cloudinary
          await deleteImage(gallery.image.public_id);
        }
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
      }
    }

    let imageData;
    
    // Try to upload to Cloudinary first, fallback to local storage
    try {
      const result = await uploadToCloudinary(req.file.path, 'pather-khonje/gallery');
      imageData = {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        uploadedAt: new Date()
      };
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
    } catch (cloudinaryError) {
      console.warn('Cloudinary upload failed, using local storage:', cloudinaryError.message);
      
      // Fallback to local storage
      const relativePath = `/uploads/gallery/${req.file.filename}`;
      const absolutePath = path.join(__dirname, '..', 'uploads', 'gallery');
      
      // Ensure gallery upload directory exists
      if (!fs.existsSync(absolutePath)) {
        fs.mkdirSync(absolutePath, { recursive: true });
      }
      
      // Move file to gallery directory
      const newPath = path.join(absolutePath, req.file.filename);
      fs.renameSync(req.file.path, newPath);
      
      imageData = {
        public_id: `local-${req.file.filename}`,
        url: relativePath,
        width: null,
        height: null,
        format: path.extname(req.file.originalname).slice(1),
        uploadedAt: new Date()
      };
    }

    // Update gallery image
    gallery.image = imageData;
    gallery.metadata.lastModifiedBy = adminId;

    await gallery.save();

    res.json({
      success: true,
      message: 'Gallery image updated successfully',
      data: gallery
    });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update gallery image'
    });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery item
// @access  Admin only
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete image
    if (gallery.image && gallery.image.public_id) {
      try {
        if (gallery.image.public_id.startsWith('local-')) {
          // Delete local file
          const localPath = path.join(__dirname, '..', 'uploads', 'gallery', gallery.image.public_id.replace('local-', ''));
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
          }
        } else {
          // Delete from Cloudinary
          await deleteImage(gallery.image.public_id);
        }
      } catch (deleteError) {
        console.error('Error deleting image:', deleteError);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery item'
    });
  }
});

// @route   PUT /api/gallery/:id/toggle
// @desc    Toggle gallery item active status
// @access  Admin only
router.put('/:id/toggle', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    gallery.isActive = !gallery.isActive;
    gallery.metadata.lastModifiedBy = req.user._id;

    await gallery.save();

    res.json({
      success: true,
      message: `Gallery item ${gallery.isActive ? 'activated' : 'deactivated'} successfully`,
      data: gallery
    });
  } catch (error) {
    console.error('Error toggling gallery status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle gallery status'
    });
  }
});

// @route   GET /api/gallery/stats/overview
// @desc    Get gallery statistics
// @access  Admin only
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const total = await Gallery.countDocuments();
    const active = await Gallery.countDocuments({ isActive: true });
    const inactive = total - active;

    const categoryStats = await Gallery.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    const recent = await Gallery.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt isActive');

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive,
        categoryStats,
        recent
      }
    });
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics'
    });
  }
});

module.exports = router;
