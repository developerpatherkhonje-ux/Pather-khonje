const mongoose = require('mongoose');

const paymentVoucherSchema = new mongoose.Schema({
  voucherNumber: {
    type: String,
    required: [true, 'Voucher number is required'],
    unique: true,
    trim: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Voucher date is required'],
    index: true
  },
  // Payee Information
  payeeName: {
    type: String,
    required: [true, 'Payee name is required'],
    trim: true,
    maxlength: [200, 'Payee name cannot exceed 200 characters']
  },
  contact: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact cannot exceed 100 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  tourCode: {
    type: String,
    trim: true,
    maxlength: [100, 'Tour code cannot exceed 100 characters']
  },
  // Expense Details
  category: {
    type: String,
    required: [true, 'Expense category is required'],
    enum: ['hotel', 'transport', 'food', 'guide', 'other'],
    default: 'hotel',
    index: true
  },
  expenseOther: {
    type: String,
    trim: true,
    maxlength: [200, 'Other expense details cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Payment Details
  advance: {
    type: Number,
    default: 0,
    min: [0, 'Advance payment cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  due: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'bank', 'upi'],
    default: 'cash'
  },
  // System fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Calculate due amount before saving
paymentVoucherSchema.pre('save', function(next) {
  this.due = this.total - this.advance;
  next();
});

// Indexes for better query performance
paymentVoucherSchema.index({ createdAt: -1 });
paymentVoucherSchema.index({ date: -1 });
paymentVoucherSchema.index({ category: 1, date: -1 });
paymentVoucherSchema.index({ payeeName: 1 });

// Virtual for formatted date
paymentVoucherSchema.virtual('formattedDate').get(function() {
  return this.date ? this.date.toISOString().split('T')[0] : '';
});

// Method to get public profile
paymentVoucherSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    voucherNumber: this.voucherNumber,
    date: this.formattedDate,
    payeeName: this.payeeName,
    contact: this.contact,
    address: this.address,
    tourCode: this.tourCode,
    category: this.category,
    expenseOther: this.expenseOther,
    description: this.description,
    advance: this.advance,
    total: this.total,
    due: this.due,
    paymentMethod: this.paymentMethod,
    createdBy: this.createdBy,
    createdAt: this.createdAt
  };
};

// Static method to generate voucher number
paymentVoucherSchema.statics.generateVoucherNumber = async function() {
  // Find the highest existing voucher number
  const lastVoucher = await this.findOne({})
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
};

module.exports = mongoose.model('PaymentVoucher', paymentVoucherSchema);
