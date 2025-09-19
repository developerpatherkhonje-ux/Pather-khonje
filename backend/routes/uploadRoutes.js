const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { uploadSingle, uploadMultiple, uploadToCloudinary, deleteImage, isCloudinaryConfigured } = require('../utils/cloudinary');

// Upload single image
router.post('/upload-single', uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Upload to Cloudinary only
    const result = await uploadToCloudinary(req.file.path, 'pather-khonje');
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      data: {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
  }
});

// Upload multiple images
router.post('/upload-multiple', uploadMultiple, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    const uploadedImages = [];
    const errors = [];

    // Process each file
    for (const file of req.files) {
      try {
        // Upload to Cloudinary only
        const result = await uploadToCloudinary(file.path, 'pather-khonje');
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format
        });

        // Clean up temporary file
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', file.originalname, error);
        errors.push({ file: file.originalname, error: error.message });
        
        // Clean up temporary file
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      }
    }

    res.json({
      success: uploadedImages.length > 0,
      data: {
        files: uploadedImages
      },
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up all temporary files
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }
    
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete image
router.delete('/delete/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await deleteImage(publicId);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get image URL with transformations
router.get('/url/:publicId', (req, res) => {
  try {
    const { publicId } = req.params;
    const { width, height, crop, quality } = req.query;
    
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const transformations = {};
    if (width) transformations.width = parseInt(width);
    if (height) transformations.height = parseInt(height);
    if (crop) transformations.crop = crop;
    if (quality) transformations.quality = quality;

    const { getImageUrl } = require('../utils/cloudinary');
    const url = getImageUrl(publicId, transformations);
    
    res.json({
      success: true,
      url: url
    });
  } catch (error) {
    console.error('URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate image URL' });
  }
});

module.exports = router;
