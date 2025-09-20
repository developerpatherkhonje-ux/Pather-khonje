const express = require('express');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const mongoose = require('mongoose');
const { GridFSBucket, ObjectId } = mongoose.mongo;

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST /api/upload/image
// @desc    Upload single image (admin only)
// @access  Admin only
router.post('/image', requireAdmin, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'pather-khonje/places');
    
    // Clean up temporary file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'UPLOAD',
      resource: 'IMAGE',
      userId: req.user._id,
      details: { 
        public_id: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
        size: req.file.size
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    logger.info('Image uploaded to Cloudinary', { 
      public_id: result.public_id, 
      uploadedBy: req.user._id,
      url: result.secure_url 
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });

  } catch (error) {
    logger.error('Image upload error', { error: error.message, userId: req.user._id });
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary'
    });
  }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images (admin only)
// @access  Admin only
router.post('/images', requireAdmin, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = [];
    const errors = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.path, 'pather-khonje/places');
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          originalName: file.originalname,
          size: file.size
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
    
    // Log admin action
    await AuditLog.logEvent({
      action: 'UPLOAD',
      resource: 'IMAGES',
      userId: req.user._id,
      details: { 
        fileCount: req.files.length,
        uploadedCount: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    logger.info('Multiple images uploaded to Cloudinary', { 
      fileCount: req.files.length, 
      uploadedCount: uploadedImages.length,
      uploadedBy: req.user._id 
    });

    res.json({
      success: uploadedImages.length > 0,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: {
        files: uploadedImages
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    logger.error('Multiple images upload error', { error: error.message, userId: req.user._id });
    
    // Clean up all temporary files
    if (req.files) {
      req.files.forEach(file => {
        try {
          const fs = require('fs');
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload images to Cloudinary'
    });
  }
});

// ===== Hotels specific disk uploads (stored under uploads/hotels) =====

// @route   POST /api/upload/hotels/image
// @desc    Upload single hotel image (admin only)
// @access  Admin only
router.post('/hotels/image', requireAdmin, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'pather-khonje/hotels');
    
    // Clean up temporary file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    await AuditLog.logEvent({
      action: 'UPLOAD',
      resource: 'IMAGE',
      userId: req.user._id,
      details: {
        public_id: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
        size: req.file.size
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    return res.json({
      success: true,
      message: 'Hotel image uploaded successfully',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Hotel image upload error', { error: error.message, userId: req.user._id });
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload hotel image to Cloudinary' 
    });
  }
});

// @route   POST /api/upload/hotels/images
// @desc    Upload multiple hotel images (admin only)
// @access  Admin only
router.post('/hotels/images', requireAdmin, uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadedImages = [];
    const errors = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.path, 'pather-khonje/hotels');
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          originalName: file.originalname,
          size: file.size
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

    await AuditLog.logEvent({
      action: 'UPLOAD',
      resource: 'IMAGES',
      userId: req.user._id,
      details: { 
        fileCount: req.files.length, 
        uploadedCount: uploadedImages.length,
        errors: errors.length > 0 ? errors : undefined
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    return res.json({
      success: uploadedImages.length > 0,
      message: `${uploadedImages.length} hotel image(s) uploaded successfully`,
      data: { 
        files: uploadedImages 
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    logger.error('Multiple hotel images upload error', { error: error.message, userId: req.user._id });
    
    // Clean up all temporary files
    if (req.files) {
      req.files.forEach(file => {
        try {
          const fs = require('fs');
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload hotel images to Cloudinary' 
    });
  }
});

// ===== Packages specific disk uploads (stored under uploads/packages) =====

// @route   POST /api/upload/packages/image
// @desc    Upload single package image (admin only)
// @access  Admin only
router.post('/packages/image', requireAdmin, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, 'pather-khonje/packages');
    
    // Clean up temporary file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);

    await AuditLog.logEvent({
      action: 'UPLOAD',
      resource: 'IMAGE',
      userId: req.user._id,
      details: {
        public_id: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
        size: req.file.size
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    return res.json({
      success: true,
      message: 'Package image uploaded successfully',
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Package image upload error', { error: error.message, userId: req.user._id });
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to upload package image to Cloudinary' 
    });
  }
});
// ===== GridFS-based storage (MongoDB) =====

// @route   POST /api/upload/gridfs
// @desc    Upload single file to Mongo GridFS (admin only)
// @access  Admin only
router.post('/gridfs', requireAdmin, async (req, res) => {
  try {
    // Expect a raw binary body with header 'x-filename' OR multipart already handled
    const filename = req.headers['x-filename'] || 'upload_' + Date.now();
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    uploadStream.on('error', (err) => {
      logger.error('GridFS upload error', { error: err.message });
      return res.status(500).json({ success: false, message: 'Failed to upload file' });
    });

    uploadStream.on('finish', async (file) => {
      try {
        await AuditLog.logEvent({
          action: 'UPLOAD',
          resource: 'IMAGE',
          userId: req.user._id,
          details: { gridfsId: file._id, filename: file.filename, size: file.length },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: true
        });

        return res.json({
          success: true,
          message: 'File uploaded to GridFS successfully',
          data: {
            id: file._id,
            filename: file.filename,
            contentType: file.contentType,
            size: file.length,
            url: `/api/upload/gridfs/${file._id}`
          }
        });
      } catch (e) {
        logger.error('Audit log error after GridFS upload', { error: e.message });
        return res.json({
          success: true,
          message: 'File uploaded to GridFS successfully',
          data: { id: file._id, filename: file.filename, url: `/api/upload/gridfs/${file._id}` }
        });
      }
    });

    // Pipe request body into GridFS
    req.pipe(uploadStream);
  } catch (error) {
    logger.error('GridFS upload handler error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Server error during GridFS upload' });
  }
});

// @route   GET /api/upload/gridfs/:id
// @desc    Stream file from GridFS by id
// @access  Public (consider protecting if needed)
router.get('/gridfs/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    let objectId;
    try {
      objectId = new ObjectId(fileId);
    } catch (_) {
      return res.status(400).json({ success: false, message: 'Invalid file id' });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });

    // Find file to set headers
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    const file = files[0];
    // Allow cross-origin image loads
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on('error', (err) => {
      logger.error('GridFS stream error', { error: err.message });
      res.status(500).end();
    });
    downloadStream.pipe(res);
  } catch (error) {
    logger.error('GridFS fetch handler error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Server error retrieving file' });
  }
});

// Error handling middleware for upload routes
router.use(handleUploadError);

module.exports = router;
