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
    revenueTarget: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Branch', branchSchema);
