import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MdPayments,
  MdCheckCircle,
  MdSchedule,
  MdTrendingDown,
  MdSearch,
  MdEdit,
  MdDelete,
  MdAutorenew,
  MdPeople,
  MdVisibility,
  MdAccountBalanceWallet,
  MdEventAvailable,
  MdClose,
  MdWarning,
  MdPrint,
  MdInfo,
  MdCheckCircleOutline,
  MdErrorOutline,
  MdAccountBalance,
  MdCalendarMonth,
  MdInbox,
  MdChevronRight,
} from "react-icons/md";
import DeleteModal from "../../components/DeleteModal";
import FormModal from "../../components/FormModal";
import { salaryAPI } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";
import "./Salary.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ── Payment methods ───────────────────────────────────────
 * Every method collects its own fields, so the form changes
 * shape when the user switches method. The backend only has a
 * single `paymentReference` string column, so the values are
 * stored as `key=value` pairs joined by "; " and decoded back
 * into form fields when a record is reopened.
 * ───────────────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    value: "cash",
    label: "Cash",
    hint: "Handed over at the counter",
    fields: [
      { key: "receivedBy", label: "Received By", placeholder: "e.g. Rahul Patel", required: true },
      { key: "receiptNo", label: "Receipt No", placeholder: "e.g. RCP-2041" },
    ],
  },
  {
    value: "bank",
    label: "Bank Transfer",
    hint: "NEFT / RTGS / IMPS",
    fields: [
      { key: "accountNo", label: "Account Number", placeholder: "Account number", required: true, inputMode: "numeric" },
      { key: "ifsc", label: "IFSC Code", placeholder: "HDFC0001234", required: true, maxLength: 11, upper: true },
      { key: "bankName", label: "Bank Name", placeholder: "e.g. HDFC Bank" },
    ],
  },
  {
    value: "upi",
    label: "UPI",
    hint: "GPay / PhonePe / Paytm",
    fields: [
      { key: "upiId", label: "UPI ID", placeholder: "name@bank", required: true },
      { key: "utr", label: "UTR / Transaction ID", placeholder: "e.g. 426178239011" },
    ],
  },
  {
    value: "card",
    label: "Card",
    hint: "Swipe / machine",
    fields: [
      { key: "cardLast4", label: "Card Last 4 Digits", placeholder: "e.g. 4242", required: true, maxLength: 4, inputMode: "numeric" },
      { key: "authCode", label: "Auth / Approval Code", placeholder: "6-digit code", maxLength: 6 },
      { key: "terminal", label: "Terminal / Machine", placeholder: "e.g. POS-02" },
    ],
  },
];

const methodFields = (method) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.fields || [];

const methodLabel = (method) =>
  PAYMENT_METHODS.find((m) => m.value === method)?.label || method || "—";

const emptyPaymentDetails = (method) =>
  methodFields(method).reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});

/* "upiId=rahul@okicici; utr=426178239011" */
const encodePaymentReference = (method, details = {}) =>
  methodFields(method)
    .map((f) => [f.key, String(details?.[f.key] ?? "").trim()])
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

const decodePaymentReference = (method, reference) => {
  const base = emptyPaymentDetails(method);
  const raw = String(reference || "").trim();

  // Records saved before this change hold a free-form string.
  // Keep it readable instead of silently dropping it.
  if (!raw || !raw.includes("=")) return { ...base, __legacy: raw };

  raw.split(";").forEach((pair) => {
    const i = pair.indexOf("=");
    if (i === -1) return;
    const key = pair.slice(0, i).trim();
    if (key in base) base[key] = pair.slice(i + 1).trim();
  });

  return base;
};

const missingPaymentFields = (method, details = {}) =>
  methodFields(method)
    .filter((f) => f.required && !String(details?.[f.key] ?? "").trim())
    .map((f) => f.label);

