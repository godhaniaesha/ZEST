const mongoose = require('mongoose');

const reportsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['revenue', 'orders', 'customers', 'inventory', 'staff', 'custom'],
    default: 'revenue'
  },
  dateRange: {
    startDate: {
      type: Date,
      default: () => new Date(new Date().setDate(new Date().getDate() - 7))
    },
    endDate: {
      type: Date,
      default: () => new Date()
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  summary: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    growth: { type: Number, default: 0 }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    nextRun: {
      type: Date
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Reports', reportsSchema);
