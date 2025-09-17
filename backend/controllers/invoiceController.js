const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

// Generate invoice number helper (prefix + padded count)
async function generateInvoiceNumber(type) {
  const prefix = type === 'hotel' ? 'HTL' : 'TUR';
  
  // Find the highest existing invoice number for this type
  const lastInvoice = await Invoice.findOne({ type })
    .sort({ invoiceNumber: -1 })
    .select('invoiceNumber');
  
  let nextNumber = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    // Extract the number part from the last invoice number
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''));
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  const paddedNumber = String(nextNumber).padStart(4, '0');
  const generatedNumber = `${prefix}${paddedNumber}`;
  
  console.log(`Backend - Generated invoice number for ${type}: ${generatedNumber} (last invoice: ${lastInvoice?.invoiceNumber || 'none'})`);
  
  return generatedNumber;
}

exports.createInvoice = async (req, res, next) => {
  try {
    const data = req.body;
    console.log('Backend - Received invoice data:', JSON.stringify(data, null, 2));
    
    // Retry mechanism for handling potential race conditions
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        if (!data.invoiceNumber) {
          data.invoiceNumber = await generateInvoiceNumber(data.type);
        }
        data.dueAmount = Number(data.total || 0) - Number(data.advancePaid || 0);
        data.createdBy = req.user?._id;
        
        // Set initial status based on due amount if not provided
        if (!data.status) {
          data.status = data.dueAmount <= 0 ? 'paid' : 'pending';
        }
        
        console.log('Backend - Data before saving:', JSON.stringify(data, null, 2));
        const invoice = await Invoice.create(data);
        console.log('Backend - Saved invoice:', JSON.stringify(invoice, null, 2));
        
        res.status(201).json({ success: true, data: invoice });
        return;
      } catch (error) {
        // If it's a duplicate key error and we haven't exceeded max attempts, retry
        if (error.code === 11000 && attempts < maxAttempts - 1) {
          console.log(`Backend - Duplicate invoice number detected, retrying... (attempt ${attempts + 1})`);
          attempts++;
          // Generate a new invoice number for retry
          data.invoiceNumber = await generateInvoiceNumber(data.type);
          continue;
        }
        throw error;
      }
    }
  } catch (error) { 
    console.error('Backend - Create invoice error:', error);
    next(error); 
  }
};

