const mongoose = require('mongoose');

const cuisineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Cafe', 'Bar'], required: true },
    img: { type: String, default: '' },
  },
  { timestamps: true }
);

cuisineSchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Cuisine', cuisineSchema);
