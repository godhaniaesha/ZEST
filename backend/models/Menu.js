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
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
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
  cuisineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cuisine'
  },

  description: {
    type: String,
    default: ''
  },

  rating: {
    type: Number,
    default: null
  },

  reviews: {
    type: Number,
    default: 0
  },

  prepTime: {
    type: String,
    default: '15 MIN'
  },

  calories: {
    type: String,
    default: ''
  },

  dietary: {
    type: String,
    enum: ['VEGETARIAN', 'NON-VEGETARIAN', 'VEGAN', 'GLUTEN-FREE', 'NONE'],
    default: 'NONE'
  },

  highlights: [{
    type: String
  }],

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
