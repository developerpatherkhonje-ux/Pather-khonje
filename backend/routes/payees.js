const express = require('express');
const Payee = require('../models/Payee');
const PaymentVoucher = require('../models/PaymentVoucher');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', type = '' } = req.query;
    const filter = { isActive: true };
    if (type && type !== 'all') filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Payee.find(filter)
        .sort({ updatedAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Payee.countDocuments(filter),
    ]);

    const payeeIds = items.map((item) => item._id);
    const summaries = await PaymentVoucher.aggregate([
      { $match: { payee: { $in: payeeIds }, isActive: true } },
      {
        $group: {
          _id: '$payee',
          voucherCount: { $sum: 1 },
          totalExpense: { $sum: '$total' },
          totalPaid: { $sum: '$advance' },
          totalDue: { $sum: '$due' },
        },
      },
    ]);
    const summaryMap = new Map(summaries.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      data: {
        items: items.map((item) => ({
          ...item,
          summary: summaryMap.get(String(item._id)) || {
            voucherCount: 0,
            totalExpense: 0,
            totalPaid: 0,
            totalDue: 0,
          },
        })),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payee = await Payee.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: payee });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const payee = await Payee.findById(req.params.id).lean();
    if (!payee) return res.status(404).json({ success: false, message: 'Payee not found' });
    const vouchers = await PaymentVoucher.find({ payee: payee._id, isActive: true }).sort({ date: -1 }).lean();
    res.json({ success: true, data: { payee, vouchers } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const payee = await Payee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!payee) return res.status(404).json({ success: false, message: 'Payee not found' });
    res.json({ success: true, data: payee });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const payee = await Payee.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!payee) return res.status(404).json({ success: false, message: 'Payee not found' });
    res.json({ success: true, message: 'Payee archived' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
