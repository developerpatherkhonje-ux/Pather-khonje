const mongoose = require('mongoose');

const invoiceTemplateSchema = new mongoose.Schema(
  {
    title: String,
    prefix: String,
    terms: [String],
    showGst: { type: Boolean, default: false },
    gstPercent: { type: Number, default: 0 },
    showBankDetails: { type: Boolean, default: true },
    showSignature: { type: Boolean, default: true },
    notes: String,
  },
  { _id: false },
);

const businessSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
    },
    company: {
      name: { type: String, default: 'Pather Khonje' },
      tagline: { type: String, default: 'A Tour That Never Seen Before' },
      phone: String,
      email: String,
      address: String,
      gstin: String,
      whatsappNumber: String,
    },
    invoice: {
      gstEnabled: { type: Boolean, default: false },
      defaultGstPercent: { type: Number, default: 0 },
      autoSendEmail: { type: Boolean, default: false },
      autoSendWhatsapp: { type: Boolean, default: false },
      templates: {
        hotel: { type: invoiceTemplateSchema, default: () => ({ title: 'Hotel Booking Invoice', prefix: 'HTL' }) },
        tour: { type: invoiceTemplateSchema, default: () => ({ title: 'Tour Package Invoice', prefix: 'TUR' }) },
        car: { type: invoiceTemplateSchema, default: () => ({ title: 'Car Rental Invoice', prefix: 'CAR' }) },
      },
    },
    signature: {
      imageUrl: String,
      label: { type: String, default: 'Authorized Signatory' },
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      upi: String,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('BusinessSettings', businessSettingsSchema);
