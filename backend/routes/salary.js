const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Salary = require('../models/Salary');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  STAFF_ROLES,
  round2,
  toNumber,
  calculateSalaryForStaff,
  countDaysInMonth,
  expandLeaveDays,
  filterToYear,
  yearBounds,
  parsePeriod,
} = require('../utils/payroll');

const ADMIN_ROLES = ['manager', 'superadmin'];

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

/**
 * Resolve the requested payroll period.
 *
 * The "current month" and every month boundary follow the restaurant's
 * business timezone (BUSINESS_TZ, default Asia/Kolkata) so a record created at
 * 01 Nov 00:00 IST belongs to November payroll. Previously this used UTC
 * getters, which filed that record under October.
 *
 * Returns `{ month, year, valid }` — `valid` is false when the client sent a
 * month outside 1-12 or an implausible year.
 */
const resolvePeriod = (query) => parsePeriod(query.month, query.year);

// Fields a manager is allowed to set directly on a payroll record
const EDITABLE_FIELDS = [
  'baseSalary',
  'salaryType',
  'overtimeHours',
  'overtimeAmount',
  'bonus',
  'allowances',
  'tax',
  'pf',
  'advance',
  'otherDeductions',
  'paymentMethod',
  'paymentReference',
  'notes',
];

const pickEditable = (body) => {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
};

/* ─────────────────────────────────────────────
   PAYROLL SUMMARY  (must be declared before /:id)
 ───────────────────────────────────────────── */
