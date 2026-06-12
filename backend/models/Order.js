const mongoose = require('mongoose');

// Define item schema for individual items with their own status
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Served', 'Cancelled'], 
    default: 'Pending' 
  }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  table: { type: String, required: true },
  waiter: { type: String, required: true },
  items: [itemSchema], // Array of items with individual status
  type: { type: String, enum: ['Dine-in', 'Bar'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Served', 'Cancelled'], default: 'Pending' },
  time: { type: String, default: 'Just now' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
