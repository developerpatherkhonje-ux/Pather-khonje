const express = require('express');
const Branch = require('../models/Branch');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const branches = await Branch.find({ isActive: true }).populate('manager', 'name email designation').sort({ name: 1 }).lean();
    const staff = await User.find({ isActive: true }).select('-password -security').populate('branch', 'name code').sort({ name: 1 }).lean();
    res.json({ success: true, data: { branches, staff } });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const branch = await Branch.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch archived' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
