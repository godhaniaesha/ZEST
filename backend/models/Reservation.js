const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  guests: { type: Number, required: true },
  tableNumber: { type: Number, required: true },
  status: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
