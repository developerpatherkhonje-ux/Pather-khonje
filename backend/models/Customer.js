const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [140, 'Customer name cannot exceed 140 characters'],
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [40, 'Phone number cannot exceed 40 characters'],
      index: true,
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
    sourceLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
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

customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
