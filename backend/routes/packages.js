const express = require('express');
const { body, validationResult } = require('express-validator');
const Package = require('../models/Package');
const { authenticateToken, requireAdmin, sanitizeInput } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.use(sanitizeInput);

const pkgValidation = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),
  body('image').optional().isString(),
  body('description').trim().isLength({ min: 3, max: 2000 }).withMessage('Description 3-2000 chars'),
  body('duration').trim().isLength({ min: 1, max: 100 }).withMessage('Duration is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('rating').optional({ nullable: true }).isFloat().withMessage('Rating must be a number'),
  body('highlights').optional().isArray().withMessage('Highlights must be array'),
  body('category').optional().isString(),
  body('bestTime').optional().isString(),
  body('groupSize').optional().isString()
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// Public: list packages
router.get('/', async (req, res) => {
  try {
    const list = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: { packages: list.map(p => p.getPublicProfile()) } });
  } catch (e) {
    logger.error('Get packages error', { error: e.message });
    res.status(500).json({ success: false, message: 'Failed to get packages' });
  }
});

// Admin: create package
router.post('/', authenticateToken, requireAdmin, pkgValidation, handleValidationErrors, async (req, res) => {
  try {
    const payload = { ...req.body };
    // Normalize numeric fields
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.rating !== undefined && payload.rating !== null && payload.rating !== '') {
      payload.rating = Number(payload.rating);
      if (!Number.isNaN(payload.rating)) {
        if (payload.rating > 5) payload.rating = 5;
        if (payload.rating < 1) payload.rating = 1;
      } else {
        delete payload.rating;
      }
    }

    const pkg = new Package(payload);
    await pkg.save();
    res.status(201).json({ success: true, message: 'Package created', data: { package: pkg.getPublicProfile() } });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const errors = Object.values(e.errors).map(err => ({ field: err.path, message: err.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    logger.error('Create package error', { error: e.message });
    res.status(500).json({ success: false, message: 'Failed to create package' });
  }
});

// Admin: update package
router.put('/:id', authenticateToken, requireAdmin, pkgValidation, handleValidationErrors, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.rating !== undefined && payload.rating !== null && payload.rating !== '') {
      payload.rating = Number(payload.rating);
      if (!Number.isNaN(payload.rating)) {
        if (payload.rating > 5) payload.rating = 5;
        if (payload.rating < 1) payload.rating = 1;
      } else {
        delete payload.rating;
      }
    }
    const pkg = await Package.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package updated', data: { package: pkg.getPublicProfile() } });
  } catch (e) {
    if (e.name === 'ValidationError') {
      const errors = Object.values(e.errors).map(err => ({ field: err.path, message: err.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    logger.error('Update package error', { error: e.message });
    res.status(500).json({ success: false, message: 'Failed to update package' });
  }
});

// Admin: delete package
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
    res.json({ success: true, message: 'Package deleted' });
  } catch (e) {
    logger.error('Delete package error', { error: e.message });
    res.status(500).json({ success: false, message: 'Failed to delete package' });
  }
});

module.exports = router;


