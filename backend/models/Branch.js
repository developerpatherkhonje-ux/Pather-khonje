const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [140, 'Branch name cannot exceed 140 characters'],
      index: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Branch code cannot exceed 20 characters'],
      index: true,
    },
    phone: String,
    email: String,
    address: String,
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['head_office', 'branch'],
      default: 'branch',
      index: true,
    },
    revenueTarget: {
      type: Number,
      default: 0,
    },
    targets: [
      {
        periodType: { type: String, enum: ['weekly', 'monthly', 'quarterly', 'yearly'], default: 'monthly' },
        period: { type: String, required: true },
        revenueTarget: { type: Number, default: 0 },
        bookingTarget: { type: Number, default: 0 },
        leadTarget: { type: Number, default: 0 },
        customerTarget: { type: Number, default: 0 },
      },
    ],
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

module.exports = mongoose.model('Branch', branchSchema);
