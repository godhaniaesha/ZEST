const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Evening', 'Both'], required: true },
  status: { type: String, enum: ['On Duty', 'Off Duty'], default: 'On Duty' },
  initials: { type: String, required: true },
  color: { type: String, default: '#C9A84C' }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
