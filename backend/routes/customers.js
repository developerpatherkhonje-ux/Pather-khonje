const express = require('express');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Lead = require('../models/Lead');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

const buildCustomerFilter = (query) => {
  const filter = { isActive: true };
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const filter = buildCustomerFilter(req.query);
    const [items, total] = await Promise.all([
      Customer.find(filter)
        .populate('branch', 'name code')
        .sort({ updatedAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Customer.countDocuments(filter),
    ]);

    const customerIds = items.map((item) => item._id);
    const summaries = await Invoice.aggregate([
      { $match: { customerRef: { $in: customerIds } } },
      {
        $group: {
          _id: '$customerRef',
          invoiceCount: { $sum: 1 },
          totalBilled: { $sum: '$total' },
          totalPaid: { $sum: '$advancePaid' },
          totalDue: { $sum: '$dueAmount' },
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
            invoiceCount: 0,
            totalBilled: 0,
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
    const customer = await Customer.create({
      ...req.body,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.post('/from-lead/:leadId', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      notes: lead.remarks,
      sourceLead: lead._id,
      createdBy: req.user?._id,
    });

    lead.stage = 'converted';
    lead.lastModifiedBy = req.user?._id;
    await lead.save();

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate('branch', 'name code').lean();
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const invoices = await Invoice.find({ customerRef: customer._id }).sort({ date: -1, createdAt: -1 }).lean();
    res.json({ success: true, data: { customer, invoices } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer archived' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
