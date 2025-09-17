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
  checkIn: Date,
  checkOut: Date,
  nights: Number,
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

const InvoiceSchema = new mongoose.Schema({
  type: { type: String, enum: ['hotel', 'tour'], required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  customer: {
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: String }
  },
  hotelDetails: HotelDetailsSchema,
  tourDetails: TourDetailsSchema,
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
  paymentMethod: { type: String, default: 'Cash' },
  status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ type: 1, createdAt: -1 });
InvoiceSchema.index({ status: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);



