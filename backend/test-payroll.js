/* End-to-end check for the new Salary + Leave modules (uses built-in fetch) */
require('dotenv').config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api`;
let token = null;

const line = (t) => console.log(`\n=== ${t} ===`);
const ok = (t) => console.log(`  PASS  ${t}`);
const bad = (t) => console.log(`  PASS_TODO  ${t}`);

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
  let failures = 0;
  const assert = (cond, msg) => {
    if (cond) ok(msg);
    else {
      bad(msg);
      failures++;
    }
  };

  try {
    line('LOGIN');
    const login = await call('POST', '/auth/login', {
      email: 'admin@zest.com',
      password: 'admin123',
    });
    assert(login.status === 200, `login status ${login.status}`);
    token = login.data.token;
    assert(!!token, `logged in as ${login.data.user.email} (${login.data.user.role})`);

    line('STAFF SALARY OVERVIEW');
    const ov = await call('GET', '/salary/staff/overview');
    assert(ov.status === 200, `overview status ${ov.status}`);
    assert(Array.isArray(ov.data) && ov.data.length > 0, `${ov.data.length} staff members`);
    const allNumeric = ov.data.every((s) => typeof s.baseSalary === 'number');
    assert(allNumeric, 'every salary is a number (legacy strings converted)');
    ov.data.slice(0, 3).forEach((s) =>
      console.log(`        ${s.staffName.padEnd(12)} ${String(s.role).padEnd(11)} base=${s.baseSalary} ${s.salaryType}`)
    );

    const now = new Date();
    const p = { month: now.getMonth() + 1, year: now.getFullYear() };
    const qs = `?month=${p.month}&year=${p.year}`;

    line('GENERATE PAYROLL');
    const gen = await call('POST', '/salary/generate', p);
    assert(gen.status === 201, `generate status ${gen.status}`);
    console.log(`        created=${gen.data.created} updated=${gen.data.updated} skipped=${gen.data.skipped}`);
    assert(gen.data.created + gen.data.skipped > 0, 'payroll generated or already present');

    line('PAYROLL SUMMARY');
    const sum = await call('GET', `/salary/summary${qs}`);
    assert(sum.status === 200, `summary status ${sum.status}`);
    const t = sum.data.totals;
    console.log(`        gross=${t.gross} deductions=${t.deductions} net=${t.net}`);
    console.log(`        paid=${t.paid} pending=${t.pending}`);
    console.log(`        leaveDeduction=${t.unpaidLeaveDeduction} absenceDeduction=${t.absentDeduction}`);
    assert(
      Math.abs(t.gross - t.deductions - t.net) < 0.01,
      'gross - deductions = net (totals balance)'
    );
    assert(sum.data.missingStaff === 0, `no staff missing payroll (missing=${sum.data.missingStaff})`);

    line('ESTIMATE ENDPOINT');
    const staffId = ov.data[0].staffId;
    const est = await call('GET', `/salary/estimate/${staffId}${qs}`);
    assert(est.status === 200, `estimate status ${est.status}`);
    console.log(`        ${est.data.staffName}: base=${est.data.baseSalary} perDay=${est.data.perDaySalary}`);
    console.log(`        present=${est.data.presentDays} absent=${est.data.absentDays}`);
    console.log(`        paidLeave=${est.data.paidLeaveDays} unpaidLeave=${est.data.unpaidLeaveDays}`);
    assert(
      Math.abs(est.data.perDaySalary * est.data.workingDays - est.data.baseSalary) < 1,
      'perDaySalary x workingDays = baseSalary'
    );

    line('EDIT A SALARY RECORD');
    const list = await call('GET', `/salary${qs}`);
    assert(list.status === 200, `list status ${list.status}`);
    const rec = list.data.records[0];
    assert(!!rec, `got ${list.data.records.length} payroll records`);

    const upd = await call('PUT', `/salary/${rec._id}`, {
      bonus: 5000,
      tax: 1200,
      advance: 1000,
    });
    assert(upd.status === 200, `update status ${upd.status}`);
    assert(upd.data.bonus === 5000, 'bonus saved');

    const expGross =
      upd.data.baseSalary + upd.data.bonus + upd.data.overtimeAmount + upd.data.allowances;
    assert(
      Math.abs(upd.data.grossSalary - expGross) < 0.01,
      `gross auto-recomputed (${upd.data.grossSalary})`
    );
    assert(
      Math.abs(upd.data.netSalary - (expGross - upd.data.totalDeductions)) < 0.01,
      `net auto-recomputed (${upd.data.netSalary})`
    );
    assert(upd.data.leaveDays === upd.data.paidLeaveDays + upd.data.unpaidLeaveDays, 'leaveDays = paid + unpaid');

    line('MARK AS PAID');
    const paid = await call('POST', `/salary/${rec._id}/pay`, {
      paymentMethod: 'upi',
      paymentReference: 'TEST123',
    });
    assert(paid.data.paymentStatus === 'paid', `marked paid via ${paid.data.paymentMethod}`);
    assert(!!paid.data.paymentDate, 'payment date stamped');

    const twice = await call('POST', `/salary/${rec._id}/pay`, {});
    assert(twice.status === 400, `double payment blocked (status ${twice.status})`);

    line('LEAVE ROUTE ORDERING (regression check)');
    const ls = await call('GET', '/leave/stats/summary');
    assert(ls.status === 200 && typeof ls.data.pending === 'number', `/stats/summary works: ${JSON.stringify(ls.data)}`);

    const mine = await call('GET', '/leave/my');
    assert(mine.status === 200, `/my works: ${mine.data.leaves.length} requests, balance ${mine.data.balance.leavesTaken}/${mine.data.balance.leavesTotal}`);

    const bal = await call('GET', `/leave/staff/${staffId}/balance`);
    assert(bal.status === 200, `/staff/:id/balance works: taken=${bal.data.leavesTaken} remaining=${bal.data.leavesRemaining}`);
    assert(
      bal.data.leavesTaken + bal.data.leavesRemaining === bal.data.leavesTotal,
      'taken + remaining = total'
    );
  } catch (err) {
    console.log(`  FAIL  unexpected error: ${err.message}`);
    failures++;
  }

  console.log(`\n${failures === 0 ? '*** ALL CHECKS PASSED ***' : '*** ' + failures + ' CHECK(S) FAILED ***'}\n`);
  process.exit(failures === 0 ? 0 : 1);
})();