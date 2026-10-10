const express = require('express');
const BusinessSettings = require('../models/BusinessSettings');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

const getSettings = async () => {
  let settings = await BusinessSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await BusinessSettings.create({ key: 'default' });
  }
  return settings;
};

router.get('/', async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const settings = await BusinessSettings.findOneAndUpdate(
      { key: 'default' },
      { ...req.body, key: 'default', updatedBy: req.user?._id },
      { new: true, upsert: true, runValidators: true },
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
