const mongoose = require('mongoose');

const payeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Payee name is required'],
      trim: true,
      maxlength: [160, 'Payee name cannot exceed 160 characters'],
      index: true,
    },
    type: {
      type: String,
      enum: ['hotel', 'transport', 'vendor', 'staff', 'guide', 'other'],
      default: 'vendor',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [40, 'Phone cannot exceed 40 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: [700, 'Address cannot exceed 700 characters'],
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, 'GSTIN cannot exceed 20 characters'],
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      upi: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

payeeSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Payee', payeeSchema);
