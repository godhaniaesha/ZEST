const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffName: { type: String, required: true },
  role: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'half-day', 'on-leave'], default: 'present' },
  checkIn: { type: String },
  checkOut: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Index for efficient queries
attendanceSchema.index({ staffId: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
