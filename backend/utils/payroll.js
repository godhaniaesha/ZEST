const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const STAFF_ROLES = ['superadmin', 'manager', 'chef', 'waiter', 'cashier'];

/**
 * The restaurant runs on Indian business hours, so payroll months must be cut
 * on Asia/Kolkata midnight — NOT on UTC midnight and NOT on the server's local
 * midnight. A leave applied for 01 Nov 00:00 IST is stored as
 * `2026-10-31T18:30:00.000Z`; UTC-based month bounds would file that day under
 * October and silently lose a day from the November payroll.
 */
const BUSINESS_TIMEZONE = process.env.BUSINESS_TZ || 'Asia/Kolkata';

// Leave types that are always paid AND do not consume the annual leave quota
// (statutory / policy paid leave such as maternity and paternity).
const ALWAYS_PAID_LEAVE_TYPES = ['maternity', 'paternity'];

// Leave types that are never paid.
const UNPAID_LEAVE_TYPES = ['other'];

const HOURS_PER_DAY = 8;
const MS_PER_DAY = 86400000;

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ------------------------------------------------------------------ *
 * Business-timezone helpers
 * ------------------------------------------------------------------ */

const tzPartFormatter = (timeZone) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

/** Wall-clock parts of an instant as seen in the business timezone. */
const businessParts = (date, timeZone = BUSINESS_TIMEZONE) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  const parts = {};
  for (const part of tzPartFormatter(timeZone).formatToParts(d)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }

  // `hour` can come back as "24" for midnight in some ICU versions.
  const hour = Number(parts.hour) === 24 ? 0 : Number(parts.hour);

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
};

/** Minutes that must be ADDED to UTC to obtain business-local time. */
const zoneOffsetMinutes = (date, timeZone = BUSINESS_TIMEZONE) => {
  const p = businessParts(date, timeZone);
  if (!p) return 0;
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asIfUtc - new Date(date).getTime()) / 60000);
};

/**
 * Convert a business-local wall-clock time to the real UTC instant.
 * Two correction passes make DST transitions land on the correct side.
 */
const businessWallToUtc = (
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone = BUSINESS_TIMEZONE
) => {
  const wall = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = wall;
  for (let i = 0; i < 2; i += 1) {
    const offset = zoneOffsetMinutes(new Date(guess), timeZone);
    const next = wall - offset * 60000;
    if (next === guess) break;
    guess = next;
  }
  return new Date(guess);
};

/**
 * Normalise any Date-ish value to the UTC-midnight marker of the BUSINESS
 * calendar day it belongs to. The marker is only used for date comparison —
 * never for display.
 */
const businessDay = (value, timeZone = BUSINESS_TIMEZONE) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const p = businessParts(d, timeZone);
  if (!p) return null;
  return new Date(Date.UTC(p.year, p.month - 1, p.day));
};

/** Stable 'YYYY-MM-DD' business-calendar key used to compare calendar days. */
const dayKey = (value, timeZone = BUSINESS_TIMEZONE) => {
  const d = businessDay(value, timeZone);
  return d ? d.toISOString().slice(0, 10) : null;
};

/** Business-timezone bounds (start inclusive, end exclusive) for a month. */
const monthBounds = (month, year, timeZone = BUSINESS_TIMEZONE) => ({
  start: businessWallToUtc(year, month, 1, 0, 0, 0, timeZone),
  end: businessWallToUtc(year, month + 1, 1, 0, 0, 0, timeZone),
});

/** Business-timezone bounds for a full leave year. */
const yearBounds = (year, timeZone = BUSINESS_TIMEZONE) => ({
  start: businessWallToUtc(year, 1, 1, 0, 0, 0, timeZone),
  end: businessWallToUtc(year + 1, 1, 1, 0, 0, 0, timeZone),
});

/** Kept for backwards compatibility with existing callers/tests. */
const utcDay = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const getDaysInMonth = (month, year) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/**
 * Validate / normalise a requested payroll period.
 * Returns the resolved period plus whether the client actually sent valid input.
 */
