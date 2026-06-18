const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  minQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  unit: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Good', 'Low', 'Critical'],
    default: 'Good'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Inventory', inventorySchema);
