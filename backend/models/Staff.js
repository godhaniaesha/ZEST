const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  shift: { type: String, enum: ['Morning', 'Evening'], required: true },
  shiftStart: { type: String, default: '11:00' },
  shiftEnd: { type: String, default: '18:00' },
  status: { type: String, enum: ['On Duty', 'Off Duty', 'On Leave'], default: 'On Duty' },
  initials: { type: String, required: true },
  color: { type: String, default: '#C9A84C' },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  salary: { type: String },
  leavesTaken: { type: Number, default: 0 },
  leavesTotal: { type: Number, default: 12 },
  joiningDate: { type: Date }
}, { timestamps: true });

// Set default shift times based on shift
staffSchema.pre('save', function(next) {
  if (this.shift === 'Morning') {
    this.shiftStart = '11:00';
    this.shiftEnd = '18:00';
  } else if (this.shift === 'Evening') {
    this.shiftStart = '18:00';
    this.shiftEnd = '00:00';
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
