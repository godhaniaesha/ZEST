const mongoose = require('mongoose');

/**
 * Salary / Payroll record for one staff member for one month.
 * A record is unique per (staffId, month, year).
 */
const salarySchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    staffName: { type: String, required: true },

    role: { type: String, required: true },

    image: { type: String },

    // ── Payroll period ──────────────────────────────
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    // ── Earnings ────────────────────────────────────
    baseSalary: { type: Number, required: true, min: 0, default: 0 },
    salaryType: {
      type: String,
      enum: ['monthly', 'weekly', 'daily', 'hourly'],
      default: 'monthly',
    },

    // calendarDays = raw length of the month
    // workingDays  = days actually payable (prorated for mid-month joiners)
    calendarDays: { type: Number, default: 0, min: 0 },
    workingDays: { type: Number, default: 0, min: 0 },
    presentDays: { type: Number, default: 0, min: 0 },
    presentOnly: { type: Number, default: 0, min: 0 },
    lateDays: { type: Number, default: 0, min: 0 },
    absentDays: { type: Number, default: 0, min: 0 },
    halfDays: { type: Number, default: 0, min: 0 },
    // Days marked `on-leave` in attendance, used to avoid double counting
    onLeaveDays: { type: Number, default: 0, min: 0 },

    perDaySalary: { type: Number, default: 0, min: 0 },
    perHourSalary: { type: Number, default: 0, min: 0 },

    // Leave days are split into paid / unpaid for payroll
    paidLeaveDays: { type: Number, default: 0, min: 0 },
    unpaidLeaveDays: { type: Number, default: 0, min: 0 },
    leaveDays: { type: Number, default: 0, min: 0 },

    // ── Reconciliation ─────────────────────────────
    // Sum of every bucket above. Compared against `workingDays` this exposes
    // unaccounted days (no attendance and no leave row was entered).
    accountedDays: { type: Number, default: 0, min: 0 },
    unmarkedDays: { type: Number, default: 0, min: 0 },
    // Leave days that also existed as an `on-leave` attendance row and were
    // therefore counted only once.
    overlapLeaveDays: { type: Number, default: 0, min: 0 },

    overtimeHours: { type: Number, default: 0, min: 0 },
    overtimeAmount: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },

    // ── Deductions ──────────────────────────────────
    unpaidLeaveDeduction: { type: Number, default: 0, min: 0 },
    absentDeduction: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    pf: { type: Number, default: 0, min: 0 },
    advance: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 },

    // ── Totals (auto-computed) ──────────────────────
    grossSalary: { type: Number, default: 0, min: 0 },
    totalDeductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, default: 0, min: 0 },

    // ── Payment ─────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank', 'upi', 'card'],
      default: 'bank',
    },
    paymentDate: { type: Date },
    paymentReference: { type: String },

    notes: { type: String },

    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One payroll record per staff per month
salarySchema.index({ staffId: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ month: 1, year: 1 });
salarySchema.index({ paymentStatus: 1 });

// Keep totals in sync whenever the record changes
// NOTE: must be synchronous (no `next` arg) so Mongoose treats it as a sync hook
salarySchema.pre('save', function () {
  const earnings =
    (this.baseSalary || 0) +
    (this.overtimeAmount || 0) +
    (this.bonus || 0) +
    (this.allowances || 0);

  const deductions =
    (this.unpaidLeaveDeduction || 0) +
    (this.absentDeduction || 0) +
    (this.tax || 0) +
    (this.pf || 0) +
    (this.advance || 0) +
    (this.otherDeductions || 0);

  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  this.grossSalary = round2(earnings);
  this.totalDeductions = round2(deductions);
  this.netSalary = round2(Math.max(0, earnings - deductions));
  this.leaveDays = (this.paidLeaveDays || 0) + (this.unpaidLeaveDays || 0);

  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
});

module.exports = mongoose.model('Salary', salarySchema);
