const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const BusinessSettings = require('../models/BusinessSettings');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const frontendPublicPath = path.resolve(__dirname, '../../frontend/public');
const logoPath = path.join(frontendPublicPath, 'logo', 'pather-khonje-logo.png');
const stampPath = path.join(frontendPublicPath, 'assets', 'stamp.png');

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN');
};

const drawSection = (doc, title, y, height) => {
  doc.roundedRect(40, y, 515, height, 6).fillAndStroke('#ffffff', '#dbe4ea');
  doc.fillColor('#071c23').fontSize(11).font('Helvetica-Bold').text(title, 52, y + 12);
  doc.strokeColor('#e8b85c').moveTo(52, y + 30).lineTo(543, y + 30).stroke();
};

const drawKeyValue = (doc, label, value, x, y, width = 220) => {
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#64748b').text(label.toUpperCase(), x, y);
  doc.font('Helvetica').fontSize(10).fillColor('#071c23').text(value || 'N/A', x, y + 12, {
    width,
    lineGap: 2,
  });
};

// Generate invoice number helper (prefix + padded count)
async function generateInvoiceNumber(type) {
  const settings = await BusinessSettings.findOne({ key: 'default' }).lean();
  const templatePrefix = settings?.invoice?.templates?.[type]?.prefix;
  const prefix = templatePrefix || (type === 'hotel' ? 'HTL' : type === 'car' ? 'CAR' : 'TUR');
  
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

async function upsertCustomerFromInvoice(data, userId) {
  if (data.customerRef) return data.customerRef;
  const customer = data.customer || {};
  if (!customer.name && !customer.phone && !customer.email) return null;

  const existing = await Customer.findOne({
    isActive: true,
    $or: [
      ...(customer.phone ? [{ phone: customer.phone }] : []),
      ...(customer.email ? [{ email: String(customer.email).toLowerCase() }] : []),
    ],
  });

  if (existing) {
    existing.name = customer.name || existing.name;
    existing.phone = customer.phone || existing.phone;
    existing.email = customer.email || existing.email;
    existing.address = customer.address || existing.address;
    await existing.save();
    return existing._id;
  }

  const created = await Customer.create({
    name: customer.name || 'Unnamed Customer',
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    branch: data.branch || null,
    createdBy: userId,
  });
  return created._id;
}

function applySettingsDefaults(data, settings) {
  const gstEnabled = Boolean(settings?.invoice?.gstEnabled);
  const defaultGstPercent = Number(settings?.invoice?.defaultGstPercent || 0);
  if (gstEnabled && !Number(data.gstPercent || 0)) {
    data.gstPercent = defaultGstPercent;
  }
  if (gstEnabled && Number(data.gstPercent || 0) > 0 && !Number(data.tax || 0)) {
    const taxable = Math.max(Number(data.subtotal || 0) - Number(data.discount || 0), 0);
    data.tax = Math.round((taxable * Number(data.gstPercent || 0)) / 100);
    data.total = taxable + Number(data.tax || 0);
  }
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
        const settings = await BusinessSettings.findOne({ key: 'default' }).lean();
        applySettingsDefaults(data, settings);
        if (!data.invoiceNumber) {
          data.invoiceNumber = await generateInvoiceNumber(data.type);
        }
        data.customerRef = await upsertCustomerFromInvoice(data, req.user?._id);
        data.dueAmount = Number(data.total || 0) - Number(data.advancePaid || 0);
        data.createdBy = req.user?._id;
        
        // Set initial status based on due amount if not provided
        data.status = data.dueAmount <= 0 ? 'paid' : Number(data.advancePaid || 0) > 0 ? 'partial' : 'pending';
        
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
    if (data.status && !['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'].includes(data.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
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
          } else if (Number(advancePaid || 0) > 0) {
            data.status = 'partial';
          } else {
            data.status = 'pending';
          }
        }
      }
    }
    if (data.customer) {
      data.customerRef = await upsertCustomerFromInvoice(data, req.user?._id);
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
    const { page = 1, limit = 20, type, search, customerId } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (customerId) filter.customerRef = customerId;
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    const invoices = await Invoice.find(filter)
      .populate('customerRef', 'name phone email')
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
        const status = dueAmount <= 0 ? 'paid' : Number(invoice.advancePaid || 0) > 0 ? 'partial' : 'pending';
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
    const invoice = await Invoice.findById(req.params.id).populate('customerRef', 'name phone email address');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

// Stream PDF directly to response, do not store binary in DB
exports.downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customerRef', 'name phone email address');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true, autoFirstPage: true });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

    doc.pipe(res);

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 28, { width: 58 });
    }
    const title = invoice.type === 'hotel' ? 'Hotel Booking Invoice' : invoice.type === 'car' ? 'Car Rental Invoice' : 'Tour Package Invoice';

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#071c23').text('Pather Khonje', 112, 35);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('A Tour That Never Seen Before', 112, 62);
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#0b4a42').text(title, 360, 36, {
      width: 195,
      align: 'right',
    });
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text(`Invoice #${invoice.invoiceNumber}`, 360, 66, {
      width: 195,
      align: 'right',
    });
    doc.strokeColor('#e8b85c').lineWidth(1.5).moveTo(40, 95).lineTo(555, 95).stroke();

    drawSection(doc, 'Customer Details', 115, 100);
    drawKeyValue(doc, 'Name', invoice.customer?.name, 52, 153);
    drawKeyValue(doc, 'Phone', invoice.customer?.phone, 214, 153, 140);
    drawKeyValue(doc, 'Email', invoice.customer?.email, 366, 153, 170);
    drawKeyValue(doc, 'Address', invoice.customer?.address, 52, 184, 470);

    drawSection(doc, 'Invoice Details', 232, 74);
    drawKeyValue(doc, 'Date', formatDate(invoice.date), 52, 270, 120);
    drawKeyValue(doc, 'Type', invoice.type === 'hotel' ? 'Hotel Booking' : invoice.type === 'car' ? 'Car Rental' : 'Tour Package', 196, 270, 140);
    drawKeyValue(doc, 'Payment Method', invoice.paymentMethod || 'Cash', 360, 270, 170);

    let y = 323;
    if (invoice.type === 'hotel') {
      const d = invoice.hotelDetails || {};
      drawSection(doc, 'Hotel Booking Details', y, 132);
      drawKeyValue(doc, 'Hotel Name', d.hotelName, 52, y + 38, 230);
      drawKeyValue(doc, 'Place', d.place || d.location, 308, y + 38, 210);
      drawKeyValue(doc, 'Check In', formatDate(d.checkIn), 52, y + 70, 120);
      drawKeyValue(doc, 'Check Out', formatDate(d.checkOut), 182, y + 70, 120);
      drawKeyValue(doc, 'Room Type', d.roomType, 312, y + 70, 120);
      drawKeyValue(doc, 'Rooms', String(d.rooms || 0), 442, y + 70, 70);
      drawKeyValue(doc, 'Nights / Days', `${d.nights || 0} Nights / ${d.days || d.nights || 0} Days`, 52, y + 102, 160);
      drawKeyValue(doc, 'Price Per Night', formatCurrency(d.pricePerNight), 234, y + 102, 140);
      drawKeyValue(doc, 'Guests', `${d.adults || 0} Adults, ${d.children || 0} Children`, 396, y + 102, 140);
      y += 150;

      if (d.address || d.additionalBenefits) {
        drawSection(doc, 'Hotel Notes', y, 78);
        drawKeyValue(doc, 'Address', d.address, 52, y + 38, 235);
        drawKeyValue(doc, 'Additional Benefits', d.additionalBenefits, 310, y + 38, 220);
        y += 96;
      }
    } else if (invoice.type === 'tour') {
      const t = invoice.tourDetails || {};
      const transport = invoice.transportDetails || {};
      drawSection(doc, 'Tour Package Details', y, 130);
      drawKeyValue(doc, 'Package', t.packageName, 52, y + 38, 230);
      drawKeyValue(doc, 'Pax', t.pax || `${t.adults || 0} Adults, ${t.children || 0} Children`, 308, y + 38, 210);
      drawKeyValue(doc, 'Start Date', formatDate(t.startDate), 52, y + 70, 120);
      drawKeyValue(doc, 'End Date', formatDate(t.endDate), 182, y + 70, 120);
      drawKeyValue(doc, 'Duration', `${t.totalDays || t.days || 0} Days / ${t.totalNights || 0} Nights`, 312, y + 70, 120);
      drawKeyValue(doc, 'Transport', transport.modeOfTransport || t.modeOfTransport || t.transport, 442, y + 70, 90);
      drawKeyValue(doc, 'Pickup', transport.pickupPoint || t.pickupPoint || t.pickup, 52, y + 102, 235);
      drawKeyValue(doc, 'Drop', transport.dropPoint || t.dropPoint || t.drop, 310, y + 102, 220);
      y += 148;

      const hotels = Array.isArray(t.hotels) ? t.hotels : [];
      if (hotels.length > 0) {
        const sectionHeight = Math.min(112, 42 + hotels.length * 18);
        drawSection(doc, 'Included Hotels', y, sectionHeight);
        let hy = y + 40;
        hotels.slice(0, 4).forEach((hotel, index) => {
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#071c23').text(`${index + 1}. ${hotel.hotelName || 'Hotel'}`, 52, hy, { width: 190 });
          doc.font('Helvetica').fontSize(9).fillColor('#475569').text(hotel.place || 'N/A', 252, hy, { width: 95 });
          doc.text(`${formatDate(hotel.checkIn)} - ${formatDate(hotel.checkOut)}`, 354, hy, { width: 125 });
          doc.text(hotel.roomType || 'N/A', 485, hy, { width: 55 });
          hy += 18;
        });
        y += sectionHeight + 18;
      }
    } else {
      const c = invoice.carDetails || {};
      drawSection(doc, 'Car Rental Details', y, 132);
      drawKeyValue(doc, 'Car', c.carName, 52, y + 38, 190);
      drawKeyValue(doc, 'Vehicle No.', c.vehicleNumber, 260, y + 38, 120);
      drawKeyValue(doc, 'Route', c.route, 396, y + 38, 130);
      drawKeyValue(doc, 'Start Date', formatDate(c.startDate), 52, y + 70, 120);
      drawKeyValue(doc, 'End Date', formatDate(c.endDate), 182, y + 70, 120);
      drawKeyValue(doc, 'Days', String(c.days || 0), 312, y + 70, 80);
      drawKeyValue(doc, 'Rate / Day', formatCurrency(c.ratePerDay), 410, y + 70, 120);
      drawKeyValue(doc, 'Pickup', c.pickupPoint, 52, y + 102, 235);
      drawKeyValue(doc, 'Drop', c.dropPoint, 310, y + 102, 220);
      y += 150;
    }

    if (y > 610) {
      doc.addPage();
      y = 44;
    }

    drawSection(doc, 'Payment Summary', y, 150);
    const rows = [
      ['Subtotal', invoice.subtotal],
      ['Discount', -Math.abs(invoice.discount || 0)],
      [`GST / Tax (${invoice.gstPercent || 0}%)`, invoice.tax || 0],
      ['Total Amount', invoice.total],
      ['Advance Paid', invoice.advancePaid || 0],
      ['Due Amount', invoice.dueAmount || (invoice.total - (invoice.advancePaid || 0))]
    ];
    let ry = y + 42;
    rows.forEach(([label, amount]) => {
      const isTotal = label === 'Total Amount' || label === 'Due Amount';
      doc.font(isTotal ? 'Helvetica-Bold' : 'Helvetica').fontSize(isTotal ? 11 : 10).fillColor(isTotal ? '#071c23' : '#475569');
      doc.text(label, 52, ry);
      doc.text(formatCurrency(amount), 410, ry, { width: 120, align: 'right' });
      doc.strokeColor('#eef2f7').moveTo(52, ry + 15).lineTo(530, ry + 15).stroke();
      ry += 20;
    });

    y += 172;
    if (y > 650) {
      doc.addPage();
      y = 44;
    }

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#071c23').text('Terms & Conditions', 40, y);
    const terms =
      invoice.type === 'hotel'
        ? [
            'Check-in and check-out timings as per hotel policy.',
            'Any damage to property will be charged to the guest.',
            'Cancellation and refund as per company policy.',
          ]
        : [
            'Itinerary and services are subject to availability and local conditions.',
            'Any extra personal expenses are payable by the traveller.',
            'Cancellation and refund as per company policy.',
          ];
    doc.font('Helvetica').fontSize(8.5).fillColor('#64748b');
    terms.forEach((term, index) => {
      doc.text(`${index + 1}. ${term}`, 40, y + 18 + index * 13, { width: 300 });
    });

    const signX = 392;
    const signY = y - 8;
    if (fs.existsSync(stampPath)) {
      doc.image(stampPath, signX + 33, signY, { width: 92 });
    }
    doc.strokeColor('#071c23').lineWidth(1).moveTo(signX, signY + 88).lineTo(signX + 150, signY + 88).stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#071c23').text('Authorized Signatory', signX, signY + 96, {
      width: 150,
      align: 'center',
    });
    doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Pather Khonje', signX, signY + 110, {
      width: 150,
      align: 'center',
    });

    const pageRange = doc.bufferedPageRange();
    for (let i = pageRange.start; i < pageRange.start + pageRange.count; i += 1) {
      doc.switchToPage(i);
      doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text(
        `Generated by Pather Khonje Corporate Dashboard · Page ${i + 1} of ${pageRange.count}`,
        40,
        812,
        { width: 515, align: 'center' },
      );
    }

    doc.end();
  } catch (error) { next(error); }
};

