const { uploadToCloudinary, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Reusable Image Service for handling Cloudinary uploads
 * Used by both Place and Hotel models for consistent image handling
 */
class ImageService {
  /**
   * Process and upload multiple images to Cloudinary
   * @param {Array} files - Array of multer file objects
   * @param {string} folder - Cloudinary folder path
   * @returns {Object} - Result object with uploaded images and errors
   */
  static async processMultipleImages(files, folder = 'pather-khonje') {
    const uploadedImages = [];
    const errors = [];

    if (!files || files.length === 0) {
      return { uploadedImages, errors: [{ error: 'No files provided' }] };
    }

    // Process each uploaded file
    for (const file of files) {
      try {
        console.log('Processing file:', file.originalname, 'Size:', file.size, 'Path:', file.path);
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.path, folder);
        console.log('Cloudinary upload successful:', result.public_id);
        
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          uploadedAt: new Date()
        });

        // Clean up temporary file
        this.cleanupTempFile(file.path);
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', file.originalname, error.message);
        errors.push({ file: file.originalname, error: error.message });
        
        // Clean up temporary file even on error
        this.cleanupTempFile(file.path);
      }
    }

    return { uploadedImages, errors };
  }

  /**
   * Process a single image upload to Cloudinary
   * @param {Object} file - Multer file object
   * @param {string} folder - Cloudinary folder path
   * @returns {Object} - Cloudinary upload result
   */
  static async processSingleImage(file, folder = 'pather-khonje') {
    try {
      console.log('Processing single file:', file.originalname, 'Size:', file.size, 'Path:', file.path);
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.path, folder);
      console.log('Cloudinary upload successful:', result.public_id);
      
      // Clean up temporary file
      this.cleanupTempFile(file.path);

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.error('Error uploading single file to Cloudinary:', file.originalname, error.message);
      
      // Clean up temporary file even on error
      this.cleanupTempFile(file.path);
      
      throw error;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Object} - Deletion result
   */
  static async deleteCloudinaryImage(publicId) {
    try {
      const result = await deleteImage(publicId);
      console.log('Image deleted from Cloudinary:', publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', publicId, error.message);
      throw error;
    }
  }

  /**
   * Normalize image data from various formats to Cloudinary object
   * @param {Array|string|Object} images - Images in various formats
   * @returns {Array} - Normalized array of image objects
   */
  static normalizeImages(images) {
    if (!images) return [];
    
    // Convert to array if not already
    const imageArray = Array.isArray(images) ? images : [images];
    
    return imageArray
      .map((img) => {
        // If it's already a proper Cloudinary object
        if (img && typeof img === 'object' && img.public_id && img.url) {
          return img;
        }
        
        // If it's a string URL, convert to basic object
        if (typeof img === 'string' && img.trim()) {
          const url = img.trim();
          const publicId = this.extractCloudinaryPublicId(url);
          // Only accept Cloudinary URLs; otherwise, ignore (to prevent local storage fallback)
          if (publicId) {
            return {
              url,
              public_id: publicId,
              uploadedAt: new Date()
            };
          }
          return null; // Non-Cloudinary URLs are not accepted for normalization
        }
        
        // If it's an object with url property
        if (img && typeof img === 'object' && (img.url || img.secure_url)) {
          return {
            url: img.url || img.secure_url,
            public_id: img.public_id || null,
            width: img.width,
            height: img.height,
            format: img.format,
            uploadedAt: img.uploadedAt || new Date()
          };
        }
        
        return null;
      })
      .filter(Boolean); // Remove null values
  }

  /**
   * Get the primary image URL from images array
   * @param {Array} images - Array of image objects
   * @returns {string} - Primary image URL or empty string
   */
  static getPrimaryImageUrl(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return '';
    }
    
    return images[0].url || '';
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to temporary file
   */
  static cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Temporary file cleaned up:', filePath);
      }
    } catch (unlinkError) {
      console.error('Error cleaning up temporary file:', filePath, unlinkError.message);
    }
  }

  /**
   * Validate image format and size
   * @param {Object} file - Multer file object
   * @returns {Object} - Validation result
   */
  static validateImage(file) {
    const errors = [];
    
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      errors.push('File must be an image');
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }
    
    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.mimetype)) {
      errors.push('Supported formats: JPEG, PNG, GIF, WebP');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract Cloudinary public_id from a Cloudinary delivery URL
   * Example: https://res.cloudinary.com/demo/image/upload/v1699999999/folder/name.jpg
   * Returns: folder/name
   */
  static extractCloudinaryPublicId(urlStr) {
    try {
      const url = new URL(urlStr);
      if (!url.hostname.includes('res.cloudinary.com')) return null;

      // Pathname example: /<cloud_name>/image/upload/v1699999999/folder/name.jpg
      const parts = url.pathname.split('/').filter(Boolean);
      // Find the 'upload' segment
      const uploadIdx = parts.findIndex(p => p === 'upload');
      if (uploadIdx === -1 || uploadIdx + 1 >= parts.length) return null;

      // The segments after 'upload' may include a version (v123456)
      let afterUpload = parts.slice(uploadIdx + 1);
      if (afterUpload[0] && /^v\d+/.test(afterUpload[0])) {
        afterUpload = afterUpload.slice(1);
      }
      if (afterUpload.length === 0) return null;

      // Remove file extension from last segment
      const last = afterUpload[afterUpload.length - 1];
      const withoutExt = last.replace(/\.[^/.]+$/, '');
      afterUpload[afterUpload.length - 1] = withoutExt;

      return afterUpload.join('/');
    } catch (_) {
      return null;
    }
  }
}

module.exports = ImageService;
