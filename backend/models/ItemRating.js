const mongoose = require('mongoose');

const itemRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
  itemName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' }
}, { timestamps: true });

itemRatingSchema.index({ userId: 1, orderId: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('ItemRating', itemRatingSchema);