router.get('/summary', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { month, year } = resolvePeriod(req.query);

    const [records, staffCount] = await Promise.all([
      Salary.find({ month, year }).sort({ staffName: 1 }),
      User.countDocuments({ role: { $ne: 'customer' } }),
    ]);

    if (!resolvePeriod(req.query).valid) {
      return res
        .status(400)
        .json({ message: 'Invalid month or year. Month must be between 1 and 12.' });
    }

    const totals = records.reduce(
      (acc, r) => {
        acc.gross += toNumber(r.grossSalary);
        acc.deductions += toNumber(r.totalDeductions);
        acc.net += toNumber(r.netSalary);
        acc.overtime += toNumber(r.overtimeAmount);
        acc.bonus += toNumber(r.bonus);
        acc.unpaidLeaveDeduction += toNumber(r.unpaidLeaveDeduction);
        acc.absentDeduction += toNumber(r.absentDeduction);
        acc.advance += toNumber(r.advance);
        acc.paidDays += toNumber(r.paidLeaveDays);
        acc.unpaidDays += toNumber(r.unpaidLeaveDays);

        if (r.paymentStatus === 'paid') {
          acc.paid += toNumber(r.netSalary);
          acc.paidCount += 1;
        } else if (r.paymentStatus === 'pending') {
          acc.pending += toNumber(r.netSalary);
          acc.pendingCount += 1;
        } else {
          acc.failed += toNumber(r.netSalary);
          acc.failedCount += 1;
        }
        return acc;
      },
      {
        gross: 0,
        deductions: 0,
        net: 0,
        overtime: 0,
        bonus: 0,
        unpaidLeaveDeduction: 0,
        absentDeduction: 0,
        advance: 0,
        paid: 0,
        paidCount: 0,
        pending: 0,
        pendingCount: 0,
        failed: 0,
        failedCount: 0,
        paidDays: 0,
        unpaidDays: 0,
      }
    );

    // Round every accumulated figure
    Object.keys(totals).forEach((key) => {
      if (typeof totals[key] === 'number' && !key.endsWith('Count') && !key.endsWith('Days')) {
        totals[key] = round2(totals[key]);
      }
    });

    res.json({
      month,
      year,
      totalRecords: records.length,
      totalStaff: staffCount,
      records: records.length,
      missingStaff: Math.max(0, staffCount - records.length),
      totals,
    });
  } catch (err) {
    console.error('Error fetching salary summary:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   AUTO-CALCULATE PREVIEW FOR ONE STAFF MEMBER
 ───────────────────────────────────────────── */
router.get(
  '/estimate/:staffId',
  auth,
  authorizeRoles(...ADMIN_ROLES),
  async (req, res) => {
    try {
      const { staffId } = req.params;
      if (!isValidObjectId(staffId)) {
        return res.status(400).json({ message: 'Invalid staff member ID' });
      }

      const { month, year } = resolvePeriod(req.query);

      const user = await User.findById(staffId);
      if (!user || user.role === 'customer') {
        return res.status(404).json({ message: 'Staff member not found' });
      }

      const calculation = await calculateSalaryForStaff(user, month, year);

      const existing = await Salary.findOne({ staffId, month, year });

      res.json({ ...calculation, existing: existing || null });
    } catch (err) {
      console.error('Error estimating salary:', err);
      res.status(500).json({ message: err.message });
    }
  }
);

/* ─────────────────────────────────────────────
   GENERATE PAYROLL FOR A MONTH
 ───────────────────────────────────────────── */
router.post('/generate', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { month, year } = resolvePeriod(req.body);
    const { staffIds, overwrite = false } = req.body;

    let staff = await User.find({ role: { $ne: 'customer' } }).select('-password');

    if (Array.isArray(staffIds) && staffIds.length > 0) {
      const validIds = staffIds.filter(isValidObjectId);
      staff = staff.filter((s) => validIds.includes(String(s._id)));
    }

    if (staff.length === 0) {
      return res.status(400).json({ message: 'No staff members found to process' });
    }

    const created = [];
    const updated = [];
    const skipped = [];

    for (const user of staff) {
      const calculation = await calculateSalaryForStaff(user, month, year);

      const existing = await Salary.findOne({
        staffId: user._id,
        month,
        year,
      });

      if (existing) {
        if (!overwrite) {
          skipped.push({
            staffId: user._id,
            staffName: user.name,
            reason: 'Payroll already generated for this month',
          });
          continue;
        }

        // Keep manual adjustments when regenerating, but refresh every
        // auto-calculated field so a re-run always matches the current
        // attendance / leave data for that month.
        Object.assign(existing, {
          baseSalary: calculation.baseSalary,
          salaryType: calculation.salaryType,
          calendarDays: calculation.calendarDays,
          workingDays: calculation.workingDays,
          presentDays: calculation.presentDays,
          presentOnly: calculation.presentOnly,
          lateDays: calculation.lateDays,
          absentDays: calculation.absentDays,
          halfDays: calculation.halfDays,
          onLeaveDays: calculation.onLeaveDays,
          paidLeaveDays: calculation.paidLeaveDays,
          unpaidLeaveDays: calculation.unpaidLeaveDays,
          leaveDays: calculation.leaveDays,
          accountedDays: calculation.accountedDays,
          unmarkedDays: calculation.unmarkedDays,
          overlapLeaveDays: calculation.overlapLeaveDays,
          unpaidLeaveDeduction: calculation.unpaidLeaveDeduction,
          absentDeduction: calculation.absentDeduction,
          perDaySalary: calculation.perDaySalary,
          perHourSalary: calculation.perHourSalary,
          staffName: user.name,
          role: user.role,
          image: user.image,
        });

        const saved = await existing.save();
        updated.push(saved);
      } else {
        const record = new Salary({
          ...calculation,
          paymentStatus: 'pending',
          paymentMethod: 'bank',
          generatedBy: req.user.id,
        });

        const saved = await record.save();
        created.push(saved);
      }
    }

    res.status(201).json({
      month,
      year,
      created: created.length,
      updated: updated.length,
      skipped: skipped.length,
      skippedDetails: skipped,
      records: [...created, ...updated],
    });
  } catch (err) {
    console.error('Error generating payroll:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   MARK A PAYROLL RECORD AS PAID
 ───────────────────────────────────────────── */
router.post('/:id/pay', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid salary record ID' });
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    if (salary.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Salary has already been paid' });
    }

    salary.paymentStatus = 'paid';
    salary.paymentDate = req.body.paymentDate
      ? new Date(req.body.paymentDate)
      : new Date();

    if (req.body.paymentMethod) {
      salary.paymentMethod = req.body.paymentMethod;
    }
    if (req.body.paymentReference) {
      salary.paymentReference = req.body.paymentReference;
    }

    const saved = await salary.save();
    res.json(saved);
  } catch (err) {
    console.error('Error marking salary as paid:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   STAFF SALARY OVERVIEW (base salary + history)
 ───────────────────────────────────────────── */
router.get('/staff/overview', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const period = resolvePeriod(req.query);

    if (!period.valid) {
      return res
        .status(400)
        .json({ message: 'Invalid month or year. Month must be between 1 and 12.' });
    }

    const { month, year } = period;
    const yb = yearBounds(year);

    const [staff, records, approvedLeaves] = await Promise.all([
      User.find({ role: { $in: STAFF_ROLES } }).select('-password').lean(),
      Salary.find({}).sort({ year: -1, month: -1 }).lean(),
      Leave.find({
        status: 'approved',
        startDate: { $lt: yb.end },
        endDate: { $gte: yb.start },
      }).lean(),
    ]);

    const overview = staff.map((user) => {
      const history = records.filter(
        (r) => String(r.staffId) === String(user._id)
      );
      const totalPaid = history
        .filter((r) => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + toNumber(r.netSalary), 0);
      const totalPending = history
        .filter((r) => r.paymentStatus === 'pending')
        .reduce((sum, r) => sum + toNumber(r.netSalary), 0);

      // Leave balance is derived from the approved Leave records for the
      // selected year, so the number always matches what payroll will use.
      // The old code trusted the denormalised `user.leavesTaken` counter which
      // drifts out of sync and is not year-aware.
      const ownLeaves = approvedLeaves.filter(
        (l) => String(l.staffId) === String(user._id)
      );

      const leavesTotal = toNumber(user.leavesTotal) || 12;

      // Only count the portion of every leave that actually falls inside the
      // selected year — a long leave spanning 28 Dec → 4 Jan must not inflate
      // the whole-year balance with 8 days when only 4 belong to this year.
      const yearLeaveDays = ownLeaves.reduce(
        (sum, l) => sum + filterToYear(expandLeaveDays(l), year).length,
        0
      );
      const monthLeaveDays = ownLeaves.reduce(
        (sum, l) => sum + countDaysInMonth(l, month, year),
        0
      );

      const leavesTaken = Math.min(leavesTotal, yearLeaveDays);

      return {
        staffId: user._id,
        staffName: user.name,
        role: user.role,
        image: user.image,
        baseSalary: toNumber(user.salary),
        salaryType: user.salaryType || 'monthly',
        status: user.status,
        shift: user.shift,
        joiningDate: user.joiningDate,
        leavesTotal,
        leavesTaken,
        leavesRemaining: Math.max(0, leavesTotal - leavesTaken),
        // Leave days booked inside the month currently being viewed
        monthLeaveDays: round2(monthLeaveDays),
        totalPaid: round2(totalPaid),
        totalPending: round2(totalPending),
        recordCount: history.length,
        lastPaid: history.find((r) => r.paymentStatus === 'paid') || null,
      };
    });

    // Keep the plain-array shape: the admin Salary page and test-payroll.js
    // both consume this endpoint directly.
    res.json(overview);
  } catch (err) {
    console.error('Error fetching staff salary overview:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   LIST ALL SALARY RECORDS
 ───────────────────────────────────────────── */
router.get('/', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { month, year, staffId, paymentStatus, search, limit, page } = req.query;

    const query = {};

    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (staffId && isValidObjectId(staffId)) query.staffId = staffId;
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    if (search) {
      query.staffName = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.min(200, Math.max(1, Number(limit) || 100));

    const [records, total] = await Promise.all([
      Salary.find(query)
        .sort({ year: -1, month: -1, staffName: 1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage),
      Salary.countDocuments(query),
    ]);

    res.json({
      records,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / perPage) || 1,
    });
  } catch (err) {
    console.error('Error fetching salary records:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET SINGLE SALARY RECORD
 ───────────────────────────────────────────── */
router.get('/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid salary record ID' });
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json(salary);
  } catch (err) {
    console.error('Error fetching salary record:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   CREATE A SINGLE SALARY RECORD
 ───────────────────────────────────────────── */
router.post('/', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { staffId } = req.body;

    if (!staffId || !isValidObjectId(staffId)) {
      return res.status(400).json({ message: 'Invalid staff member ID' });
    }

    const month = Number(req.body.month);
    const year = Number(req.body.year);

    if (!month || month < 1 || month > 12 || !year) {
      return res.status(400).json({ message: 'Valid month and year are required' });
    }

    const user = await User.findById(staffId);
    if (!user || user.role === 'customer') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const existing = await Salary.findOne({ staffId, month, year });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Salary record already exists for this staff member and month' });
    }

    const calculation = await calculateSalaryForStaff(user, month, year);

    const salary = new Salary({
      ...calculation,
      ...pickEditable(req.body),
      staffId: user._id,
      staffName: user.name,
      role: user.role,
      image: user.image,
      month,
      year,
      generatedBy: req.user.id,
    });

    const saved = await salary.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating salary record:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   UPDATE A SALARY RECORD
 ───────────────────────────────────────────── */
router.put('/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid salary record ID' });
    }

    const salary = await Salary.findById(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    const updates = pickEditable(req.body);

    if (req.body.paymentStatus) {
      const status = req.body.paymentStatus;
      if (!['pending', 'paid', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
      updates.paymentStatus = status;
      if (status === 'paid') {
        updates.paymentDate = req.body.paymentDate
          ? new Date(req.body.paymentDate)
          : salary.paymentDate || new Date();
      } else {
        updates.paymentDate = null;
      }
    }

    // Allow editing the payroll period
    if (req.body.month !== undefined) {
      const m = Number(req.body.month);
      if (m < 1 || m > 12) {
        return res.status(400).json({ message: 'Invalid month' });
      }
      updates.month = m;
    }
    if (req.body.year !== undefined) {
      const y = Number(req.body.year);
      if (!y) return res.status(400).json({ message: 'Invalid year' });
      updates.year = y;
    }

    Object.assign(salary, updates);
    const saved = await salary.save();

    res.json(saved);
  } catch (err) {
    console.error('Error updating salary record:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE A SALARY RECORD
 ───────────────────────────────────────────── */
router.delete('/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid salary record ID' });
    }

    const salary = await Salary.findByIdAndDelete(id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    res.json({ message: 'Salary record deleted' });
  } catch (err) {
    console.error('Error deleting salary record:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
