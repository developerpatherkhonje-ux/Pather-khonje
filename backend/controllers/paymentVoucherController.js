const PaymentVoucher = require('../models/PaymentVoucher');
const logger = require('../utils/logger');

// Generate voucher number helper
async function generateVoucherNumber() {
  // Find the highest existing voucher number
  const lastVoucher = await PaymentVoucher.findOne({})
    .sort({ voucherNumber: -1 })
    .select('voucherNumber');
  
  let nextNumber = 1;
  if (lastVoucher && lastVoucher.voucherNumber) {
    // Extract the number part from the last voucher number (e.g., PAY001 -> 1)
    const lastNumber = parseInt(lastVoucher.voucherNumber.replace('PAY', ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  const paddedNumber = String(nextNumber).padStart(3, '0');
  return `PAY${paddedNumber}`;
}

exports.createPaymentVoucher = async (req, res, next) => {
  try {
    const data = req.body;
    console.log('Backend - Received payment voucher data:', JSON.stringify(data, null, 2));
    
    // Generate voucher number if not provided
    if (!data.voucherNumber) {
      data.voucherNumber = await generateVoucherNumber();
    }
    
    // Set created by
    data.createdBy = req.user?._id;
    
    // Calculate due amount
    data.due = Number(data.total || 0) - Number(data.advance || 0);
    
    console.log('Backend - Data before saving:', JSON.stringify(data, null, 2));
    const voucher = await PaymentVoucher.create(data);
    console.log('Backend - Saved payment voucher:', voucher.voucherNumber);
    
    res.status(201).json({ 
      success: true, 
      message: 'Payment voucher created successfully',
      data: {
        id: voucher._id,
        voucherNumber: voucher.voucherNumber,
        date: voucher.date ? voucher.date.toISOString().split('T')[0] : '',
        payeeName: voucher.payeeName,
        contact: voucher.contact,
        address: voucher.address,
        tourCode: voucher.tourCode,
        category: voucher.category,
        expenseOther: voucher.expenseOther,
        description: voucher.description,
        advance: voucher.advance,
        total: voucher.total,
        due: voucher.due,
        paymentMethod: voucher.paymentMethod,
        createdAt: voucher.createdAt ? voucher.createdAt.toISOString().split('T')[0] : '',
        createdBy: voucher.createdBy
      }
    });
  } catch (error) { 
    console.error('Backend - Create payment voucher error:', error);
    next(error); 
  }
};

exports.updatePaymentVoucher = async (req, res, next) => {
  try {
    const data = req.body;
    
    // Recalculate due amount if financial fields are updated
    if (data.total !== undefined || data.advance !== undefined) {
      const currentVoucher = await PaymentVoucher.findById(req.params.id);
      if (currentVoucher) {
        const total = data.total !== undefined ? data.total : currentVoucher.total;
        const advance = data.advance !== undefined ? data.advance : currentVoucher.advance;
        data.due = Number(total) - Number(advance);
      }
    }
    
    console.log('Backend - Updating payment voucher:', req.params.id, 'with data:', JSON.stringify(data, null, 2));
    const updated = await PaymentVoucher.findByIdAndUpdate(req.params.id, data, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Payment voucher not found' });
    
    console.log('Backend - Updated payment voucher:', updated.voucherNumber);
    res.json({ 
      success: true, 
      message: 'Payment voucher updated successfully',
      data: {
        id: updated._id,
        voucherNumber: updated.voucherNumber,
        date: updated.date ? updated.date.toISOString().split('T')[0] : '',
        payeeName: updated.payeeName,
        contact: updated.contact,
        address: updated.address,
        tourCode: updated.tourCode,
        category: updated.category,
        expenseOther: updated.expenseOther,
        description: updated.description,
        advance: updated.advance,
        total: updated.total,
        due: updated.due,
        paymentMethod: updated.paymentMethod,
        createdAt: updated.createdAt ? updated.createdAt.toISOString().split('T')[0] : '',
        createdBy: updated.createdBy
      }
    });
  } catch (error) { 
    console.error('Backend - Update payment voucher error:', error);
    next(error); 
  }
};

exports.deletePaymentVoucher = async (req, res, next) => {
  try {
    const deleted = await PaymentVoucher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Payment voucher not found' });
    res.json({ 
      success: true, 
      message: 'Payment voucher deleted successfully'
    });
  } catch (error) { 
    console.error('Backend - Delete payment voucher error:', error);
    next(error); 
  }
};

exports.getPaymentVouchers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search, startDate, endDate } = req.query;
    const filter = { isActive: true };
    
    if (category && category !== 'all') filter.category = category;
    if (search) {
      filter.$or = [
        { voucherNumber: { $regex: search, $options: 'i' } },
        { payeeName: { $regex: search, $options: 'i' } },
        { tourCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    const vouchers = await PaymentVoucher.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    const total = await PaymentVoucher.countDocuments(filter);
    
    // Calculate summary statistics
    const totalExpenses = await PaymentVoucher.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' }, advance: { $sum: '$advance' }, due: { $sum: '$due' } } }
    ]);
    
    const monthlyExpenses = await PaymentVoucher.aggregate([
      { 
        $match: { 
          ...filter,
          date: { 
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    console.log('Backend - Retrieved payment vouchers:', vouchers.length, 'vouchers');
    res.json({ 
      success: true, 
      data: { 
        items: vouchers.map(v => ({
          id: v._id,
          voucherNumber: v.voucherNumber,
          date: v.date ? v.date.toISOString().split('T')[0] : '',
          payeeName: v.payeeName,
          contact: v.contact,
          address: v.address,
          tourCode: v.tourCode,
          category: v.category,
          expenseOther: v.expenseOther,
          description: v.description,
          advance: v.advance,
          total: v.total,
          due: v.due,
          paymentMethod: v.paymentMethod,
          createdAt: v.createdAt ? v.createdAt.toISOString().split('T')[0] : '',
          createdBy: v.createdBy ? {
            id: v.createdBy._id,
            name: v.createdBy.name,
            email: v.createdBy.email
          } : null
        })),
        total,
        summary: {
          totalExpenses: totalExpenses[0]?.total || 0,
          totalAdvance: totalExpenses[0]?.advance || 0,
          totalDue: totalExpenses[0]?.due || 0,
          monthlyExpenses: monthlyExpenses[0]?.total || 0
        }
      }
    });
  } catch (error) { 
    console.error('Backend - Get payment vouchers error:', error);
    next(error); 
  }
};

exports.getPaymentVoucherById = async (req, res, next) => {
  try {
    const voucher = await PaymentVoucher.findById(req.params.id).populate('createdBy', 'name email').lean();
    if (!voucher) return res.status(404).json({ success: false, message: 'Payment voucher not found' });
    
    res.json({ 
      success: true, 
      data: {
        id: voucher._id,
        voucherNumber: voucher.voucherNumber,
        date: voucher.date ? voucher.date.toISOString().split('T')[0] : '',
        payeeName: voucher.payeeName,
        contact: voucher.contact,
        address: voucher.address,
        tourCode: voucher.tourCode,
        category: voucher.category,
        expenseOther: voucher.expenseOther,
        description: voucher.description,
        advance: voucher.advance,
        total: voucher.total,
        due: voucher.due,
        paymentMethod: voucher.paymentMethod,
        createdAt: voucher.createdAt ? voucher.createdAt.toISOString().split('T')[0] : '',
        createdBy: voucher.createdBy ? {
          id: voucher.createdBy._id,
          name: voucher.createdBy.name,
          email: voucher.createdBy.email
        } : null
      }
    });
  } catch (error) { 
    console.error('Backend - Get payment voucher by ID error:', error);
    next(error); 
  }
};

// Download voucher PDF
exports.downloadPaymentVoucherPdf = async (req, res, next) => {
  try {
    const voucher = await PaymentVoucher.findById(req.params.id).populate('createdBy', 'name email').lean();
    if (!voucher) return res.status(404).json({ success: false, message: 'Payment voucher not found' });

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${voucher.voucherNumber}.pdf`);

    doc.pipe(res);

    // Header
    try {
      doc.image('../frontend/public/logo/Pather Khonje Logo.png', 40, 30, { width: 50 }).moveDown();
    } catch (logoError) {
      console.warn('Logo could not be loaded for PDF:', logoError);
    }
    doc.fontSize(20).fillColor('#0ea5e9').text('Pather Khonje', 100, 35);
    doc.fillColor('#6b7280').fontSize(10).text('A tour that never seen before.', 100, 58);
    doc.moveDown();
    doc.strokeColor('#93c5fd').moveTo(40, 90).lineTo(555, 90).stroke();

    // Title
    doc.fontSize(16).fillColor('#0ea5e9').text('Payment Voucher', 40, 110);
    doc.fontSize(10).fillColor('#6b7280').text(`Voucher #${voucher.voucherNumber}`, 40, 130);
    const formattedDate = voucher.date ? voucher.date.toISOString().split('T')[0] : '';
    doc.text(`Date: ${formattedDate}`, 460, 110);

    // Voucher Details
    doc.roundedRect(40, 150, 515, 80, 8).fillAndStroke('#f8fafc', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Voucher Details', 50, 160);
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Voucher Number: ${voucher.voucherNumber}`, 50, 180);
    doc.text(`Date: ${formattedDate}`, 280, 180);
    doc.text(`Category: ${voucher.category.charAt(0).toUpperCase() + voucher.category.slice(1)}`, 50, 196);
    doc.text(`Payment Method: ${voucher.paymentMethod.charAt(0).toUpperCase() + voucher.paymentMethod.slice(1)}`, 280, 196);

    // Payee Information
    let y = 250;
    doc.roundedRect(40, y, 515, 100, 8).fillAndStroke('#eff6ff', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Payee Information', 50, y + 10);
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Name: ${voucher.payeeName}`, 50, y + 30);
    doc.text(`Contact: ${voucher.contact || 'N/A'}`, 280, y + 30);
    doc.text(`Address: ${voucher.address || 'N/A'}`, 50, y + 46);
    doc.text(`Tour Code: ${voucher.tourCode || 'N/A'}`, 50, y + 62);
    y += 120;

    // Expense Details
    doc.roundedRect(40, y, 515, 80, 8).fillAndStroke('#ecfdf5', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Expense Details', 50, y + 10);
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Category: ${voucher.category.charAt(0).toUpperCase() + voucher.category.slice(1)}`, 50, y + 30);
    if (voucher.expenseOther) {
      doc.text(`Other: ${voucher.expenseOther}`, 280, y + 30);
    }
    doc.text(`Description: ${voucher.description || 'N/A'}`, 50, y + 46);
    y += 100;

    // Payment Summary
    doc.roundedRect(40, y, 515, 130, 8).fillAndStroke('#ffffff', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Payment Summary', 50, y + 10);
    doc.fontSize(10).fillColor('#374151');
    const rows = [
      ['Total Amount', voucher.total],
      ['Advance Paid', voucher.advance],
      ['Amount Due', voucher.due]
    ];
    let ry = y + 30;
    rows.forEach(([label, amount]) => {
      doc.text(label, 50, ry);
      doc.text(`₹${Number(amount).toLocaleString('en-IN')}`, 480, ry, { width: 60, align: 'right' });
      ry += 18;
    });

    // Footer
    doc.moveDown();
    doc.fontSize(10).fillColor('#6b7280').text('\nCreated by: ' + (voucher.createdBy?.name || 'System'), 40, ry + 40);
    doc.text(`Created on: ${voucher.createdAt.toLocaleDateString()}`, 40, ry + 60);
    
    // Add stamp
    try {
      doc.image('../frontend/public/assets/stamp.png', 400, ry + 20, { width: 100 });
      doc.fontSize(8).fillColor('#6b7280').text('Authorized Signature & Stamp', 400, ry + 130, { align: 'center' });
    } catch (stampError) {
      console.warn('Stamp could not be loaded for PDF:', stampError);
    }

    doc.end();
  } catch (error) { 
    console.error('Backend - Download voucher PDF error:', error);
    next(error); 
  }
};
