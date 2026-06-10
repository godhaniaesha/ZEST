const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Cafe', 'Bar'], default: 'Cafe' },
  icon: { type: String },
  img: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