const parsePeriod = (rawMonth, rawYear, timeZone = BUSINESS_TIMEZONE) => {
  const now = businessParts(new Date(), timeZone) || {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };

  const provided = (v) => v !== undefined && v !== null && v !== '';

  const monthNum = Number(rawMonth);
  const yearNum = Number(rawYear);

  const monthValid = Number.isInteger(monthNum) && monthNum >= 1 && monthNum <= 12;
  const yearValid = Number.isInteger(yearNum) && yearNum >= 2000 && yearNum <= now.year + 1;

  const monthGiven = provided(rawMonth);
  const yearGiven = provided(rawYear);

  /*
   * An omitted period falls back to the current business month. A period that
   * WAS supplied but is malformed also falls back here (so the query stays
   * safe) while `valid: false` lets the route answer 400.
   */
  return {
    month: monthGiven && monthValid ? monthNum : now.month,
    year: yearGiven && yearValid ? yearNum : now.year,
    valid: (!monthGiven || monthValid) && (!yearGiven || yearValid),
  };
};

/* ------------------------------------------------------------------ *
 * Leave helpers
 * ------------------------------------------------------------------ */

/**
 * Expand a leave record into the business-calendar days it actually covers,
 * optionally restricted to a single month. Handles multi-day ranges that start
 * before / end after the requested month.
 */
const expandLeaveDays = (leave, month, year, timeZone = BUSINESS_TIMEZONE) => {
  const start = businessDay(leave.startDate, timeZone);
  const end = businessDay(leave.endDate, timeZone);
  if (!start || !end) return [];

  const from = start < end ? start : end;
  const to = start < end ? end : start;

  const days = [];
  let cursor = new Date(from).getTime();
  const limit = to.getTime();

  while (cursor <= limit) {
    days.push(new Date(cursor));
    cursor += MS_PER_DAY;
    if (days.length > 366) break; // safety net against malformed ranges
  }

  if (month == null || year == null) return days;

  const { start: mStart, end: mEnd } = monthBounds(month, year, timeZone);
  return days.filter((d) => d >= mStart && d < mEnd);
};

/** Restrict a list of business-day markers to the given leave year. */
const filterToYear = (days, year, timeZone = BUSINESS_TIMEZONE) => {
  const { start, end } = yearBounds(year, timeZone);
  return days.filter((d) => d >= start && d < end);
};

/** A single-day leave that carries a start/end time counts as a half day. */
const isHalfDayLeave = (leave, timeZone = BUSINESS_TIMEZONE) => {
  const start = businessDay(leave.startDate, timeZone);
  const end = businessDay(leave.endDate, timeZone);
  if (!start || !end || start.getTime() !== end.getTime()) return false;
  return Boolean(leave.startTime && leave.endTime);
};

/**
 * How many days of a leave record fall inside the given month.
 * Half-day leaves count as 0.5.
 */
const countDaysInMonth = (leave, month, year, timeZone = BUSINESS_TIMEZONE) => {
  const days = expandLeaveDays(leave, month, year, timeZone);
  if (days.length === 0) return 0;
  return isHalfDayLeave(leave, timeZone) ? 0.5 : days.length;
};

/** Whether a leave record is eligible for pay at all. */
const isLeavePaid = (leave) => {
  if (UNPAID_LEAVE_TYPES.includes(leave.type)) return false;
  // An explicit `isPaid: false` set by an admin always wins.
  if (leave.isPaid === false) return false;
  return true;
};

/** Whether the record is paid but must NOT consume the annual quota. */
const isAlwaysPaidLeave = (leave) =>
  Boolean(leave) && ALWAYS_PAID_LEAVE_TYPES.includes(leave.type);

/**
 * Split leave days into paid / unpaid across the WHOLE year, then return only
 * the portion belonging to the requested month.
 *
 * Why this matters: the balance must be consumed in chronological order. The
 * previous implementation compared the month's leaves against the lifetime
 * `user.leavesTaken` counter, so generating payroll for January used the
 * balance as it stands today — later months consumed the balance first and
 * January was silently treated as unpaid.
 *
 * @returns {Array<{key: string, day: Date, paid: number, unpaid: number}>}
 */
