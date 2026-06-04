const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ['Available', 'Sold Out'],
    default: 'Available'
  },

  type: [{
    type: String,
    enum: ['Cafe', 'Bar']
  }],

  cuisine: {
    type: String,
    required: true
  },

  color: {
    type: String,
    default: '#2ecc71'
  },

  img: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Menu', menuSchema);