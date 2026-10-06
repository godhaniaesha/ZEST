/**
 * Regression tests for the payroll helper functions.
 *
 * These are pure-function tests: no database and no HTTP server is required,
 * so they are safe to run at any time and never mutate real data.
 *
 *   node test-payroll-regression.js
 */
const {
  BUSINESS_TIMEZONE,
  round2,
  dayKey,
  parsePeriod,
  getDaysInMonth,
  monthBounds,
  yearBounds,
  expandLeaveDays,
  filterToYear,
  isHalfDayLeave,
  isLeavePaid,
  countDaysInMonth,
  splitLeaveDaysDetailed,
  splitPaidUnpaidLeaveDays,
} = require('./utils/payroll');

let passed = 0;
let failed = 0;

const ok = (msg) => {
  passed += 1;
  console.log(`  PASS   ${msg}`);
};

const bad = (msg, detail) => {
  failed += 1;
  console.log(`  FAIL   ${msg}${detail ? ` -> ${detail}` : ''}`);
};

const eq = (actual, expected, msg) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) ok(msg);
  else bad(msg, `expected ${e}, got ${a}`);
};

const near = (actual, expected, msg) => {
  if (Math.abs(actual - expected) < 0.001) ok(msg);
  else bad(msg, `expected ~${expected}, got ${actual}`);
};

const section = (t) => console.log(`\n=== ${t} ===`);

/** Build an IST-local timestamp: 2026-11-01 00:00 IST === 2026-10-31T18:30Z */
const ist = (y, m, d, hh = 0, mm = 0) =>
  new Date(Date.UTC(y, m - 1, d, hh - 5, mm - 30));

const user = { leavesTotal: 12, leavesTaken: 0 };

const plainLeave = (start, end, extra = {}) => ({
  startDate: start,
  endDate: end,
  type: 'vacation',
  status: 'approved',
  isPaid: true,
  ...extra,
});

/* ─────────────────────────────────────────────── */
section(`BUSINESS TIMEZONE BOUNDS (${BUSINESS_TIMEZONE})`);

{
  const nov = monthBounds(11, 2026);
  eq(nov.start.toISOString(), '2026-10-31T18:30:00.000Z', 'November 2026 starts at 31 Oct 18:30 UTC (IST midnight)');
  eq(nov.end.toISOString(), '2026-11-30T18:30:00.000Z', 'November 2026 ends at 30 Nov 18:30 UTC');

  const dec = monthBounds(12, 2026);
  eq(dec.end.toISOString(), '2026-12-31T18:30:00.000Z', 'December rolls into January correctly');

  const jan = monthBounds(1, 2027);
  eq(jan.start.toISOString(), '2026-12-31T18:30:00.000Z', 'January 2027 starts at 31 Dec 18:30 UTC');

  const y = yearBounds(2026);
  eq(y.start.toISOString(), '2025-12-31T18:30:00.000Z', 'Year 2026 starts at 31 Dec 2025 IST midnight');
  eq(y.end.toISOString(), '2026-12-31T18:30:00.000Z', 'Year 2026 ends at 31 Dec 2026 IST midnight');

  eq(getDaysInMonth(2, 2024), 29, 'Leap February has 29 days');
  eq(getDaysInMonth(2, 2026), 28, 'Non-leap February has 28 days');
}

/* ─────────────────────────────────────────────── */
section('IST MIDNIGHT BOUNDARY (the original bug)');

{
  // 01 Nov 00:00 IST is stored as 31 Oct 18:30 UTC. It MUST count as November.
  const midnight = ist(2026, 11, 1);
  eq(dayKey(midnight), '2026-11-01', '01 Nov IST midnight resolves to business day 2026-11-01');

  const leave = plainLeave(midnight, ist(2026, 11, 1, 23));
  eq(countDaysInMonth(leave, 11, 2026), 1, 'Counts as 1 November leave day');
  eq(countDaysInMonth(leave, 10, 2026), 0, 'Does NOT leak into October payroll');

  // Last day boundary: 31 Oct 23:59 IST must stay in October.
  const lastOct = ist(2026, 10, 31, 23, 59);
  const leave2 = plainLeave(lastOct, lastOct);
  eq(countDaysInMonth(leave2, 10, 2026), 1, '31 Oct 23:59 IST stays in October');
  eq(countDaysInMonth(leave2, 11, 2026), 0, '31 Oct 23:59 IST does not enter November');
}

/* ─────────────────────────────────────────────── */
section('MONTH-CROSSING LEAVE RANGES');