const splitLeaveDaysDetailed = (leaves, user, month, year, timeZone = BUSINESS_TIMEZONE) => {
  const total = toNumber(user.leavesTotal) || 12;
  let balance = total;

  const sorted = [...leaves].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const { start: mStart, end: mEnd } =
    month == null ? { start: null, end: null } : monthBounds(month, year, timeZone);

  const result = [];

  for (const leave of sorted) {
    const allDays = filterToYear(expandLeaveDays(leave, null, null, timeZone), year, timeZone);
    if (allDays.length === 0) continue;

    const alwaysPaid = isAlwaysPaidLeave(leave);
    const neverPaid = !isLeavePaid(leave);
    const cost = isHalfDayLeave(leave, timeZone) ? 0.5 : 1;

    for (const day of allDays) {
      let dayPaid = 0;
      let dayUnpaid = 0;

      if (neverPaid) {
        dayUnpaid = cost;
      } else if (alwaysPaid) {
        // Paid, but the annual quota is untouched.
        dayPaid = cost;
      } else if (balance >= cost) {
        dayPaid = cost;
        balance -= cost;
      } else {
        dayPaid = balance;
        dayUnpaid = cost - balance;
        balance = 0;
      }

      // Only keep the day when it belongs to the requested month.
      if (month != null && (day < mStart || day >= mEnd)) continue;

      result.push({
        key: dayKey(day, timeZone),
        day,
        paid: dayPaid,
        unpaid: dayUnpaid,
      });
    }
  }

  return result;
};

/** Totals-only wrapper around {@link splitLeaveDaysDetailed}. */
const splitPaidUnpaidLeaveDays = (leaves, user, month, year, timeZone = BUSINESS_TIMEZONE) => {
  const rows = splitLeaveDaysDetailed(leaves, user, month, year, timeZone);

  let paid = 0;
  let unpaid = 0;

  for (const row of rows) {
    paid += row.paid;
    unpaid += row.unpaid;
  }

  return {
    paid: round2(paid),
    unpaid: round2(unpaid),
    leaveDays: round2(paid + unpaid),
  };
};

/* ------------------------------------------------------------------ *
 * Main calculation
 * ------------------------------------------------------------------ */

/**
 * Build a full payroll calculation for one staff member for one month,
 * using their attendance records and approved leave requests.
 */
