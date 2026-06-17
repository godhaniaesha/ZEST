const mongoose = require('mongoose');

const RESERVATION_ADVANCE_AMOUNT = 200;

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  seatingArea: { type: String },
  specialOccasion: { type: String, default: 'none' },
  specialRequests: { type: String },
  advanceAmount: { type: Number, default: RESERVATION_ADVANCE_AMOUNT },
  advancePaid: { type: Number, default: 0 },
  advancePaymentStatus: {
    type: String,
    enum: ['None', 'Pending', 'Paid'],
    default: 'None',
  },
  advancePaymentMethod: {
    type: String,
    enum: ['Card', 'UPI'],
  },
  stripePaymentIntentId: { type: String },
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Cancelled'],
    default: 'Pending',
  },
  fullPaymentDone: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

reservationSchema.statics.ADVANCE_AMOUNT = RESERVATION_ADVANCE_AMOUNT;

module.exports = mongoose.model('Reservation', reservationSchema);