{
  // 29 Sep -> 02 Oct 2026 = 4 days total, split 2 / 2
  const cross = plainLeave(ist(2026, 9, 29), ist(2026, 10, 2));

  eq(countDaysInMonth(cross, 9, 2026), 2, 'September portion = 2 days');
  eq(countDaysInMonth(cross, 10, 2026), 2, 'October portion = 2 days');
  eq(expandLeaveDays(cross).length, 4, 'Full expansion = 4 days');

  // Cross-year range must be sliced per year
  const crossYear = plainLeave(ist(2025, 12, 30), ist(2026, 1, 2));
  eq(filterToYear(expandLeaveDays(crossYear), 2025).length, 2, '2025 portion = 2 days');
  eq(filterToYear(expandLeaveDays(crossYear), 2026).length, 2, '2026 portion = 2 days');
  eq(filterToYear(expandLeaveDays(crossYear), 2026).map((d) => dayKey(d)), [
    '2026-01-01',
    '2026-01-02',
  ], '2026 portion keys are correct');
}

/* ─────────────────────────────────────────────── */
section('HALF-DAY LEAVES');

{
  const half = plainLeave(ist(2026, 10, 6), ist(2026, 10, 6), {
    startTime: '10:00',
    endTime: '14:00',
  });

  ok('Same-day leave with start/end times is a half day', isHalfDayLeave(half));
  eq(countDaysInMonth(half, 10, 2026), 0.5, 'Half day counts as 0.5');

  const full = plainLeave(ist(2026, 10, 6), ist(2026, 10, 6));
  ok('Same-day leave without times is a full day', !isHalfDayLeave(full));
  eq(countDaysInMonth(full, 10, 2026), 1, 'Full day counts as 1');

  const r = splitPaidUnpaidLeaveDays([half], { ...user, leavesTotal: 12 }, 10, 2026);
  eq(r.paid, 0.5, 'Half day is paid 0.5');
  eq(r.unpaid, 0, 'Half day carries no unpaid portion');
  eq(r.leaveDays, 0.5, 'Half day totals 0.5');
}

/* ─────────────────────────────────────────────── */
section('CHRONOLOGICAL ANNUAL LEAVE BALANCE');

{
  // 4 days in January, then 12 days in October -> Oct: 8 paid, 4 unpaid
  const janLeave = plainLeave(ist(2026, 1, 5), ist(2026, 1, 8));
  const octLeave = plainLeave(ist(2026, 10, 1), ist(2026, 10, 12));
  const all = [janLeave, octLeave];

  const january = splitPaidUnpaidLeaveDays(all, user, 1, 2026);
  eq(january.paid, 4, 'January 4 days fully paid');
  eq(january.unpaid, 0, 'January has no unpaid days');

  const october = splitPaidUnpaidLeaveDays(all, user, 10, 2026);
  eq(october.paid, 8, 'October first 8 days paid (quota consumed by January)');
  eq(october.unpaid, 4, 'October remaining 4 days unpaid');
  eq(october.leaveDays, 12, 'October leave total = 12');

  // Regenerating January AFTER October must give the same answer
  const januaryAgain = splitPaidUnpaidLeaveDays(all, user, 1, 2026);
  eq(januaryAgain.paid, 4, 'Regenerating January later still yields 4 paid days');
}

/* ─────────────────────────────────────────────── */
section('LEAVE IN A PREVIOUS YEAR IS IGNORED');

{
  const prevYear = plainLeave(ist(2025, 6, 1), ist(2025, 6, 30));
  const r = splitPaidUnpaidLeaveDays([prevYear], user, 10, 2026);
  eq(r.leaveDays, 0, '2025 leave does not affect the 2026 balance');

  const fresh = splitPaidUnpaidLeaveDays(
    [plainLeave(ist(2026, 10, 1), ist(2026, 10, 20))],
    user,
    10,
    2026
  );
  eq(fresh.paid, 12, 'With no prior-year carry-over, first 12 days are paid');
  eq(fresh.unpaid, 8, 'Days 13-20 are unpaid');
}

/* ─────────────────────────────────────────────── */
section('PAID / UNPAID LEAVE TYPES');

{
  const unpaidType = plainLeave(ist(2026, 10, 1), ist(2026, 10, 5), { type: 'other' });
  ok('type "other" is not paid', !isLeavePaid(unpaidType));

  const r = splitPaidUnpaidLeaveDays([unpaidType], user, 10, 2026);
  eq(r.paid, 0, 'Unpaid leave type -> 0 paid');
  eq(r.unpaid, 5, 'Unpaid leave type -> 5 unpaid');

  const explicitlyUnpaid = plainLeave(ist(2026, 10, 1), ist(2026, 10, 3), { isPaid: false });
  ok('isPaid:false is honoured', !isLeavePaid(explicitlyUnpaid));
  eq(splitPaidUnpaidLeaveDays([explicitlyUnpaid], user, 10, 2026).unpaid, 3, 'isPaid:false -> 3 unpaid');

  // Maternity must be paid AND must not eat the annual quota
  const maternity = plainLeave(ist(2026, 10, 1), ist(2026, 10, 20), { type: 'maternity' });
  const m = splitPaidUnpaidLeaveDays([maternity], user, 10, 2026);
  eq(m.paid, 20, '20 days of maternity are fully paid');
  eq(m.unpaid, 0, 'Maternity is never unpaid');

  // A later vacation leave still has the full quota available
  const afterMaternity = plainLeave(ist(2026, 11, 2), ist(2026, 11, 13));
  const combo = splitPaidUnpaidLeaveDays([maternity, afterMaternity], user, 11, 2026);
  eq(combo.paid, 12, 'Maternity did not consume the 12-day vacation quota');
  eq(combo.unpaid, 0, '12 vacation days fully paid after maternity');
}