const calculateSalaryForStaff = async (user, month, year, timeZone = BUSINESS_TIMEZONE) => {
  const { start, end } = monthBounds(month, year, timeZone);
  const yb = yearBounds(year, timeZone);

  const [attendance, leaves] = await Promise.all([
    Attendance.find({
      staffId: user._id,
      date: { $gte: start, $lt: end },
    }),
    // Fetch the whole year so the paid/unpaid balance is consumed in the
    // correct chronological order before we slice out this month.
    Leave.find({
      staffId: user._id,
      status: 'approved',
      startDate: { $lt: end },
      endDate: { $gte: yb.start },
    }),
  ]);

  const byStatus = (s) => attendance.filter((a) => a.status === s);

  const presentOnlyDays = byStatus('present');
  const lateRecords = byStatus('late');
  const absentDays = byStatus('absent');
  const halfDays = byStatus('half-day');
  const onLeaveRecords = byStatus('on-leave');

  const onLeaveKeys = new Set(
    onLeaveRecords.map((a) => dayKey(a.date, timeZone)).filter(Boolean)
  );

  /*
   * Leave days can be recorded twice: once as an approved Leave request and
   * once as an `on-leave` attendance row. The previous implementation
   * subtracted counts, which could double-deduct a half day and left the unpaid
   * bucket untouched entirely. We now remove the exact overlapping calendar
   * days, so the same day can never be charged twice.
   */
  const detailedLeave = splitLeaveDaysDetailed(
    leaves.map((l) => l.toObject()),
    user,
    month,
    year,
    timeZone
  );

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let overlapDays = 0;

  for (const row of detailedLeave) {
    if (row.key && onLeaveKeys.has(row.key)) {
      overlapDays += 1;
      continue;
    }
    paidLeaveDays += row.paid;
    unpaidLeaveDays += row.unpaid;
  }

  // Attendance rows marked on-leave that have no matching approved Leave record
  // still consume the day, otherwise the day would be counted as worked.
  const orphanOnLeaveDays = [...onLeaveKeys].filter(
    (k) => !detailedLeave.some((row) => row.key === k)
  ).length;

  const presentDays = presentOnlyDays.length;
  const lateDays = lateRecords.length;
  const onLeaveDays = overlapDays + orphanOnLeaveDays;

  const calendarDays = getDaysInMonth(month, year);

  // A staff member who joined mid-month is only paid for the days they worked.
  const joinedOn = businessDay(user.joiningDate, timeZone);
  let payableDays = calendarDays;
  if (joinedOn && joinedOn > start && joinedOn < end) {
    const dayOfMonth = businessParts(joinedOn, timeZone).day;
    payableDays = Math.max(0, calendarDays - dayOfMonth + 1);
  }

  const baseSalary = toNumber(user.salary);
  const perDaySalary = payableDays > 0 ? baseSalary / payableDays : 0;
  const perHourSalary = perDaySalary > 0 ? perDaySalary / HOURS_PER_DAY : 0;

  // Half days only cost half a day of pay.
  // `on-leave` attendance days are already excluded from the leave totals
  // above, so they must not be deducted a second time here.
  const absentDeduction = round2((absentDays.length + halfDays.length * 0.5) * perDaySalary);
  const unpaidLeaveDeduction = round2(unpaidLeaveDays * perDaySalary);

  const accountedDays =
    presentDays +
    lateDays +
    absentDays.length +
    halfDays.length +
    onLeaveDays +
    paidLeaveDays +
    unpaidLeaveDays;

  return {
    staffId: user._id,
    staffName: user.name,
    role: user.role,
    image: user.image,
    month,
    year,

    baseSalary,
    salaryType: user.salaryType || 'monthly',

    // calendarDays = length of the month; workingDays = days actually payable
    calendarDays,
    workingDays: payableDays,

    presentDays: presentDays + lateDays,
    presentOnly: presentDays,
    lateDays,
    absentDays: absentDays.length,
    halfDays: halfDays.length,
    onLeaveDays,

    paidLeaveDays: round2(paidLeaveDays),
    unpaidLeaveDays: round2(unpaidLeaveDays),
    leaveDays: round2(paidLeaveDays + unpaidLeaveDays),

    // Reconciliation helpers so the UI can flag unaccounted / double-counted days.
    accountedDays: round2(accountedDays),
    unmarkedDays: round2(Math.max(0, payableDays - accountedDays)),
    overlapLeaveDays: overlapDays,

    overtimeHours: 0,
    overtimeAmount: 0,
    bonus: 0,
    allowances: 0,

    unpaidLeaveDeduction,
    absentDeduction,
    tax: 0,
    pf: 0,
    advance: 0,
    otherDeductions: 0,

    perDaySalary: round2(perDaySalary),
    perHourSalary: round2(perHourSalary),
  };
};

module.exports = {
  STAFF_ROLES,
  BUSINESS_TIMEZONE,
  ALWAYS_PAID_LEAVE_TYPES,
  UNPAID_LEAVE_TYPES,
  HOURS_PER_DAY,
  round2,
  toNumber,
  businessParts,
  businessWallToUtc,
  businessDay,
  utcDay,
  dayKey,
  parsePeriod,
  getDaysInMonth,
  monthBounds,
  yearBounds,
  expandLeaveDays,
  filterToYear,
  isHalfDayLeave,
  isLeavePaid,
  isAlwaysPaidLeave,
  countDaysInMonth,
  splitLeaveDaysDetailed,
  splitPaidUnpaidLeaveDays,
  calculateSalaryForStaff,
};
