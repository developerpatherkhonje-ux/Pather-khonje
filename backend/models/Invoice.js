const mongoose = require('mongoose');

const LineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false });

const HotelDetailsSchema = new mongoose.Schema({
  hotelName: String,
  place: String,
  address: String,
  additionalBenefits: String,
  checkIn: Date,
  checkOut: Date,
  nights: Number,
  days: Number,
  roomType: String,
  rooms: Number,
  pricePerNight: Number,
  adults: Number,
  children: Number
}, { _id: false });

const TourDetailsSchema = new mongoose.Schema({
  packageName: String,
  startDate: Date,
  endDate: Date,
  days: Number,
  totalDays: Number,
  totalNights: Number,
  pax: String,
  adults: Number,
  children: Number,
  adultPrice: Number,
  childPrice: Number,
  inclusions: String,
  exclusions: String,
  hotels: [{ hotelName: String, place: String, checkIn: Date, checkOut: Date, roomType: String }],
  transport: String,
  modeOfTransport: String,
  fooding: String,
  pickup: String,
  pickupPoint: String,
  drop: String,
  dropPoint: String,
  includedTransportDetails: String
}, { _id: false });

const CarDetailsSchema = new mongoose.Schema({
  carName: String,
  vehicleNumber: String,
  route: String,
  pickupPoint: String,
  dropPoint: String,
  startDate: Date,
  endDate: Date,
  days: Number,
  ratePerDay: Number,
  driverName: String,
  driverPhone: String,
  inclusions: String,
  exclusions: String
}, { _id: false });

const PaymentEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  method: { type: String, default: 'Cash' },
  reference: String,
  notes: String,
  receiptNumber: String,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const InvoiceSchema = new mongoose.Schema({
  type: { type: String, enum: ['hotel', 'tour', 'car'], required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  customerRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null, index: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  hotelDetails: HotelDetailsSchema,
  tourDetails: TourDetailsSchema,
  carDetails: CarDetailsSchema,
  transportDetails: {
    modeOfTransport: String,
    fooding: String,
    pickupPoint: String,
    dropPoint: String,
    includedTransportDetails: String
  },
  lineItems: [LineItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 0 },
  total: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  payments: [PaymentEntrySchema],
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, enum: ['draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'], default: 'pending' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ type: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ customerRef: 1, createdAt: -1 });

InvoiceSchema.methods.recalculatePaymentStatus = function() {
  const paymentTotal = Array.isArray(this.payments)
    ? this.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    : 0;
  this.advancePaid = Math.max(Number(this.advancePaid || 0), paymentTotal);
  this.dueAmount = Math.max(Number(this.total || 0) - Number(this.advancePaid || 0), 0);
  if (this.status !== 'cancelled' && this.status !== 'draft') {
    if (this.dueAmount <= 0 && Number(this.total || 0) > 0) {
      this.status = 'paid';
    } else if (Number(this.advancePaid || 0) > 0) {
      this.status = 'partial';
    } else {
      this.status = 'pending';
    }
  }
};

InvoiceSchema.pre('save', function(next) {
  this.recalculatePaymentStatus();
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);



