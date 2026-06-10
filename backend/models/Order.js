const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  table: { type: String, required: true },
  waiter: { type: String, required: true },
  items: { type: Array, required: true },
  type: { type: String, enum: ['Dine-in', 'Bar'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Served', 'Cancelled'], default: 'Pending' },
  time: { type: String, default: 'Just now' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Add user ID
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' } // Add reservation ID
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