exports.addInvoicePayment = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const amount = Number(req.body.amount || 0);
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    const receiptNumber = `RCT${String(Date.now()).slice(-8)}`;
    invoice.payments.push({
      amount,
      date: req.body.date || new Date(),
      method: req.body.method || req.body.paymentMethod || 'Cash',
      reference: req.body.reference,
      notes: req.body.notes,
      receiptNumber,
      receivedBy: req.user?._id,
    });
    invoice.recalculatePaymentStatus();
    await invoice.save();

    res.status(201).json({
      success: true,
      data: {
        invoice,
        payment: invoice.payments[invoice.payments.length - 1],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadPaymentReceiptPdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('customerRef', 'name phone email address');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const payment = invoice.payments.id(req.params.paymentId) || invoice.payments.find((item) => String(item._id) === req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment receipt not found' });

    const doc = new PDFDocument({ size: 'A4', margin: 44 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${payment.receiptNumber || 'receipt'}.pdf`);
    doc.pipe(res);

    if (fs.existsSync(logoPath)) doc.image(logoPath, 44, 32, { width: 56 });
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#071c23').text('Pather Khonje', 112, 38);
    doc.font('Helvetica').fontSize(9).fillColor('#64748b').text('A Tour That Never Seen Before', 112, 64);
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#0b4a42').text('Payment Receipt', 380, 42, { width: 160, align: 'right' });
    doc.strokeColor('#e8b85c').lineWidth(1.4).moveTo(44, 96).lineTo(552, 96).stroke();

    drawSection(doc, 'Receipt Details', 120, 116);
    drawKeyValue(doc, 'Receipt No.', payment.receiptNumber, 56, 160, 150);
    drawKeyValue(doc, 'Invoice No.', invoice.invoiceNumber, 226, 160, 150);
    drawKeyValue(doc, 'Payment Date', formatDate(payment.date), 396, 160, 130);
    drawKeyValue(doc, 'Customer', invoice.customer?.name || invoice.customerRef?.name, 56, 194, 210);
    drawKeyValue(doc, 'Phone', invoice.customer?.phone || invoice.customerRef?.phone, 286, 194, 120);
    drawKeyValue(doc, 'Method', payment.method, 426, 194, 100);

    drawSection(doc, 'Payment Amount', 260, 126);
    doc.font('Helvetica-Bold').fontSize(28).fillColor('#0b4a42').text(formatCurrency(payment.amount), 56, 306);
    doc.font('Helvetica').fontSize(10).fillColor('#64748b').text(`Reference: ${payment.reference || 'N/A'}`, 56, 344);
    doc.text(`Notes: ${payment.notes || 'N/A'}`, 56, 362, { width: 470 });

    drawSection(doc, 'Updated Invoice Balance', 420, 116);
    drawKeyValue(doc, 'Invoice Total', formatCurrency(invoice.total), 56, 466, 140);
    drawKeyValue(doc, 'Total Paid', formatCurrency(invoice.advancePaid), 226, 466, 140);
    drawKeyValue(doc, 'Balance Due', formatCurrency(invoice.dueAmount), 396, 466, 140);

    const signX = 390;
    if (fs.existsSync(stampPath)) doc.image(stampPath, signX + 32, 586, { width: 92 });
    doc.strokeColor('#071c23').moveTo(signX, 674).lineTo(signX + 150, 674).stroke();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#071c23').text('Authorized Signatory', signX, 682, { width: 150, align: 'center' });
    doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('Generated by Pather Khonje Corporate Dashboard', 44, 812, { width: 508, align: 'center' });
    doc.end();
  } catch (error) {
    next(error);
  }
};

