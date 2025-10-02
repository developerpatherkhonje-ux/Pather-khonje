const express = require('express');
const { body, validationResult } = require('express-validator');
const {
  createPaymentVoucher,
  updatePaymentVoucher,
  deletePaymentVoucher,
  getPaymentVouchers,
  getPaymentVoucherById,
  downloadPaymentVoucherPdf
} = require('../controllers/paymentVoucherController');
const { authenticateToken, requireAdmin, sanitizeInput } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.use(sanitizeInput);

const voucherValidation = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('payeeName').trim().isLength({ min: 2, max: 200 }).withMessage('Payee name must be 2-200 characters'),
  body('contact').optional().trim().isLength({ max: 100 }).withMessage('Contact cannot exceed 100 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  body('tourCode').optional().trim().isLength({ max: 100 }).withMessage('Tour code cannot exceed 100 characters'),
  body('category').isIn(['hotel', 'transport', 'food', 'guide', 'other']).withMessage('Invalid category'),
  body('expenseOther').optional().trim().isLength({ max: 200 }).withMessage('Other expense details cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('advance').isNumeric().withMessage('Advance must be a number'),
  body('total').isNumeric().withMessage('Total amount must be a number'),
  body('paymentMethod').isIn(['cash', 'bank', 'upi']).withMessage('Invalid payment method')
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

// Admin: list payment vouchers (with pagination and filters)
router.get('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await getPaymentVouchers(req, res, next);
  } catch (error) {
    logger.error('Get payment vouchers error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get payment vouchers' });
  }
});

// Admin: create payment voucher
router.post('/', authenticateToken, requireAdmin, voucherValidation, handleValidationErrors, async (req, res, next) => {
  try {
    await createPaymentVoucher(req, res, next);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({ field: err.path, message: err.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    logger.error('Create payment voucher error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to create payment voucher' });
  }
});

// Admin: update payment voucher
router.put('/:id', authenticateToken, requireAdmin, voucherValidation, handleValidationErrors, async (req, res, next) => {
  try {
    await updatePaymentVoucher(req, res, next);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({ field: err.path, message: err.message }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    logger.error('Update payment voucher error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to update payment voucher' });
  }
});

// Admin: delete payment voucher
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await deletePaymentVoucher(req, res, next);
  } catch (error) {
    logger.error('Delete payment voucher error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to delete payment voucher' });
  }
});

// Admin: get payment voucher by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await getPaymentVoucherById(req, res, next);
  } catch (error) {
    logger.error('Get payment voucher by ID error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to get payment voucher' });
  }
});

// Admin: download payment voucher PDF
router.get('/:id/pdf', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    await downloadPaymentVoucherPdf(req, res, next);
  } catch (error) {
    logger.error('Download payment voucher PDF error', { error: error.message });
    res.status(500).json({ success: false, message: 'Failed to download voucher PDF' });
  }
});

module.exports = router;