exports.updateInvoice = async (req, res, next) => {
  try {
    const data = req.body;
    
    // If updating status, validate it
    if (data.status && !['pending', 'paid', 'overdue'].includes(data.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be pending, paid, or overdue.' });
    }
    
    // If updating financial fields, recalculate dueAmount
    if (data.total !== undefined || data.advancePaid !== undefined) {
      const currentInvoice = await Invoice.findById(req.params.id);
      if (currentInvoice) {
        const total = data.total !== undefined ? data.total : currentInvoice.total;
        const advancePaid = data.advancePaid !== undefined ? data.advancePaid : currentInvoice.advancePaid;
        data.dueAmount = Number(total) - Number(advancePaid);
        
        // Auto-update status based on due amount
        if (data.status === undefined) {
          if (data.dueAmount <= 0) {
            data.status = 'paid';
          } else {
            data.status = 'pending';
          }
        }
      }
    }
    
    console.log('Backend - Updating invoice:', req.params.id, 'with data:', JSON.stringify(data, null, 2));
    const updated = await Invoice.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Invoice not found' });
    
    console.log('Backend - Updated invoice:', JSON.stringify(updated, null, 2));
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.deleteInvoice = async (req, res, next) => {
  try {
    const deleted = await Invoice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, message: 'Invoice deleted' });
  } catch (error) { next(error); }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    const total = await Invoice.countDocuments(filter);
    
    // Update invoices that don't have status field (migration)
    const invoicesToUpdate = invoices.filter(inv => !inv.status);
    if (invoicesToUpdate.length > 0) {
      console.log(`Backend - Updating ${invoicesToUpdate.length} invoices without status field`);
      for (const invoice of invoicesToUpdate) {
        const dueAmount = Number(invoice.total || 0) - Number(invoice.advancePaid || 0);
        const status = dueAmount <= 0 ? 'paid' : 'pending';
        await Invoice.findByIdAndUpdate(invoice._id, { status });
        invoice.status = status; // Update the local object for response
      }
    }
    
    console.log('Backend - Retrieved invoices:', JSON.stringify(invoices, null, 2));
    res.json({ success: true, data: { items: invoices, total } });
  } catch (error) { next(error); }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

// Stream PDF directly to response, do not store binary in DB
exports.downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    // Header
    doc.image('frontend/public/logo/Pather Khonje Logo.png', 40, 30, { width: 50 }).moveDown();
    doc.fontSize(20).fillColor('#0ea5e9').text('Pather Khonje', 100, 35);
    doc.fillColor('#6b7280').fontSize(10).text('A tour that never seen before.', 100, 58);
    doc.moveDown();
    doc.strokeColor('#93c5fd').moveTo(40, 90).lineTo(555, 90).stroke();

    // Title
    const title = invoice.type === 'hotel' ? 'Hotel Booking Invoice' : 'Tour Package Invoice';
    doc.fontSize(16).fillColor('#0ea5e9').text(title, 40, 110);
    doc.fontSize(10).fillColor('#6b7280').text(`Invoice #${invoice.invoiceNumber}`, 40, 130);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`, 460, 110);

    // Customer Details
    doc.roundedRect(40, 150, 515, 80, 8).fillAndStroke('#f8fafc', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Customer Details', 50, 160);
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Name: ${invoice.customer?.name || ''}`, 50, 180);
    doc.text(`Email: ${invoice.customer?.email || ''}`, 280, 180);
    doc.text(`Phone: ${invoice.customer?.phone || ''}`, 50, 196);
    doc.text(`Address: ${invoice.customer?.address || ''}`, 280, 196);

    // Details
    let y = 250;
    if (invoice.type === 'hotel') {
      const d = invoice.hotelDetails || {};
      doc.roundedRect(40, y, 515, 70, 8).fillAndStroke('#eff6ff', '#e5e7eb');
      doc.fillColor('#111827').fontSize(12).text('Hotel Booking Details', 50, y + 10);
      doc.fontSize(10).fillColor('#374151');
      doc.text(`Hotel Name: ${d.hotelName || ''}`, 50, y + 30);
      doc.text(`Check-in: ${d.checkIn ? new Date(d.checkIn).toLocaleDateString() : ''}`, 250, y + 30);
      doc.text(`Check-out: ${d.checkOut ? new Date(d.checkOut).toLocaleDateString() : ''}`, 400, y + 30);
      doc.text(`Nights: ${d.nights || ''}`, 50, y + 46);
      doc.text(`Rooms: ${d.rooms || ''}`, 120, y + 46);
      doc.text(`Price/Night: ₹${d.pricePerNight || 0}`, 180, y + 46);
      y += 90;
    } else {
      const t = invoice.tourDetails || {};
      doc.roundedRect(40, y, 515, 70, 8).fillAndStroke('#ecfdf5', '#e5e7eb');
      doc.fillColor('#111827').fontSize(12).text('Tour Package Details', 50, y + 10);
      doc.fontSize(10).fillColor('#374151');
      doc.text(`Package: ${t.packageName || ''}`, 50, y + 30);
      doc.text(`Start: ${t.startDate ? new Date(t.startDate).toLocaleDateString() : ''}`, 250, y + 30);
      doc.text(`End: ${t.endDate ? new Date(t.endDate).toLocaleDateString() : ''}`, 400, y + 30);
      doc.text(`Pax: ${t.pax || ''}`, 50, y + 46);
      y += 90;
    }

    // Payment Summary
    doc.roundedRect(40, y, 515, 130, 8).fillAndStroke('#ffffff', '#e5e7eb');
    doc.fillColor('#111827').fontSize(12).text('Payment Summary', 50, y + 10);
    doc.fontSize(10).fillColor('#374151');
    const rows = [
      ['Subtotal', invoice.subtotal],
      ['Discount', -Math.abs(invoice.discount || 0)],
      ['Tax', invoice.tax || 0],
      ['Total Amount', invoice.total],
      ['Advance Paid', invoice.advancePaid || 0],
      ['Due Amount', invoice.dueAmount || (invoice.total - (invoice.advancePaid || 0))]
    ];
    let ry = y + 30;
    rows.forEach(([label, amount]) => {
      doc.text(label, 50, ry);
      doc.text(`₹${Number(amount).toLocaleString('en-IN')}`, 480, ry, { width: 60, align: 'right' });
      ry += 18;
    });
    doc.text(`Payment Method`, 50, ry);
    doc.text(invoice.paymentMethod || 'Cash', 480, ry, { width: 60, align: 'right' });

    // Terms
    doc.moveDown();
    doc.fontSize(10).fillColor('#6b7280').text('\nTerms and Conditions:', 40, ry + 40);
    const terms = [
      'Check-in and check-out timings as per hotel policy.',
      'Any damage to property will be charged to the guest.',
      'Smoking is prohibited inside rooms.',
      'Outside food and alcohol not allowed.',
      'Cancellation as per company policy.'
    ];
    terms.forEach((t) => doc.text(`- ${t}`));

    doc.end();
  } catch (error) { next(error); }
};



