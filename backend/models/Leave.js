const mongoose = require('mongoose');



const leaveSchema = new mongoose.Schema({

  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  staffName: { type: String, required: true },

  role: { type: String, required: true },

  startDate: { type: Date, required: true },

  endDate: { type: Date, required: true },

  startTime: { type: String }, // Time in HH:MM format

  endTime: { type: String }, // Time in HH:MM format

  type: { type: String, enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'other'], required: true },

  reason: { type: String, required: true },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },

  days: { type: Number, required: true },

  rejectionReason: { type: String },

  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  approvedDate: { type: Date }

}, { timestamps: true });



// Index for efficient queries

leaveSchema.index({ staffId: 1, status: 1 });

leaveSchema.index({ status: 1 });

leaveSchema.index({ startDate: 1, endDate: 1 });



// Calculate days before saving
leaveSchema.pre('save', async function() {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    this.days = diffDays;
  }
});



module.exports = mongoose.model('Leave', leaveSchema);

