const mongoose = require('mongoose');

const cuisineSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  img: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Cuisine', cuisineSchema);
