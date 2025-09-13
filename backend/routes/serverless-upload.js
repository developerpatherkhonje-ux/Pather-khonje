// Serverless-compatible upload routes for Vercel deployment
const express = require('express');
const { 
  uploadPlaces, 
  uploadHotels, 
  uploadPackages, 
  uploadSingle,
  handleUploadError,
  processUploadedFiles,
  processSingleFile
} = require('../middleware/serverless-upload');
const { authenticateToken, requireAdmin } = require('../middleware/serverless-auth');

// Simple serverless-compatible logger
const logger = {
  info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
  warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
  error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta)
};

const router = express.Router();

// Upload images for places
router.post('/places', authenticateToken, requireAdmin, (req, res, next) => {
  uploadPlaces(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      const files = processUploadedFiles(req.files);
      
      logger.info('Places images uploaded', { 
        userId: req.user._id, 
        fileCount: files.length,
        ip: req.ip 
      });
      
      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          files: files,
          count: files.length
        }
      });
    } catch (error) {
      logger.error('Places upload processing error', { 
        error: error.message, 
        userId: req.user._id 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
});

// Upload images for hotels
router.post('/hotels', authenticateToken, requireAdmin, (req, res, next) => {
  uploadHotels(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      const files = processUploadedFiles(req.files);
      
      logger.info('Hotels images uploaded', { 
        userId: req.user._id, 
        fileCount: files.length,
        ip: req.ip 
      });
      
      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          files: files,
          count: files.length
        }
      });
    } catch (error) {
      logger.error('Hotels upload processing error', { 
        error: error.message, 
        userId: req.user._id 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
});

// Upload images for packages
router.post('/packages', authenticateToken, requireAdmin, (req, res, next) => {
  uploadPackages(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      const files = processUploadedFiles(req.files);
      
      logger.info('Packages images uploaded', { 
        userId: req.user._id, 
        fileCount: files.length,
        ip: req.ip 
      });
      
      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          files: files,
          count: files.length
        }
      });
    } catch (error) {
      logger.error('Packages upload processing error', { 
        error: error.message, 
        userId: req.user._id 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded files',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
});

// Upload single image
router.post('/single', authenticateToken, requireAdmin, (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      const file = processSingleFile(req.file);
      
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      logger.info('Single image uploaded', { 
        userId: req.user._id, 
        fileName: file.originalName,
        ip: req.ip 
      });
      
      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          file: file
        }
      });
    } catch (error) {
      logger.error('Single upload processing error', { 
        error: error.message, 
        userId: req.user._id 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded file',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });
});

// Get upload limits and info
router.get('/info', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      limits: {
        maxFileSize: '5MB',
        maxFiles: 5,
        allowedTypes: ['JPEG', 'JPG', 'PNG', 'GIF', 'WebP']
      },
      note: 'In serverless environment, files are processed in memory and should be uploaded to cloud storage for persistence.'
    }
  });
});

module.exports = router;

