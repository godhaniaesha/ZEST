const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ['Cafe', 'Bar'], required: true },
  status: { type: String, enum: ['Free', 'Occupied', 'Reserved'], default: 'Free' },
  location: { type: String, required: true }
}, { timestamps: true });

// Virtual to get display ID (C-01, B-01)
tableSchema.virtual('displayId').get(function() {
  const prefix = this.type === 'Bar' ? 'B' : 'C';
  return `${prefix}-${String(this.number).padStart(2, '0')}`;
});

// Include virtuals when converting to JSON
tableSchema.set('toJSON', { virtuals: true });
tableSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Table', tableSchema);
