const mongoose = require('mongoose');

const reservationRatingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
    unique: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '', maxlength: 500 },
}, { timestamps: true });

reservationRatingSchema.index({ userId: 1, reservationId: 1 }, { unique: true });

module.exports = mongoose.model('ReservationRating', reservationRatingSchema);