/* ─────────────────────────────────────────────── */
section('DETAILED DAY-LEVEL SPLIT');

{
  const detail = plainLeave(ist(2026, 10, 1), ist(2026, 10, 14));
  const rows = splitLeaveDaysDetailed([detail], user, 10, 2026);

  eq(rows.length, 14, 'All 14 leave days are emitted so the UI can show them');
  eq(rows[0].key, '2026-10-01', 'First row key is correct');
  eq(rows[0].paid, 1, 'First row is 1 paid day');
  eq(rows[11].paid, 1, '12th row is the last paid day');
  eq(rows[11].unpaid, 0, '12th row still has a paid balance');
  eq(rows[12].paid, 0, '13th row has no paid balance left');
  eq(rows[12].unpaid, 1, '13th row is unpaid');
  eq(rows[13].unpaid, 1, '14th row is unpaid');

  const totals = rows.reduce(
    (acc, r) => ({
      paid: acc.paid + r.paid,
      unpaid: acc.unpaid + r.unpaid,
    }),
    { paid: 0, unpaid: 0 }
  );
  eq(totals.paid, 12, 'Detailed rows sum to 12 paid days');
  eq(totals.unpaid, 2, 'Detailed rows sum to 2 unpaid days');
  eq(rows.map((r) => r.key).every((k) => /^2026-10-\d{2}$/.test(k)), true, 'Every key is inside October 2026');
}

/* ─────────────────────────────────────────────── */
section('PERIOD PARSING');

{
  eq(parsePeriod('10', '2026'), { month: 10, year: 2026, valid: true }, 'Valid month/year parsed');
  eq(parsePeriod(0, 2026).valid, false, 'Month 0 rejected');
  eq(parsePeriod(13, 2026).valid, false, 'Month 13 rejected');
  eq(parsePeriod(1.5, 2026).valid, false, 'Non-integer month rejected');
  eq(parsePeriod('abc', 2026).valid, false, 'Non-numeric month rejected');
  eq(parsePeriod(10, 1990).valid, false, 'Implausible year rejected');
  eq(parsePeriod(undefined, undefined).valid, true, 'Omitted period falls back to current month');

  // Regression: an omitted period used to fall through to Number(undefined)
  // = NaN and blew up the Mongo query with a CastError.
  const fallback = parsePeriod(undefined, undefined);
  ok(
    Number.isInteger(fallback.month) && fallback.month >= 1 && fallback.month <= 12,
    `Omitted month resolves to a real month (${fallback.month})`
  );
  ok(
    Number.isInteger(fallback.year) && fallback.year >= 2020,
    `Omitted year resolves to a real year (${fallback.year})`
  );
  eq(parsePeriod('', ''), { month: fallback.month, year: fallback.year, valid: true }, 'Empty-string period also falls back safely');

  const partial = parsePeriod('10', undefined);
  eq(partial.month, 10, 'Given month is honoured');
  eq(partial.year, fallback.year, 'Missing year falls back to the current year');
  eq(partial.valid, true, 'Partially-supplied period is valid');

  const onlyYear = parsePeriod(undefined, '2026');
  eq(onlyYear.month, fallback.month, 'Missing month falls back to the current month');
  eq(onlyYear.year, 2026, 'Given year is honoured');

  // A malformed value falls back to the current period (so the query is safe)
  // while still being reported as invalid so the route can answer 400.
  eq(parsePeriod('13', undefined).month, fallback.month, 'Month 13 falls back to the current month');
  eq(parsePeriod('abc', undefined).year, fallback.year, 'Non-numeric year falls back to the current year');
}

/* ─────────────────────────────────────────────── */
section('ROUNDING');

{
  eq(round2(0.1 + 0.2), 0.3, 'Float noise rounded to 2 decimals');
  eq(round2(806.449999), 806.45, 'Half-day arithmetic rounds correctly');
  eq(round2(-0), 0, 'Negative zero normalised');
}

console.log(
  `\n${failed === 0 ? '*** ALL REGRESSION CHECKS PASSED ***' : `*** ${failed} CHECK(S) FAILED ***`}`
);
console.log(`    ${passed} passed, ${failed} failed\n`);

process.exit(failed === 0 ? 0 : 1);
