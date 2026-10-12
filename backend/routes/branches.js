const express = require('express');
const Branch = require('../models/Branch');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const PaymentVoucher = require('../models/PaymentVoucher');
const { authenticateToken, requireAdmin, requirePermission } = require('../middleware/auth');
const { applyBranchScope, isHeadOfficeUser } = require('../utils/branchAccess');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

const getDateRange = (query = {}) => {
  if (query.startDate || query.endDate) {
    return {
      startDate: query.startDate ? new Date(query.startDate) : null,
      endDate: query.endDate ? new Date(query.endDate) : null,
    };
  }

  const now = new Date();
  const period = ['week', 'month', 'year', 'all'].includes(query.period) ? query.period : 'month';
  if (period === 'all') return { startDate: null, endDate: null };

  if (period === 'week') {
    const start = new Date(now);
    const day = start.getDay();
    start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }

  if (period === 'year') {
    return {
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
    };
  }

  return {
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
};

const withDate = (field, range) => {
  if (!range.startDate && !range.endDate) return {};
  const dateFilter = {};
  if (range.startDate) dateFilter.$gte = range.startDate;
  if (range.endDate) dateFilter.$lte = range.endDate;
  return { [field]: dateFilter };
};

router.get('/', requirePermission('reports:view'), async (req, res, next) => {
  try {
    const range = getDateRange(req.query);
    const branchFilter = isHeadOfficeUser(req.user)
      ? { isActive: true }
      : { isActive: true, _id: req.user.branch || null };
    const staffFilter = isHeadOfficeUser(req.user)
      ? { isActive: true }
      : { isActive: true, branch: req.user.branch || null };

    const branches = await Branch.find(branchFilter).populate('manager', 'name email designation').sort({ name: 1 }).lean();
    const staff = await User.find(staffFilter).select('-password -security').populate('branch', 'name code').sort({ name: 1 }).lean();
    const branchIds = branches.map((branch) => branch._id);
    const [leadStats, customerStats, invoiceStats, expenseStats] = await Promise.all([
      Lead.aggregate([{ $match: { isActive: true, branch: { $in: branchIds }, ...withDate('createdAt', range) } }, { $group: { _id: '$branch', total: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$stage', 'converted'] }, 1, 0] } } } }]),
      Customer.aggregate([{ $match: { isActive: true, branch: { $in: branchIds }, ...withDate('createdAt', range) } }, { $group: { _id: '$branch', total: { $sum: 1 } } }]),
      Invoice.aggregate([{ $match: { branch: { $in: branchIds }, ...withDate('date', range) } }, { $group: { _id: '$branch', bookings: { $sum: 1 }, revenue: { $sum: '$total' }, collected: { $sum: '$advancePaid' }, due: { $sum: '$dueAmount' } } }]),
      PaymentVoucher.aggregate([{ $match: { isActive: true, branch: { $in: branchIds }, ...withDate('date', range) } }, { $group: { _id: '$branch', expenses: { $sum: '$total' } } }]),
    ]);
    const [staffRevenue, staffLeads, staffCustomers] = await Promise.all([
      Invoice.aggregate([{ $match: { branch: { $in: branchIds }, createdBy: { $ne: null }, ...withDate('date', range) } }, { $group: { _id: '$createdBy', bookings: { $sum: 1 }, revenue: { $sum: '$total' }, collected: { $sum: '$advancePaid' }, due: { $sum: '$dueAmount' } } }]),
      Lead.aggregate([{ $match: { isActive: true, branch: { $in: branchIds }, createdBy: { $ne: null }, ...withDate('createdAt', range) } }, { $group: { _id: '$createdBy', leads: { $sum: 1 }, convertedLeads: { $sum: { $cond: [{ $eq: ['$stage', 'converted'] }, 1, 0] } } } }]),
      Customer.aggregate([{ $match: { isActive: true, branch: { $in: branchIds }, createdBy: { $ne: null }, ...withDate('createdAt', range) } }, { $group: { _id: '$createdBy', customers: { $sum: 1 } } }]),
    ]);

    const makeMap = (items) => new Map(items.map((item) => [String(item._id), item]));
    const leadMap = makeMap(leadStats);
    const customerMap = makeMap(customerStats);
    const invoiceMap = makeMap(invoiceStats);
    const expenseMap = makeMap(expenseStats);
    const staffRevenueMap = makeMap(staffRevenue);
    const staffLeadMap = makeMap(staffLeads);
    const staffCustomerMap = makeMap(staffCustomers);

    res.json({
      success: true,
      data: {
        period: {
          name: req.query.period || 'month',
          startDate: range.startDate,
          endDate: range.endDate,
        },
        branches: branches.map((branch) => ({
          ...branch,
          stats: {
            leads: leadMap.get(String(branch._id))?.total || 0,
            convertedLeads: leadMap.get(String(branch._id))?.converted || 0,
            customers: customerMap.get(String(branch._id))?.total || 0,
            bookings: invoiceMap.get(String(branch._id))?.bookings || 0,
            revenue: invoiceMap.get(String(branch._id))?.revenue || 0,
            collected: invoiceMap.get(String(branch._id))?.collected || 0,
            due: invoiceMap.get(String(branch._id))?.due || 0,
            expenses: expenseMap.get(String(branch._id))?.expenses || 0,
          },
        })),
        staff: staff.map((member) => ({
          ...member,
          performance: {
            ...(staffRevenueMap.get(String(member._id)) || { bookings: 0, revenue: 0, collected: 0, due: 0 }),
            ...(staffLeadMap.get(String(member._id)) || { leads: 0, convertedLeads: 0 }),
            ...(staffCustomerMap.get(String(member._id)) || { customers: 0 }),
          },
        })),
        access: { headOffice: isHeadOfficeUser(req.user) },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requirePermission('branches:manage'), async (req, res, next) => {
  try {
    if (!isHeadOfficeUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Head office access required' });
    }
    const branch = await Branch.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requirePermission('branches:manage'), async (req, res, next) => {
  try {
    if (!isHeadOfficeUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Head office access required' });
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requirePermission('branches:manage'), async (req, res, next) => {
  try {
    if (!isHeadOfficeUser(req.user)) {
      return res.status(403).json({ success: false, message: 'Head office access required' });
    }
    const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch archived' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
