const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const AuditLog = require('../models/AuditLog');
const { authenticateToken, requireAdmin, sanitizeInput } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

router.use(authenticateToken, requireAdmin, sanitizeInput);

const leadValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 6, max: 30 }).withMessage('Phone number is required'),
  body('queryPlace').optional({ checkFalsy: true }).trim().isLength({ max: 150 }).withMessage('Place of query is too long'),
  body('queryType').optional().isIn(['package', 'hotel', 'transport', 'custom', 'other']).withMessage('Invalid query type'),
  body('remarks').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }).withMessage('Remarks cannot exceed 2000 characters'),
  body('stage').optional().isIn(['new', 'contacted', 'interested', 'proposal_sent', 'negotiation', 'converted', 'lost']).withMessage('Invalid lead stage'),
  body('nextFollowUp').optional({ checkFalsy: true }).isISO8601().withMessage('Next follow-up must be a valid date'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const logLeadAction = async (req, action, lead, details = {}) => {
  try {
    await AuditLog.logEvent({
      action,
      resource: 'LEAD',
      userId: req.user._id,
      details: {
        leadId: lead?._id,
        leadName: lead?.name,
        ...details,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true,
    });
  } catch (error) {
    logger.warn('Lead audit log skipped', { error: error.message });
  }
};

router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (req.query.stage && req.query.stage !== 'all') filter.stage = req.query.stage;
    if (req.query.queryType && req.query.queryType !== 'all') filter.queryType = req.query.queryType;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } },
        { queryPlace: { $regex: req.query.search, $options: 'i' } },
        { remarks: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const [leads, total, stageStats] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter),
      Lead.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        leads: leads.map((lead) => lead.getPublicProfile()),
        stats: stageStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get leads error', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to get leads' });
  }
});

router.post('/', leadValidation, handleValidationErrors, async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
    });

    await lead.save();
    await lead.populate('createdBy', 'name email');
    await logLeadAction(req, 'CREATE', lead);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: { lead: lead.getPublicProfile() },
    });
  } catch (error) {
    logger.error('Create lead error', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to create lead' });
  }
});

router.put('/:id', leadValidation, handleValidationErrors, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: req.user._id },
      { new: true, runValidators: true },
    )
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await logLeadAction(req, 'UPDATE', lead, { updatedFields: Object.keys(req.body) });

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: { lead: lead.getPublicProfile() },
    });
  } catch (error) {
    logger.error('Update lead error', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to update lead' });
  }
});

router.patch('/:id/stage', async (req, res) => {
  try {
    const allowedStages = ['new', 'contacted', 'interested', 'proposal_sent', 'negotiation', 'converted', 'lost'];
    if (!allowedStages.includes(req.body.stage)) {
      return res.status(400).json({ success: false, message: 'Invalid lead stage' });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { stage: req.body.stage, lastModifiedBy: req.user._id },
      { new: true, runValidators: true },
    )
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await logLeadAction(req, 'UPDATE', lead, { action: 'stage_change', stage: req.body.stage });

    res.json({
      success: true,
      message: 'Lead stage updated successfully',
      data: { lead: lead.getPublicProfile() },
    });
  } catch (error) {
    logger.error('Update lead stage error', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to update lead stage' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isActive: false, lastModifiedBy: req.user._id },
      { new: true },
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    await logLeadAction(req, 'DELETE', lead);

    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    logger.error('Delete lead error', { error: error.message, userId: req.user._id });
    res.status(500).json({ success: false, message: 'Failed to delete lead' });
  }
});

module.exports = router;
