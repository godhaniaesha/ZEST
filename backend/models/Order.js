const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  table: { type: String, required: true },
  waiter: { type: String, required: true },
  items: { type: String, required: true },
  type: { type: String, enum: ['Cafe', 'Bar'], required: true },
  amount: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Served', 'Cancelled'], default: 'Pending' },
  time: { type: String, default: 'Just now' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
