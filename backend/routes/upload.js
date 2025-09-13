const express = require('express');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');
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
router.post('/image', requireAdmin, (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    try {
      // Generate URLs for the uploaded file
      const relativeUrl = `/uploads/places/${req.file.filename}`;
      const imageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
      
      // Validate file was actually saved
      if (!req.file.filename) {
        return res.status(500).json({
          success: false,
          message: 'Failed to save uploaded file'
        });
      }
      
      // Log admin action
      await AuditLog.logEvent({
        action: 'UPLOAD',
        resource: 'IMAGE',
        userId: req.user._id,
        details: { 
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          imageUrl,
          relativeUrl
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      logger.info('Image uploaded', { 
        filename: req.file.filename, 
        uploadedBy: req.user._id,
        imageUrl 
      });

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
          relativeUrl
        }
      });

    } catch (error) {
      logger.error('Image upload error', { error: error.message, userId: req.user._id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded image'
      });
    }
  });
});

// @route   POST /api/upload/images
// @desc    Upload multiple images (admin only)
// @access  Admin only
router.post('/images', requireAdmin, (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    try {
      // Generate URLs for the uploaded files
      const uploadedFiles = req.files.map(file => {
        const relativeUrl = `/uploads/places/${file.filename}`;
        const imageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: imageUrl,
          relativeUrl
        };
      });
      
      // Log admin action
      await AuditLog.logEvent({
        action: 'UPLOAD',
        resource: 'IMAGES',
        userId: req.user._id,
        details: { 
          fileCount: req.files.length,
          files: uploadedFiles.map(f => f.filename)
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      logger.info('Multiple images uploaded', { 
        fileCount: req.files.length, 
        uploadedBy: req.user._id 
      });

      res.json({
        success: true,
        message: `${req.files.length} images uploaded successfully`,
        data: {
          files: uploadedFiles
        }
      });

    } catch (error) {
      logger.error('Multiple images upload error', { error: error.message, userId: req.user._id });
      
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded images'
      });
    }
  });
});

// ===== Hotels specific disk uploads (stored under uploads/hotels) =====

// @route   POST /api/upload/hotels/image
// @desc    Upload single hotel image (admin only)
// @access  Admin only
router.post('/hotels/image', requireAdmin, (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    try {
      const relativeUrl = `/uploads/hotels/${req.file.filename}`;
      const imageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

      await AuditLog.logEvent({
        action: 'UPLOAD',
        resource: 'IMAGE',
        userId: req.user._id,
        details: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          imageUrl,
          relativeUrl
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      return res.json({
        success: true,
        message: 'Hotel image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
          relativeUrl
        }
      });
    } catch (error) {
      logger.error('Hotel image upload error', { error: error.message, userId: req.user._id });
      return res.status(500).json({ success: false, message: 'Failed to process uploaded image' });
    }
  });
});

// @route   POST /api/upload/hotels/images
// @desc    Upload multiple hotel images (admin only)
// @access  Admin only
router.post('/hotels/images', requireAdmin, (req, res) => {
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    try {
      const uploadedFiles = req.files.map(file => {
        const relativeUrl = `/uploads/hotels/${file.filename}`;
        const imageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;
        return {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          url: imageUrl,
          relativeUrl
        };
      });

      await AuditLog.logEvent({
        action: 'UPLOAD',
        resource: 'IMAGES',
        userId: req.user._id,
        details: { fileCount: req.files.length, files: uploadedFiles.map(f => f.filename) },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      return res.json({
        success: true,
        message: `${req.files.length} hotel images uploaded successfully`,
        data: { files: uploadedFiles }
      });
    } catch (error) {
      logger.error('Multiple hotel images upload error', { error: error.message, userId: req.user._id });
      return res.status(500).json({ success: false, message: 'Failed to process uploaded images' });
    }
  });
});

// ===== Packages specific disk uploads (stored under uploads/packages) =====

// @route   POST /api/upload/packages/image
// @desc    Upload single package image (admin only)
// @access  Admin only
router.post('/packages/image', requireAdmin, (req, res) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, () => {});
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    try {
      const relativeUrl = `/uploads/packages/${req.file.filename}`;
      const imageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

      await AuditLog.logEvent({
        action: 'UPLOAD',
        resource: 'IMAGE',
        userId: req.user._id,
        details: { filename: req.file.filename, imageUrl, relativeUrl },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true
      });

      return res.json({ success: true, message: 'Package image uploaded successfully', data: { url: imageUrl, relativeUrl } });
    } catch (error) {
      logger.error('Package image upload error', { error: error.message, userId: req.user._id });
      return res.status(500).json({ success: false, message: 'Failed to process uploaded image' });
    }
  });
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

module.exports = router;
