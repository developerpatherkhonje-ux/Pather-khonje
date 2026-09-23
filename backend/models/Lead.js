const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minlength: [2, 'Lead name must be at least 2 characters'],
      maxlength: [100, 'Lead name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    queryPlace: {
      type: String,
      trim: true,
      maxlength: [150, 'Place of query cannot exceed 150 characters'],
    },
    queryType: {
      type: String,
      enum: ['package', 'hotel', 'transport', 'custom', 'other'],
      default: 'package',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [2000, 'Remarks cannot exceed 2000 characters'],
    },
    stage: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'proposal_sent', 'negotiation', 'converted', 'lost'],
      default: 'new',
      index: true,
    },
    nextFollowUp: {
      type: Date,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
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

leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: 1, phone: 1 });

leadSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    queryPlace: this.queryPlace,
    queryType: this.queryType,
    remarks: this.remarks,
    stage: this.stage,
    nextFollowUp: this.nextFollowUp,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    lastModifiedBy: this.lastModifiedBy,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Lead', leadSchema);