/* Readable one-liner for the payslip */
const describePaymentReference = (method, reference) => {
  const details = decodePaymentReference(method, reference);
  const parts = methodFields(method)
    .filter((f) => String(details?.[f.key] ?? "").trim())
    .map((f) => `${f.label}: ${details[f.key]}`);

  if (parts.length) return parts.join("  ·  ");
  return details.__legacy || "";
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const emptyForm = {
  baseSalary: 0,
  salaryType: "monthly",
  overtimeHours: 0,
  overtimeAmount: 0,
  bonus: 0,
  allowances: 0,
  tax: 0,
  pf: 0,
  advance: 0,
  otherDeductions: 0,
  paymentMethod: "bank",
  paymentReference: "",
  paymentDetails: emptyPaymentDetails("bank"),
  notes: "",
};

/* Numeric input shared by the edit form */
const NumberField = ({ label, value, onChange, required, prefix }) => (
  <div className="sal-field">
    <label className="sal-label">
      {label}
      {required && <span style={{ color: "var(--d-gold,#C9A84C)" }}> *</span>}
    </label>
    <input
      className="sal-input"
      type="number"
      min="0"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      style={prefix ? { paddingLeft: 32 } : undefined}
    />
  </div>
);

const SelectField = ({ label, value, onChange, children }) => (
  <div className="sal-field">
    <label className="sal-label">{label}</label>
    <select className="sal-select" value={value} onChange={(e) => onChange(e.target.value)}>
      {children}
    </select>
  </div>
);

/* Renders exactly the inputs the selected method needs, and
 * spans the full width of the surrounding form grid. */
const PaymentDetailsFields = ({ method, details, onChange }) => {
  const fields = methodFields(method);
  const hint = PAYMENT_METHODS.find((m) => m.value === method)?.hint;

  if (!fields.length) return null;

  return (
    <>
      {hint && <p className="sal-pay-hint">{hint}</p>}

      <div
        className="sal-pay-details"
        style={{ gridColumn: "1 / -1" }}
      >
        {fields.map((f) => (
          <div className="sal-field" key={f.key}>
            <label className="sal-label">
              {f.label}
              {f.required && <span style={{ color: "var(--d-gold,#C9A84C)" }}> *</span>}
            </label>
            <input
              className="sal-input"
              type="text"
              inputMode={f.inputMode}
              maxLength={f.maxLength}
              value={details?.[f.key] || ""}
              placeholder={f.placeholder}
              onChange={(e) => onChange({ ...details, [f.key]: e.target.value })}
              style={f.upper ? { textTransform: "uppercase" } : undefined}
            />
          </div>
        ))}
      </div>
    </>
  );
};

/* ── Month-wise day buckets ───────────────────────────────
 * Every day in a payroll period lands in exactly one bucket.
 * `onLeaveDays` is already disjoint from paid/unpaid leave
 * (the backend removes the overlap), so the buckets sum
 * cleanly against the payable working days.
 * ───────────────────────────────────────────────────────── */
const dayBreakdown = (r = {}) => {
  const late = Number(r.lateDays) || 0;
  const calendarDays = Number(r.calendarDays) || 0;

  return {
    calendarDays,
    workingDays: Number(r.workingDays) || calendarDays,
    // Legacy rows only stored a combined `presentDays`
    presentOnly:
      r.presentOnly != null
        ? Number(r.presentOnly) || 0
        : Math.max(0, (Number(r.presentDays) || 0) - late),
    lateDays: late,
    absentDays: Number(r.absentDays) || 0,
    halfDays: Number(r.halfDays) || 0,
    onLeaveDays: Number(r.onLeaveDays) || 0,
    paidLeaveDays: Number(r.paidLeaveDays) || 0,
    unpaidLeaveDays: Number(r.unpaidLeaveDays) || 0,
    unmarkedDays: Number(r.unmarkedDays) || 0,
    overlapLeaveDays: Number(r.overlapLeaveDays) || 0,
  };
};

const BreakdownPanel = ({ rows, periodLabel, loading }) => {
  const agg = rows.reduce(
    (acc, r) => {
      const b = dayBreakdown(r);
      acc.workingDays += b.workingDays;
      acc.presentOnly += b.presentOnly;
      acc.lateDays += b.lateDays;
      acc.absentDays += b.absentDays;
      acc.halfDays += b.halfDays;
      acc.onLeaveDays += b.onLeaveDays;
      acc.paidLeaveDays += b.paidLeaveDays;
      acc.unpaidLeaveDays += b.unpaidLeaveDays;
      acc.unmarkedDays += b.unmarkedDays;
      acc.overlapLeaveDays += b.overlapLeaveDays;
      return acc;
    },
    {
      workingDays: 0,
      presentOnly: 0,
      lateDays: 0,
      absentDays: 0,
      halfDays: 0,
      onLeaveDays: 0,
      paidLeaveDays: 0,
      unpaidLeaveDays: 0,
      unmarkedDays: 0,
      overlapLeaveDays: 0,
    }
  );

  const accounted =
    agg.presentOnly +
    agg.lateDays +
    agg.absentDays +
    agg.halfDays +
    agg.onLeaveDays +
    agg.paidLeaveDays +
    agg.unpaidLeaveDays;

  const base = agg.workingDays || 1;
  const pct = (v) => `${Math.max(0, Math.min(100, (v / base) * 100))}%`;

  const SEGMENTS = [
    { key: "present", label: "Present", value: agg.presentOnly, cls: "present", tone: "var(--d-success,#2ecc71)" },
    { key: "late", label: "Late", value: agg.lateDays, cls: "late", tone: "var(--d-info,#3498db)" },
    { key: "paid", label: "Paid leave", value: agg.paidLeaveDays, cls: "paid", tone: "var(--d-gold,#C9A84C)" },
    { key: "half", label: "Half day", value: agg.halfDays, cls: "half", tone: "var(--d-warning,#f39c12)" },
    { key: "onleave", label: "On leave (attendance)", value: agg.onLeaveDays, cls: "onleave", tone: "#7b5ea7" },
    { key: "absent", label: "Absent", value: agg.absentDays, cls: "absent", tone: "var(--d-danger,#e74c3c)" },
    { key: "unpaid", label: "Unpaid leave", value: agg.unpaidLeaveDays, cls: "unpaid", tone: "#8e2b22" },
    { key: "unmarked", label: "Not marked", value: agg.unmarkedDays, cls: "unmarked", tone: "#cfd3cd" },
  ];

  const visible = SEGMENTS.filter((s) => s.value > 0);

  const CELLS = [
    { label: "Payable Days", value: agg.workingDays, sub: "sum across staff", tone: "var(--d-primary,#16302b)" },
    { label: "Present", value: agg.presentOnly, sub: `${agg.lateDays} late`, tone: "var(--d-success,#2ecc71)" },
    { label: "Half Days", value: agg.halfDays, sub: "0.5 day each", tone: "var(--d-warning,#f39c12)" },
    { label: "Absent", value: agg.absentDays, sub: "full day unpaid", tone: "var(--d-danger,#e74c3c)" },
    { label: "Paid Leave", value: agg.paidLeaveDays, sub: `${agg.overlapLeaveDays} deduped`, tone: "var(--d-gold,#C9A84C)" },
    { label: "Unpaid Leave", value: agg.unpaidLeaveDays, sub: "quota exhausted", tone: "#8e2b22" },
  ];

  return (
    <div className="sal-breakdown">
      <div className="sal-bd-head">
        <h3 className="sal-bd-title">
          <MdCalendarMonth /> {periodLabel} — day-wise breakdown
        </h3>
        <span className="sal-bd-note">
          {loading
            ? "Calculating…"
            : `${rows.length} staff · ${accounted} of ${agg.workingDays} days accounted`}
        </span>
      </div>

      <div className="sal-bd-grid">
        {CELLS.map((c) => (
          <div key={c.label} className="sal-bd-cell" style={{ "--bd-tone": c.tone }}>
            <div className="sal-bd-value">{c.value}</div>
            <div className="sal-bd-label">{c.label}</div>
            <div className="sal-bd-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="sal-recon">
        <div className="sal-recon-row">
          <span>
            Payable day coverage for <b>{periodLabel}</b>
          </span>
          <span>
            <b>{Math.round((accounted / base) * 100)}%</b> reconciled
          </span>
        </div>

        <div className="sal-recon-bar">
          {visible.map((s) => (
            <div
              key={s.key}
              className="sal-recon-seg"
              style={{ width: pct(s.value), background: s.tone }}
              title={`${s.label}: ${s.value}`}
            />
          ))}
        </div>

        <div className="sal-legend">
          {visible.map((s) => (
            <span key={s.key} className="sal-legend-item">
              <i className="sal-legend-dot" style={{ background: s.tone }} />
              {s.label} <b>{s.value}</b>
            </span>
          ))}
        </div>

        {agg.unmarkedDays > 0 && (
          <div className="sal-recon-warn">
            <MdWarning />
            <span>
              <b>{agg.unmarkedDays}</b> payable {agg.unmarkedDays === 1 ? "day has" : "days have"} no
              attendance or leave entry. Mark them in Staff Attendance, then use{" "}
              <b>Regenerate Payroll</b> so the deduction is applied.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Footer calculation ────────────────────────────────────
 * The four flat totals under the table hid the actual maths.
 * This spells it out: every earning line, every deduction line
 * (split into attendance-driven vs manual), the payment split,
 * and the day tally that produces the two automatic deductions.
 * ───────────────────────────────────────────────────────── */
const sumRows = (rows = []) =>
  rows.reduce((acc, r) => {
    const b = dayBreakdown(r);
    const net = Number(r.netSalary) || 0;

    acc.base += Number(r.baseSalary) || 0;
    acc.overtime += Number(r.overtimeAmount) || 0;
    acc.bonus += Number(r.bonus) || 0;
    acc.allowances += Number(r.allowances) || 0;
    acc.gross += Number(r.grossSalary) || 0;

    acc.unpaidLeave += Number(r.unpaidLeaveDeduction) || 0;
    acc.absentHalf += Number(r.absentDeduction) || 0;
    acc.tax += Number(r.tax) || 0;
    acc.pf += Number(r.pf) || 0;
    acc.advance += Number(r.advance) || 0;
    acc.other += Number(r.otherDeductions) || 0;
    acc.deductions += Number(r.totalDeductions) || 0;
    acc.net += net;

    if (r.paymentStatus === "paid") {
      acc.paid += net;
      acc.paidCount += 1;
    } else if (r.paymentStatus === "pending") {
      acc.pending += net;
      acc.pendingCount += 1;
    } else if (r.paymentStatus === "failed") {
      acc.failed += net;
      acc.failedCount += 1;
    }

    acc.workingDays += b.workingDays;
    acc.presentOnly += b.presentOnly;
    acc.lateDays += b.lateDays;
    acc.absentDays += b.absentDays;
    acc.halfDays += b.halfDays;
    acc.onLeaveDays += b.onLeaveDays;
    acc.paidLeaveDays += b.paidLeaveDays;
    acc.unpaidLeaveDays += b.unpaidLeaveDays;
    acc.unmarkedDays += b.unmarkedDays;

    return acc;
  }, {
    base: 0,
    overtime: 0,
    bonus: 0,
    allowances: 0,
    gross: 0,
    unpaidLeave: 0,
    absentHalf: 0,
    tax: 0,
    pf: 0,
    advance: 0,
    other: 0,
    deductions: 0,
    net: 0,
    paid: 0,
    paidCount: 0,
    pending: 0,
    pendingCount: 0,
    failed: 0,
    failedCount: 0,
    workingDays: 0,
    presentOnly: 0,
    lateDays: 0,
    absentDays: 0,
    halfDays: 0,
    onLeaveDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    unmarkedDays: 0,
  });

const CalcLine = ({ label, value, tone, strong }) => (
  <div className={`sal-fx-line${strong ? " strong" : ""}`}>
    <span>{label}</span>
    <b className={tone || ""}>{value > 0 ? formatCurrency(value) : "—"}</b>
  </div>
);

const Tally = ({ label, value, sub, tone }) => (
  <div className="sal-tally-item" style={{ "--tl-tone": tone }}>
    <span className="sal-tally-value">{value}</span>
    <span className="sal-tally-label">{label}</span>
    <span className="sal-tally-sub">{sub}</span>
  </div>
);

const LedgerFooter = ({ rows, allRows, periodLabel }) => {
  const v = sumRows(rows);
  const a = sumRows(allRows);
  const isFiltered = rows.length !== allRows.length;

  const accounted =
    v.presentOnly +
    v.lateDays +
    v.absentDays +
    v.halfDays +
    v.onLeaveDays +
    v.paidLeaveDays +
    v.unpaidLeaveDays;

  // Gross - Deductions must equal Net. Flag it if a stored record drifts.
  const drift = v.gross - v.deductions - v.net;
  const unbalanced = Math.abs(drift) >= 1;

  const autoDeductions = v.unpaidLeave + v.absentHalf;
  const manualDeductions = v.tax + v.pf + v.advance + v.other;
  const hidden = allRows.length - rows.length;

  return (
    <div className="sal-ledger-foot">
      {/* ── payout equation ── */}
      <section className="sal-fx">
        <div className="sal-fx-head">
          <h4 className="sal-fx-title">
            <MdAccountBalanceWallet /> Payout calculation
          </h4>
          <span className="sal-fx-scope">
            {isFiltered
              ? `${rows.length} of ${allRows.length} rows`
              : `All ${allRows.length} rows`}{" "}
            · {periodLabel}
          </span>
        </div>

        <div className="sal-fx-body">
          <div className="sal-fx-col">
            <p className="sal-fx-group">Earnings</p>
            <CalcLine label="Base salary" value={v.base} />
            <CalcLine label="Overtime" value={v.overtime} />
            <CalcLine label="Bonus" value={v.bonus} />
            <CalcLine label="Allowances" value={v.allowances} />
            <CalcLine label="Gross pay" value={v.gross} tone="pos" strong />
          </div>

          <div className="sal-fx-op" aria-hidden="true">−</div>

          <div className="sal-fx-col">
            <p className="sal-fx-group">Attendance-driven</p>
            <CalcLine label="Unpaid leave" value={v.unpaidLeave} />
            <CalcLine label="Absent / half-day" value={v.absentHalf} />
            <p className="sal-fx-group">Manual</p>
            <CalcLine label="Tax" value={v.tax} />
            <CalcLine label="PF" value={v.pf} />
            <CalcLine label="Advance" value={v.advance} />
            <CalcLine label="Other" value={v.other} />
            <CalcLine label="Total deductions" value={v.deductions} tone="neg" strong />
          </div>

          <div className="sal-fx-op" aria-hidden="true">=</div>

          <div className="sal-fx-col sal-fx-col-net">
            <p className="sal-fx-group">Net payable</p>
            <div className="sal-fx-net">{formatCurrency(v.net)}</div>
            <p className="sal-fx-note">
              {autoDeductions > 0
                ? `${formatCurrency(autoDeductions)} auto-deducted from attendance`
                : "No attendance deductions this period"}
            </p>
            {manualDeductions > 0 && (
              <p className="sal-fx-note">
                {formatCurrency(manualDeductions)} added manually
              </p>
            )}

            <p className="sal-fx-group">Payment split</p>
            <div className="sal-pay-row">
              <span><i className="paid" />Paid · {v.paidCount}</span>
              <b>{formatCurrency(v.paid)}</b>
            </div>
            <div className="sal-pay-row">
              <span><i className="pending" />Pending · {v.pendingCount}</span>
              <b>{formatCurrency(v.pending)}</b>
            </div>
            {v.failedCount > 0 && (
              <div className="sal-pay-row">
                <span><i className="failed" />Failed · {v.failedCount}</span>
                <b>{formatCurrency(v.failed)}</b>
              </div>
            )}
          </div>
        </div>

        {unbalanced && (
          <div className="sal-recon-warn">
            <MdWarning />
            <span>
              Totals are off by <b>{formatCurrency(Math.abs(drift))}</b>. Gross minus
              deductions should equal net payable — regenerate this month's payroll.
            </span>
          </div>
        )}
      </section>

      {/* ── day tally ── */}
      <section className="sal-fx sal-fx-days">
        <div className="sal-fx-head">
          <h4 className="sal-fx-title">
            <MdCalendarMonth /> Day tally
          </h4>
          <span className="sal-fx-scope">
            {accounted} of {v.workingDays} payable days
          </span>
        </div>

        <div className="sal-tally">
          <Tally label="Present" value={v.presentOnly} sub={v.lateDays ? `${v.lateDays} late` : "on time"} tone="var(--d-success,#2ecc71)" />
          <Tally label="Half-day" value={v.halfDays} sub="0.5 each" tone="var(--d-warning,#f39c12)" />
          <Tally label="Absent" value={v.absentDays} sub="full day" tone="var(--d-danger,#e74c3c)" />
          <Tally label="Paid leave" value={v.paidLeaveDays} sub="from quota" tone="var(--d-gold,#C9A84C)" />
          <Tally label="Unpaid leave" value={v.unpaidLeaveDays} sub="quota over" tone="#8e2b22" />
          <Tally label="On leave" value={v.onLeaveDays} sub="attendance" tone="#7b5ea7" />
          <Tally label="Not marked" value={v.unmarkedDays} sub="no entry" tone="#cfd3cd" />
        </div>

        {v.unmarkedDays > 0 && (
          <div className="sal-recon-warn">
            <MdWarning />
            <span>
              <b>{v.unmarkedDays}</b> payable {v.unmarkedDays === 1 ? "day has" : "days have"} no
              attendance or leave entry, so no deduction is applied yet.
            </span>
          </div>
        )}

        {isFiltered && (
          <div className="sal-foot-scope">
            <MdInfo />
            <span>
              Whole month ({allRows.length} staff): Gross {formatCurrency(a.gross)} ·
              Deductions {formatCurrency(a.deductions)} · Net {formatCurrency(a.net)} —
              {hidden} row{hidden === 1 ? "" : "s"} hidden by the current filters.
            </span>
          </div>
        )}
      </section>
    </div>
  );
};

export default function Salary() {
  const { user } = useAuth();
  const isAdmin = user?.role === "superadmin" || user?.role === "manager";

  const now = new Date();

  // ── Data ─────────────────────────────────────
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [staffOverview, setStaffOverview] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filters ──────────────────────────────────
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ── Modals ───────────────────────────────────
  const [showGenerate, setShowGenerate] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showPayslip, setShowPayslip] = useState(false);
  const [showPay, setShowPay] = useState(false);

  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [payData, setPayData] = useState({
    paymentMethod: "bank",
    paymentReference: "",
    paymentDetails: emptyPaymentDetails("bank"),
  });
  const [saving, setSaving] = useState(false);

  // ── Toasts ───────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const period = { month: Number(month), year: Number(year) };

  const pushToast = useCallback((type, title, text) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, title, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const dismissToast = (id) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  /* ── Data loading ───────────────────────────── */
  const loadData = useCallback(async () => {
    setLoading(true);
    const p = { month: Number(month), year: Number(year) };
    try {
      const [recordsRes, summaryRes, overviewRes] = await Promise.all([
        salaryAPI.getAll({ ...p, limit: 200 }),
        salaryAPI.getSummary(p),
        // Must receive the period too — otherwise the roster always shows the
        // current month's leave balance while the ledger shows an older month.
        salaryAPI.getStaffOverview(p),
      ]);

      setRecords(recordsRes.data.records || []);
      setSummary(summaryRes.data);
      setStaffOverview(overviewRes.data || []);
    } catch (err) {
      console.error("Error loading salary data:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Handlers ──────────────────────────────── */
  const monthName = () => MONTHS[Number(month) - 1] || "";

  const handleGenerate = async () => {
    setSaving(true);
    try {
      const res = await salaryAPI.generate({ ...period, overwrite: false });
      const { created, updated, skipped } = res.data;
      setShowGenerate(false);
      pushToast(
        "success",
        `Payroll generated for ${monthName()} ${year}`,
        `Created: ${created}\nUpdated: ${updated}\nSkipped (already existed): ${skipped}`
      );
      await loadData();
    } catch (err) {
      pushToast("error", "Generation failed", err.response?.data?.message || "Failed to generate payroll");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (record) => {
    const method = record.paymentMethod || "bank";

    setCurrentItem(record);
    setFormData({
      baseSalary: record.baseSalary || 0,
      salaryType: record.salaryType || "monthly",
      overtimeHours: record.overtimeHours || 0,
      overtimeAmount: record.overtimeAmount || 0,
      bonus: record.bonus || 0,
      allowances: record.allowances || 0,
      tax: record.tax || 0,
      pf: record.pf || 0,
      advance: record.advance || 0,
      otherDeductions: record.otherDeductions || 0,
      paymentMethod: method,
      paymentReference: record.paymentReference || "",
      paymentDetails: decodePaymentReference(method, record.paymentReference),
      notes: record.notes || "",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!currentItem) return;

    const missing = missingPaymentFields(
      formData.paymentMethod,
      formData.paymentDetails
    );
    if (missing.length) {
      pushToast(
        "error",
        "Incomplete payment details",
        `${methodLabel(formData.paymentMethod)} needs: ${missing.join(", ")}`
      );
      return;
    }

    setSaving(true);
    try {
      const { paymentDetails, ...rest } = formData;

      await salaryAPI.update(currentItem._id, {
        ...rest,
        baseSalary: Number(formData.baseSalary) || 0,
        overtimeHours: Number(formData.overtimeHours) || 0,
        overtimeAmount: Number(formData.overtimeAmount) || 0,
        bonus: Number(formData.bonus) || 0,
        allowances: Number(formData.allowances) || 0,
        tax: Number(formData.tax) || 0,
        pf: Number(formData.pf) || 0,
        advance: Number(formData.advance) || 0,
        otherDeductions: Number(formData.otherDeductions) || 0,
        paymentReference: encodePaymentReference(
          formData.paymentMethod,
          paymentDetails
        ),
      });
      setShowForm(false);
      pushToast("success", "Salary updated", `${currentItem.staffName}'s record has been saved.`);
      await loadData();
    } catch (err) {
      pushToast("error", "Update failed", err.response?.data?.message || "Failed to update salary");
    } finally {
      setSaving(false);
    }
  };

  const openPay = (record) => {
    const method = record.paymentMethod || "bank";

    setCurrentItem(record);
    setPayData({
      paymentMethod: method,
      paymentReference: record.paymentReference || "",
      paymentDetails: decodePaymentReference(method, record.paymentReference),
    });
    setShowPay(true);
  };

  const handlePay = async (e) => {
    e?.preventDefault?.();
    if (!currentItem) return;

    const missing = missingPaymentFields(
      payData.paymentMethod,
      payData.paymentDetails
    );
    if (missing.length) {
      pushToast(
        "error",
        "Incomplete payment details",
        `${methodLabel(payData.paymentMethod)} needs: ${missing.join(", ")}`
      );
      return;
    }

    setSaving(true);
    try {
      const { paymentDetails, ...rest } = payData;

      await salaryAPI.markPaid(currentItem._id, {
        ...rest,
        paymentReference: encodePaymentReference(
          payData.paymentMethod,
          paymentDetails
        ),
      });
      setShowPay(false);
      pushToast(
        "success",
        "Payment recorded",
        `${formatCurrency(currentItem.netSalary)} paid to ${currentItem.staffName}.`
      );
      await loadData();
    } catch (err) {
      pushToast("error", "Payment failed", err.response?.data?.message || "Failed to mark salary as paid");
    } finally {
      setSaving(false);
    }
  };

  const openDelete = (record) => {
    setCurrentItem(record);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!currentItem) return;
    try {
      await salaryAPI.delete(currentItem._id);
      setShowDelete(false);
      pushToast("success", "Record deleted", `${currentItem.staffName}'s salary record was removed.`);
      await loadData();
    } catch (err) {
      pushToast("error", "Delete failed", err.response?.data?.message || "Failed to delete salary record");
    }
  };

  const openPayslip = (record) => {
    setCurrentItem(record);
    setShowPayslip(true);
  };

  /* ── Derived data ──────────────────────────── */
  const filtered = records
    .filter((r) => (statusFilter === "all" ? true : r.paymentStatus === statusFilter))
    .filter((r) =>
      searchTerm
        ? `${r.staffName} ${r.role}`.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

  const totals = summary?.totals || {};
  const missingStaff = summary?.missingStaff || 0;

  // Live preview of the payout math while editing
  const previewGross =
    (Number(formData.baseSalary) || 0) +
    (Number(formData.overtimeAmount) || 0) +
    (Number(formData.bonus) || 0) +
    (Number(formData.allowances) || 0);

  const previewDeductions =
    (currentItem?.unpaidLeaveDeduction || 0) +
    (currentItem?.absentDeduction || 0) +
    (Number(formData.tax) || 0) +
    (Number(formData.pf) || 0) +
    (Number(formData.advance) || 0) +
    (Number(formData.otherDeductions) || 0);

  const previewNet = Math.max(0, previewGross - previewDeductions);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  const paidRatio =
    totals.gross > 0 ? Math.round(((Number(totals.paid) || 0) / totals.gross) * 100) : 0;

  const leavePercent = (staff) =>
    staff.leavesTotal ? Math.min(100, (staff.leavesTaken / staff.leavesTotal) * 100) : 0;

  const kpis = [
    {
      label: "Total Payroll",
      value: formatCurrency(totals.gross),
      icon: <MdPayments />,
      tone: "gold",
      meta: `${records.length} record${records.length === 1 ? "" : "s"}`,
      metaTone: "",
    },
    {
      label: "Paid Out",
      value: formatCurrency(totals.paid),
      icon: <MdCheckCircle />,
      tone: "green",
      meta: `${paidRatio}% of payroll settled`,
      metaTone: "pos",
    },
    {
      label: "Pending",
      value: formatCurrency(totals.pending),
      icon: <MdSchedule />,
      tone: "blue",
      meta:
        (Number(totals.pending) || 0) > 0 ? "Awaiting payout" : "All settled",
      metaTone: (Number(totals.pending) || 0) > 0 ? "warn" : "pos",
    },
    {
      label: "Total Deductions",
      value: formatCurrency(totals.deductions),
      icon: <MdTrendingDown />,
      tone: "red",
      meta: `Leave & absence`,
      metaTone: "neg",
    },
  ];

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div className="sal-root">
      {/* ── Toasts ── */}
      <div className="sal-toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`sal-toast ${t.type}`}>
            <span className="sal-toast-icon">
              {t.type === "success" ? (
                <MdCheckCircleOutline />
              ) : t.type === "error" ? (
                <MdErrorOutline />
              ) : (
                <MdInfo />
              )}
            </span>
            <div className="sal-toast-body">
              <div className="sal-toast-title">{t.title}</div>
              {t.text && <div className="sal-toast-text">{t.text}</div>}
            </div>
            <button className="sal-toast-close" onClick={() => dismissToast(t.id)}>
              <MdClose size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Hero ── */}
      <header className="sal-hero">
        <div className="sal-hero-left">
          <div className="sal-hero-icon">
            <MdAccountBalance />
          </div>
          <div>
            <h1 className="sal-hero-title">Salary & Payroll</h1>
            <p className="sal-hero-sub">
              Manage staff salaries, payroll runs, deductions and payments
            </p>
          </div>
        </div>

        <div className="sal-hero-right">
          <span className="sal-period-pill">
            <MdCalendarMonth /> {monthName()} {year}
          </span>
          {isAdmin && (
            <button className="sal-btn-hero" onClick={() => setShowGenerate(true)}>
              <MdAutorenew /> Generate Payroll
            </button>
          )}
        </div>
      </header>

      {/* ── KPI row ── */}
      <section className="sal-kpi-grid">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="sal-skel sal-skel-kpi" />
            ))
          : kpis.map((k) => (
              <article key={k.label} className="sal-kpi">
                <div className={`sal-kpi-icon ${k.tone}`}>{k.icon}</div>
                <div className="sal-kpi-body">
                  <div className="sal-kpi-label">{k.label}</div>
                  <div className="sal-kpi-value">{k.value}</div>
                  <div className={`sal-kpi-meta ${k.metaTone}`}>{k.meta}</div>
                </div>
              </article>
            ))}
      </section>

      {/* ── Controls ── */}
      <section className="sal-controls">
        <div className="sal-controls-row">
          <div className="sal-field w-md">
            <label className="sal-label" htmlFor="sal-month">Month</label>
            <select
              id="sal-month"
              className="sal-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="sal-field w-sm">
            <label className="sal-label" htmlFor="sal-year">Year</label>
            <select
              id="sal-year"
              className="sal-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="sal-field">
            <label className="sal-label">Payment Status</label>
            <div className="sal-segment" role="group" aria-label="Payment status filter">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={statusFilter === s.value ? "active" : ""}
                  onClick={() => setStatusFilter(s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sal-field grow">
            <label className="sal-label" htmlFor="sal-search">Search staff</label>
            <div className="sal-search-wrap">
              <MdSearch className="sal-search-icon" />
              <input
                id="sal-search"
                className="sal-input"
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="sal-clear-search"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  <MdClose size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {missingStaff > 0 && (
          <div className="sal-alert">
            <MdWarning className="sal-alert-icon" />
            <div>
              <strong>{missingStaff}</strong> staff member{missingStaff !== 1 ? "s have" : " has"} no
              payroll record for {monthName()} {year}. Use{" "}
              <strong>Generate Payroll</strong> to create {missingStaff !== 1 ? "them" : "it"}.
            </div>
          </div>
        )}
      </section>

      {/* ── Month-wise attendance + leave breakdown ── */}
      {!loading && records.length > 0 && (
        <BreakdownPanel
          rows={filtered}
          loading={loading}
          periodLabel={`${monthName()} ${year}`}
        />
      )}

      {/* ── Staff roster ── */}
      <div className="sal-section">
        <h2 className="sal-section-title">
          <span className="sal-bar" /> Staff Base Salary
        </h2>
        <span className="sal-section-count">
          {loading ? "Loading…" : `${staffOverview.length} staff`}
        </span>
      </div>

      {loading ? (
        <div className="sal-roster">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="sal-skel" style={{ height: 172, borderRadius: 20 }} />
          ))}
        </div>
      ) : staffOverview.length === 0 ? (
        <div className="sal-ledger">
          <div className="sal-empty">
            <div className="sal-empty-icon"><MdPeople /></div>
            <h3 className="sal-empty-title">No staff on record</h3>
            <p className="sal-empty-text">
              Staff members added to the system will appear here with their base
              salary and leave balance.
            </p>
          </div>
        </div>
      ) : (
        <div className="sal-roster">
          {staffOverview.map((staff) => (
            <article key={staff.staffId} className="sal-person">
              <div className="sal-person-top">
                <div className="sal-avatar">{getInitials(staff.staffName)}</div>
                <div className="sal-person-id">
                  <h3 className="sal-person-name">{staff.staffName}</h3>
                  <p className="sal-person-role">{staff.role}</p>
                </div>
                <div className="sal-person-amt">
                  <div className="sal-person-amt-value">
                    {formatCurrency(staff.baseSalary)}
                  </div>
                  <div className="sal-person-amt-label">{staff.salaryType}</div>
                </div>
              </div>

              <div className="sal-meter-head">
                <span>
                  <MdEventAvailable style={{ verticalAlign: "-2px" }} /> Leaves{" "}
                  <b>{staff.leavesTaken}/{staff.leavesTotal}</b>
                  <span className="sal-meter-year"> · {year}</span>
                </span>
                <span>
                  <b>{staff.leavesRemaining}</b> left
                </span>
              </div>
              <div className="sal-meter">
                <div
                  className="sal-meter-fill"
                  style={{
                    width: `${leavePercent(staff)}%`,
                    backgroundColor:
                      staff.leavesRemaining === 0 ? "var(--d-danger,#e74c3c)" : "var(--d-gold,#C9A84C)",
                  }}
                />
              </div>

              <div className="sal-person-month">
                <MdCalendarMonth /> {staff.monthLeaveDays > 0 ? `${staff.monthLeaveDays} day${staff.monthLeaveDays === 1 ? "" : "s"}` : "No leave"} in {monthName()}
              </div>

              {staff.totalPending > 0 && (
                <span className="sal-pending-flag">
                  <MdSchedule /> {formatCurrency(staff.totalPending)} pending
                </span>
              )}
            </article>
          ))}
        </div>
      )}

      {/* ── Payroll ledger ── */}
      <div className="sal-section">
        <h2 className="sal-section-title">
          <span className="sal-bar" /> {monthName()} {year} Payroll
        </h2>
        <span className="sal-section-count">
          {loading ? "Loading…" : `${filtered.length} shown`}
        </span>
      </div>

      <div className="sal-ledger">
        {loading ? (
          <div style={{ padding: 20, display: "grid", gap: 12 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="sal-skel" style={{ height: 46 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="sal-empty">
            <div className="sal-empty-icon"><MdInbox /></div>
            <h3 className="sal-empty-title">
              {records.length === 0
                ? `No payroll for ${monthName()} ${year}`
                : "No matching records"}
            </h3>
            <p className="sal-empty-text">
              {records.length === 0
                ? "Generate payroll to calculate salary, attendance and approved leave days for every staff member."
                : "Try a different status filter or clear your search to see more results."}
            </p>
            <div className="sal-empty-actions">
              {records.length === 0 && isAdmin && (
                <button className="d-btn-primary" onClick={() => setShowGenerate(true)}>
                  <MdAutorenew /> Generate Payroll
                </button>
              )}
              {records.length > 0 && (
                <button
                  className="sal-print-btn"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchTerm("");
                  }}
                >
                  <MdChevronRight /> Reset filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="sal-ledger-scroll">
              <table className="sal-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th className="num">Base</th>
                    <th className="num">Attendance</th>
                    <th className="num">Leave</th>
                    <th className="num">Bonus / OT</th>
                    <th className="num">Deductions</th>
                    <th className="num">Net Pay</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => {
                    const days = dayBreakdown(record);
                    return (
                    <tr key={record._id}>
                      <td>
                        <div className="sal-cell-staff">
                          <div className="sal-cell-avatar">
                            {getInitials(record.staffName)}
                          </div>
                          <div>
                            <div className="sal-cell-name">{record.staffName}</div>
                            <div className="sal-cell-role">{record.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="num">{formatCurrency(record.baseSalary)}</td>

                      <td className="num">
                        <div className="sal-stack">
                          <span className="sal-stack-l">
                            <strong>{days.presentOnly + days.lateDays}</strong> / {days.workingDays}
                          </span>
                          <span className="sal-stack-s">
                            {days.lateDays > 0 ? `${days.lateDays} late · ` : ""}
                            {days.absentDays} absent
                            {days.halfDays > 0 ? ` · ${days.halfDays} half` : ""}
                          </span>
                          {days.unmarkedDays > 0 && (
                            <span className="sal-row-note">
                              {days.unmarkedDays} day{days.unmarkedDays === 1 ? "" : "s"} not marked
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="num">
                        <div className="sal-stack">
                          <span className="sal-stack-l">
                            <strong>{days.paidLeaveDays + days.unpaidLeaveDays}</strong> total
                          </span>
                          <span className="sal-stack-s pos">
                            {days.paidLeaveDays} paid
                          </span>
                          {days.unpaidLeaveDays > 0 && (
                            <span className="sal-stack-s neg">
                              {days.unpaidLeaveDays} unpaid
                            </span>
                          )}
                          {days.overlapLeaveDays > 0 && (
                            <span className="sal-stack-s">
                              {days.overlapLeaveDays} deduped
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="num">
                        <div className="sal-stack">
                          {record.bonus > 0 && (
                            <span className="sal-stack-s pos">
                              Bonus {formatCurrency(record.bonus)}
                            </span>
                          )}
                          {record.overtimeAmount > 0 && (
                            <span className="sal-stack-s pos">
                              OT {formatCurrency(record.overtimeAmount)}
                            </span>
                          )}
                          {record.bonus === 0 && record.overtimeAmount === 0 && (
                            <span className="sal-dash">—</span>
                          )}
                        </div>
                      </td>

                      <td className="num">
                        <span className="sal-amt-deduct">
                          −{formatCurrency(record.totalDeductions)}
                        </span>
                      </td>

                      <td className="num">
                        <span className="sal-amt-net">
                          {formatCurrency(record.netSalary)}
                        </span>
                      </td>

                      <td>
                        <span className={`sal-chip ${record.paymentStatus}`}>
                          {record.paymentStatus}
                        </span>
                      </td>

                      <td>
                        <div className="sal-actions">
                          <button
                            className="sal-icon-btn"
                            title="View payslip"
                            onClick={() => openPayslip(record)}
                          >
                            <MdVisibility />
                          </button>

                          {isAdmin && record.paymentStatus !== "paid" && (
                            <button
                              className="sal-pay-btn"
                              onClick={() => openPay(record)}
                            >
                              <MdAccountBalanceWallet /> Pay
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              className="sal-icon-btn"
                              title="Edit"
                              onClick={() => openEdit(record)}
                            >
                              <MdEdit />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              className="sal-icon-btn danger"
                              title="Delete"
                              onClick={() => openDelete(record)}
                            >
                              <MdDelete />
                            </button>
                          )}
                        </div>
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <LedgerFooter
              rows={filtered}
              allRows={records}
              periodLabel={`${monthName()} ${year}`}
            />
          </>
        )}
      </div>

      {/* ── Generate Payroll Modal ── */}
      <FormModal
        show={showGenerate}
        onHide={() => setShowGenerate(false)}
        title="Generate Payroll"
        onSubmit={handleGenerate}
        submitLabel={saving ? "Generating..." : "Generate"}
        icon={<MdAutorenew />}
      >
        <div className="sal-gen-hero">
          <div className="sal-gen-orb"><MdPeople /></div>
          <h4 className="sal-gen-title">
            Generate payroll for {monthName()} {year}
          </h4>
          <p className="sal-gen-text">
            Salary, attendance and approved leave days will be calculated
            automatically for every staff member. Existing records are left
            untouched.
          </p>
        </div>
      </FormModal>

      {/* ── Edit Salary Modal ── */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={`Edit Salary — ${currentItem?.staffName || ""}`}
        onSubmit={handleSave}
        submitLabel={saving ? "Saving..." : "Save Changes"}
        icon={<MdEdit />}
      >
        {currentItem && (
          <>
            {/* Summary strip */}
            <div className="sal-modal-strip">
              <div className="sal-strip-row">
                <span>Base</span>
                <b>{formatCurrency(currentItem.baseSalary)}</b>
              </div>
              <div className="sal-strip-row">
                <span>Present / Absent</span>
                <b>{currentItem.presentDays}P · {currentItem.absentDays}A</b>
              </div>
              <div className="sal-strip-row">
                <span>Leave (paid / unpaid)</span>
                <b>{currentItem.paidLeaveDays} / {currentItem.unpaidLeaveDays}</b>
              </div>
              <div className="sal-strip-row">
                <span>Leave deduction</span>
                <b className="neg">
                  −{formatCurrency(currentItem.unpaidLeaveDeduction + currentItem.absentDeduction)}
                </b>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <NumberField
                label="Base Salary"
                required
                value={formData.baseSalary}
                onChange={(v) => setFormData({ ...formData, baseSalary: v })}
              />
              <SelectField
                label="Salary Type"
                value={formData.salaryType}
                onChange={(v) => setFormData({ ...formData, salaryType: v })}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hourly">Hourly</option>
              </SelectField>
              <NumberField
                label="Overtime Hours"
                value={formData.overtimeHours}
                onChange={(v) => setFormData({ ...formData, overtimeHours: v })}
              />
              <NumberField
                label="Overtime Amount"
                value={formData.overtimeAmount}
                onChange={(v) => setFormData({ ...formData, overtimeAmount: v })}
              />
              <NumberField
                label="Bonus"
                value={formData.bonus}
                onChange={(v) => setFormData({ ...formData, bonus: v })}
              />
              <NumberField
                label="Allowances"
                value={formData.allowances}
                onChange={(v) => setFormData({ ...formData, allowances: v })}
              />
              <NumberField
                label="Tax (TDS)"
                value={formData.tax}
                onChange={(v) => setFormData({ ...formData, tax: v })}
              />
              <NumberField
                label="PF"
                value={formData.pf}
                onChange={(v) => setFormData({ ...formData, pf: v })}
              />
              <NumberField
                label="Salary Advance"
                value={formData.advance}
                onChange={(v) => setFormData({ ...formData, advance: v })}
              />
              <NumberField
                label="Other Deductions"
                value={formData.otherDeductions}
                onChange={(v) => setFormData({ ...formData, otherDeductions: v })}
              />
              <SelectField
                label="Payment Method"
                value={formData.paymentMethod}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    paymentMethod: v,
                    // fields differ per method, so reset them
                    paymentDetails: emptyPaymentDetails(v),
                  })
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </SelectField>

              <PaymentDetailsFields
                method={formData.paymentMethod}
                details={formData.paymentDetails}
                onChange={(d) => setFormData({ ...formData, paymentDetails: d })}
              />
            </div>

            <div className="sal-field" style={{ marginTop: 16 }}>
              <label className="sal-label">Notes</label>
              <textarea
                className="sal-input"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>

            {/* Live payout preview */}
            <div className="sal-calc" style={{ marginTop: 18 }}>
              <div className="sal-calc-head">
                <MdAutorenew /> Live payout preview
              </div>
              <div className="sal-calc-row">
                <span>Gross Salary</span>
                <b>{formatCurrency(previewGross)}</b>
              </div>
              <div className="sal-calc-row">
                <span>Total Deductions</span>
                <b className="neg">−{formatCurrency(previewDeductions)}</b>
              </div>
              <div className="sal-calc-total">
                <span>Net Pay</span>
                <b>{formatCurrency(previewNet)}</b>
              </div>
            </div>
          </>
        )}
      </FormModal>

      {/* ── Mark as Paid Modal ── */}
      <FormModal
        show={showPay}
        onHide={() => setShowPay(false)}
        title={`Pay Salary — ${currentItem?.staffName || ""}`}
        onSubmit={handlePay}
        submitLabel={saving ? "Processing..." : "Confirm Payment"}
        icon={<MdAccountBalanceWallet />}
      >
        {currentItem && (
          <>
            <div className="sal-pay-hero">
              <div className="sal-pay-label">Net payout</div>
              <div className="sal-pay-amount">{formatCurrency(currentItem.netSalary)}</div>
              <div className="sal-pay-for">
                for {MONTHS[currentItem.month - 1]} {currentItem.year}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <SelectField
                label="Payment Method"
                value={payData.paymentMethod}
                onChange={(v) =>
                  setPayData({
                    ...payData,
                    paymentMethod: v,
                    paymentDetails: emptyPaymentDetails(v),
                  })
                }
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </SelectField>

              <PaymentDetailsFields
                method={payData.paymentMethod}
                details={payData.paymentDetails}
                onChange={(d) => setPayData({ ...payData, paymentDetails: d })}
              />
            </div>
          </>
        )}
      </FormModal>

      {/* ── Payslip Modal ── */}
      <FormModal
        show={showPayslip}
        onHide={() => setShowPayslip(false)}
        title="Payslip"
        onSubmit={() => setShowPayslip(false)}
        submitLabel="Close"
        icon={<MdVisibility />}
      >
        {currentItem && (
          <div className="sal-slip">
            <div className="sal-slip-tools">
              <button className="sal-print-btn" onClick={() => window.print()}>
                <MdPrint size={15} /> Print payslip
              </button>
            </div>

            <div className="sal-slip-head">
              <h4 className="sal-slip-brand">ZÉST</h4>
              <p className="sal-slip-tag">Cafe & Bar · Payslip</p>
              <h5 className="sal-slip-name" style={{ marginTop: 14 }}>{currentItem.staffName}</h5>
              <p className="sal-slip-meta">
                {currentItem.role} · {MONTHS[currentItem.month - 1]} {currentItem.year}
              </p>
            </div>

            {/* Attendance tiles */}
            <div className="sal-tiles">
              {[
                ["Working Days", currentItem.workingDays],
                ["Present", currentItem.presentDays],
                ["Absent", currentItem.absentDays],
                ["Paid Leave", currentItem.paidLeaveDays],
                ["Unpaid Leave", currentItem.unpaidLeaveDays],
                ["Overtime Hrs", currentItem.overtimeHours],
              ].map(([label, value]) => (
                <div className="sal-tile" key={label}>
                  <div className="sal-tile-value">{value ?? 0}</div>
                  <div className="sal-tile-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Earnings */}
            <div className="sal-slip-block">
              <div className="sal-slip-block-title earn">Earnings</div>
              {[
                ["Base Salary", currentItem.baseSalary],
                ["Overtime", currentItem.overtimeAmount],
                ["Bonus", currentItem.bonus],
                ["Allowances", currentItem.allowances],
              ].map(([label, value]) => (
                <div className="sal-slip-line" key={label}>
                  <span>{label}</span>
                  <b>{formatCurrency(value)}</b>
                </div>
              ))}
              <div className="sal-slip-line total">
                <span>Gross Salary</span>
                <b>{formatCurrency(currentItem.grossSalary)}</b>
              </div>
            </div>

            {/* Deductions */}
            <div className="sal-slip-block">
              <div className="sal-slip-block-title deduct">Deductions</div>
              {[
                ["Unpaid Leave", currentItem.unpaidLeaveDeduction],
                ["Absence", currentItem.absentDeduction],
                ["Tax (TDS)", currentItem.tax],
                ["PF", currentItem.pf],
                ["Advance", currentItem.advance],
                ["Other", currentItem.otherDeductions],
              ]
                .filter(([, v]) => Number(v) > 0)
                .map(([label, value]) => (
                  <div className="sal-slip-line" key={label}>
                    <span>{label}</span>
                    <b className="neg">−{formatCurrency(value)}</b>
                  </div>
                ))}
              <div className="sal-slip-line total">
                <span>Total Deductions</span>
                <b className="neg">−{formatCurrency(currentItem.totalDeductions)}</b>
              </div>
            </div>

            {/* Net */}
            <div className="sal-slip-net">
              <span>Net Payable</span>
              <b>{formatCurrency(currentItem.netSalary)}</b>
            </div>

            <div className="sal-slip-foot">
              <span style={{ textTransform: "capitalize" }}>
                Status: {currentItem.paymentStatus} · {methodLabel(currentItem.paymentMethod)}
              </span>
              {currentItem.paymentDate && (
                <span>Paid on {new Date(currentItem.paymentDate).toLocaleDateString("en-IN")}</span>
              )}
            </div>

            {describePaymentReference(
              currentItem.paymentMethod,
              currentItem.paymentReference
            ) && (
              <div className="sal-slip-note">
                <strong>Payment:</strong>{" "}
                {describePaymentReference(
                  currentItem.paymentMethod,
                  currentItem.paymentReference
                )}
              </div>
            )}

            {currentItem.notes && (
              <div className="sal-slip-note">
                <strong>Note:</strong> {currentItem.notes}
              </div>
            )}
          </div>
        )}
      </FormModal>

      {/* ── Delete Modal ── */}
      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={
          currentItem
            ? `salary record for ${currentItem.staffName} (${MONTHS[currentItem.month - 1]} ${currentItem.year})`
            : "salary record"
        }
      />
    </div>
  );
}