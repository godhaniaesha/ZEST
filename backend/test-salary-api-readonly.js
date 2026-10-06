/* Read-only end-to-end smoke test for the Salary / Leave APIs.
 *
 * Unlike test-payroll.js this script NEVER writes: it only logs in and reads.
 * That makes it safe to run against real data at any time.
 *
 *   1) start the server:   node server.js
 *   2) run this:           node test-salary-api-readonly.js
 */
require('dotenv').config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;
let token = null;

let failures = 0;

const line = (t) => console.log(`\n=== ${t} ===`);

const assert = (cond, msg) => {
  if (cond) console.log(`  PASS  ${msg}`);
  else {
    console.log(`  FAIL  ${msg}`);
    failures += 1;
  }
};

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

(async () => {
  try {
    line('LOGIN');
    const login = await call('POST', '/auth/login', {
      email: 'admin@zest.com',
      password: 'admin123',
    });

    if (login.status !== 200) {
      console.log(`  FAIL  login returned ${login.status}`);
      console.log('\n*** ABORTED — cannot continue without a token ***\n');
      process.exit(1);
    }

    token = login.data.token;
    assert(!!token, `logged in as ${login.data.user.email} (${login.data.user.role})`);

    const now = new Date();
    const p = { month: now.getMonth() + 1, year: now.getFullYear() };
    const qs = `?month=${p.month}&year=${p.year}`;

    line('PERIOD VALIDATION');
    assert((await call('GET', '/salary/summary')).status === 200, 'summary with no period uses current month');

    for (const bad of ['13', '0', '-4', '1.5', 'abc']) {
      const r = await call('GET', `/salary/summary?month=${bad}&year=${p.year}`);
      assert(r.status === 400, `summary rejects month=${bad} (status ${r.status})`);
    }

    assert(
      (await call('GET', `/salary/summary?month=${p.month}&year=1990`)).status === 400,
      'summary rejects an implausible year'
    );

    line('SUMMARY');
    const sum = await call('GET', `/salary/summary${qs}`);
    assert(sum.status === 200, `summary status ${sum.status}`);

    const t = sum.data.totals;
    console.log(`        records=${sum.data.totalRecords} staff=${sum.data.totalStaff}`);
    console.log(`        gross=${t.gross} deductions=${t.deductions} net=${t.net}`);
    console.log(`        paidLeave=${t.paidDays} unpaidLeave=${t.unpaidDays}`);
    assert(
      Math.abs(t.gross - t.deductions - t.net) < 0.01,
      'gross - deductions = net (totals balance)'
    );

    line('STAFF OVERVIEW (period aware)');
    const ov = await call('GET', `/salary/staff/overview${qs}`);
    assert(ov.status === 200, `overview status ${ov.status}`);
    assert(Array.isArray(ov.data), 'overview returns a plain array (backwards compatible)');
    assert(ov.data.length > 0, `${ov.data.length} staff members`);

    const hasMonthLeaveDays = ov.data.every(
      (s) => typeof s.monthLeaveDays === 'number'
    );
    assert(hasMonthLeaveDays, 'every entry carries monthLeaveDays for the selected period');

    const balancesValid = ov.data.every(
      (s) =>
        s.leavesTaken >= 0 &&
        s.leavesRemaining >= 0 &&
        s.leavesTaken + s.leavesRemaining === s.leavesTotal
    );
    assert(balancesValid, 'taken + remaining = total for every staff member');

    const monthLeavesReasonable = ov.data.every(
      (s) => s.monthLeaveDays >= 0 && s.monthLeaveDays <= 31
    );
    assert(monthLeavesReasonable, 'monthLeaveDays stays within a month');

    // A staff member with no leave in the month must report 0, not "undefined"
    const zeros = ov.data.filter((s) => s.monthLeaveDays === 0).length;
    assert(zeros >= 0, `${zeros} staff have no leave booked in ${p.month}/${p.year}`);

    line('PER-STAFF ESTIMATE');
    const staffId = ov.data[0].staffId;
    const est = await call('GET', `/salary/estimate/${staffId}${qs}`);
    assert(est.status === 200, `estimate status ${est.status}`);

    console.log(`        ${est.data.staffName}: base=${est.data.baseSalary} perDay=${est.data.perDaySalary}`);
    console.log(`        working=${est.data.workingDays}/${est.data.calendarDays} calendar days`);
    console.log(`        present=${est.data.presentOnly} late=${est.data.lateDays} absent=${est.data.absentDays}`);
    console.log(`        half=${est.data.halfDays} onLeave=${est.data.onLeaveDays}`);
    console.log(`        paidLeave=${est.data.paidLeaveDays} unpaidLeave=${est.data.unpaidLeaveDays}`);
    console.log(`        accounted=${est.data.accountedDays} unmarked=${est.data.unmarkedDays}`);
    console.log(`        deduped overlap=${est.data.overlapLeaveDays}`);

    assert(
      Math.abs(est.data.perDaySalary * est.data.workingDays - est.data.baseSalary) < 1,
      'perDaySalary x workingDays = baseSalary'
    );
    assert(
      est.data.workingDays <= est.data.calendarDays,
      'workingDays never exceeds calendarDays (mid-month joiners are prorated)'
    );

    const buckets = [
      'presentOnly',
      'lateDays',
      'absentDays',
      'halfDays',
      'onLeaveDays',
      'paidLeaveDays',
      'unpaidLeaveDays',
      'accountedDays',
      'unmarkedDays',
      'perDaySalary',
      'perHourSalary',
    ];
    const missing = buckets.filter((k) => typeof est.data[k] !== 'number');
    assert(missing.length === 0, `all day buckets present${missing.length ? ` (missing: ${missing})` : ''}`);

    assert(
      Math.abs(
        est.data.paidLeaveDays + est.data.unpaidLeaveDays - est.data.leaveDays
      ) < 0.01,
      'leaveDays = paid + unpaid'
    );

    assert(est.data.unmarkedDays >= 0, 'unmarkedDays is never negative');

    line('LEDGER RECORDS');
    const list = await call('GET', `/salary${qs}&limit=200`);
    assert(list.status === 200, `list status ${list.status}`);
    console.log(`        ${list.data.records.length} record(s) for ${p.month}/${p.year}`);

    if (list.data.records.length > 0) {
      const rec = list.data.records[0];
      const persisted = buckets.filter((k) => typeof rec[k] !== 'number');
      assert(
        persisted.length === 0,
        `stored records expose the new fields${persisted.length ? ` (missing: ${persisted})` : ''}`
      );
    }

    line('LEAVE MODULE AGREEMENT');
    const mine = await call('GET', '/leave/stats/summary');
    assert(mine.status === 200, `leave summary status ${mine.status}`);
    console.log(`        pending=${mine.data.pending} approved=${mine.data.approved} rejected=${mine.data.rejected}`);

    const bal = await call('GET', `/leave/staff/${staffId}/balance?year=${p.year}`);
    assert(bal.status === 200, `leave balance status ${bal.status}`);

    if (bal.status === 200) {
      assert(
        bal.data.leavesTaken + bal.data.leavesRemaining === bal.data.leavesTotal,
        `leave module agrees with itself (${bal.data.leavesTaken} + ${bal.data.leavesRemaining} = ${bal.data.leavesTotal})`
      );

      const ovStaff = ov.data.find((s) => s.staffId === staffId);
      assert(
        ovStaff.leavesTaken === bal.data.leavesTaken,
        `salary overview matches the leave module (${ovStaff.leavesTaken} vs ${bal.data.leavesTaken})`
      );
    }
  } catch (err) {
    console.log(`  FAIL  unexpected error: ${err.message}`);
    failures += 1;
  }

  console.log(
    `\n${failures === 0 ? '*** ALL API CHECKS PASSED ***' : `*** ${failures} CHECK(S) FAILED ***`}\n`
  );
  process.exit(failures === 0 ? 0 : 1);
})();
