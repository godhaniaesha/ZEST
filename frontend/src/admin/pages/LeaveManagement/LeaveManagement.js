import React, { useState, useEffect } from "react";
import { Row, Col, Form } from "react-bootstrap";
import {
  MdEvent, MdCheckCircle, MdCancel, MdSearch,
  MdEdit, MdDelete, MdAdd, MdAccessTime, MdPeople,
} from "react-icons/md";
import DeleteModal from "../../components/DeleteModal";
import FormModal from "../../components/FormModal";
import { leaveAPI, usersAPI } from "../../../api";
import { useAuth } from "../../../contexts/AuthContext";

/* ─────────────────────────────────────────────
   REUSABLE TIME PICKER COMPONENT
───────────────────────────────────────────── */
function TimePicker({ value, onChange, label }) {
  // value = { hour: "9", minute: "00", period: "AM" }
  const incrHour = () => {
    const h = parseInt(value.hour);
    onChange({ ...value, hour: String(h >= 12 ? 1 : h + 1) });
  };
  const decrHour = () => {
    const h = parseInt(value.hour);
    onChange({ ...value, hour: String(h <= 1 ? 12 : h - 1) });
  };
  const incrMin = () => {
    const m = parseInt(value.minute);
    onChange({ ...value, minute: String((m + 1) % 60).padStart(2, "0") });
  };
  const decrMin = () => {
    const m = parseInt(value.minute);
    onChange({ ...value, minute: String((m + 59) % 60).padStart(2, "0") });
  };

  const S = {
    wrap: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      background: "var(--d-bg, #f5f4f0)",
      border: "1px solid var(--d-border, #e2e0da)",
      borderRadius: "var(--d-radius-md, 12px)",
      padding: "8px 12px",
      width: "100%",
      userSelect: "none",
    },
    col: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flex: 1,
    },
    arrowBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--d-gold, #C9A84C)",
      fontWeight: 800,
      fontSize: "1.1rem",
      lineHeight: 1,
      padding: "3px 10px",
      borderRadius: "6px",
      transition: "background .15s",
    },
    digit: {
      fontFamily: "Cormorant Garamond, serif",
      fontSize: "1.8rem",
      fontWeight: 700,
      color: "var(--d-primary, #16302B)",
      width: "46px",
      textAlign: "center",
      lineHeight: 1.1,
      padding: "2px 0",
      letterSpacing: "1px",
    },
    unit: {
      fontSize: "0.58rem",
      textTransform: "uppercase",
      letterSpacing: "1.2px",
      color: "var(--d-text-muted, #6b7280)",
      marginTop: "2px",
      fontWeight: 600,
    },
    colon: {
      fontSize: "1.6rem",
      fontWeight: 700,
      color: "var(--d-primary, #16302B)",
      alignSelf: "center",
      marginBottom: "16px",
      opacity: 0.5,
    },
    periodWrap: {
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      alignSelf: "center",
      marginBottom: "2px",
    },
    period: (active) => ({
      padding: "6px 11px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: 800,
      fontSize: "0.72rem",
      letterSpacing: "0.5px",
      lineHeight: 1,
      background: active
        ? "var(--d-primary, #16302B)"
        : "rgba(0,0,0,0.06)",
      color: active
        ? "var(--d-gold, #C9A84C)"
        : "var(--d-text-muted, #6b7280)",
      transition: "all .18s",
    }),
  };

  return (
    <Form.Group>
      {label && (
        <Form.Label className="small fw-bold">{label}</Form.Label>
      )}
      <div style={S.wrap}>
        {/* ── HOUR ── */}
        <div style={S.col}>
          <button type="button" style={S.arrowBtn} onClick={incrHour}>▲</button>
          <div style={S.digit}>{String(value.hour).padStart(2, "0")}</div>
          <button type="button" style={S.arrowBtn} onClick={decrHour}>▼</button>
          <div style={S.unit}>HR</div>
        </div>

        <div style={S.colon}>:</div>

        {/* ── MINUTE ── */}
        <div style={S.col}>
          <button type="button" style={S.arrowBtn} onClick={incrMin}>▲</button>
          <div style={S.digit}>{String(value.minute).padStart(2, "0")}</div>
          <button type="button" style={S.arrowBtn} onClick={decrMin}>▼</button>
          <div style={S.unit}>MIN</div>
        </div>

        {/* ── AM / PM ── */}
        <div style={S.periodWrap}>
          {["AM", "PM"].map((p) => (
            <button
              key={p}
              type="button"
              style={S.period(value.period === p)}
              onClick={() => onChange({ ...value, period: p })}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </Form.Group>
  );
}

/* ─────────────────────────────────────────────
   LEAVE MANAGEMENT PAGE
───────────────────────────────────────────── */
export default function LeaveManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === "superadmin" || user?.role === "manager";

  const [leaves, setLeaves] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    staffId: "", startDate: "", endDate: "",
    startTime: "", endTime: "", type: "sick", reason: "",
  });

  const [startTime12, setStartTime12] = useState({ hour: "9", minute: "00", period: "AM" });
  const [endTime12,   setEndTime12]   = useState({ hour: "5", minute: "00", period: "PM" });

  /* ── Data Loading ── */
  const loadData = async () => {
    try {
      setLoading(true);
      const isAdminLocal = user?.role === "superadmin" || user?.role === "manager";
      const requests = [leaveAPI.getAll()];
      if (isAdminLocal) requests.push(usersAPI.getAll());

      const responses = await Promise.all(requests);
      const leavesRes = responses[0];
      const staffRes  = isAdminLocal ? responses[1] : null;

      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);

      if (isAdminLocal && staffRes) {
        setStaffList(
          Array.isArray(staffRes.data)
            ? staffRes.data
                .filter((s) => s.role !== "customer" && s.role !== "superadmin")
                .map((s) => ({
                  _id: s._id, name: s.name, role: s.role,
                  shift: s.shift || "Morning",
                  shiftStart: s.shiftStart || "11:00",
                  shiftEnd: s.shiftEnd || "18:00",
                  initials: s.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
                  color: "#C9A84C",
                  leavesTotal: s.leavesTotal || 12,
                  leavesTaken: s.leavesTaken || 0,
                }))
            : [],
        );
      } else if (user) {
        setStaffList([{
          _id: user._id, name: user.name, role: user.role,
          shift: user.shift || "Morning",
          shiftStart: user.shiftStart || "11:00",
          shiftEnd: user.shiftEnd || "18:00",
          initials: user.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
          color: "#C9A84C",
          leavesTotal: user.leavesTotal || 12,
          leavesTaken: user.leavesTaken || 0,
        }]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setLeaves([]); setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  /* ── Helpers ── */
  const convertTo12Hour = (time24) => {
    if (!time24) return { hour: "9", minute: "00", period: "AM" };
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    return {
      hour: String(hour % 12 || 12),
      minute: minutes || "00",
      period: hour >= 12 ? "PM" : "AM",
    };
  };

  const convertTo24Hour = (hour, minute, period) => {
    let h = parseInt(hour);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const getShiftTime = (_, shiftStart, shiftEnd) => ({
    start: shiftStart || "11:00",
    end:   shiftEnd   || "18:00",
  });

  /* ── Filtering & Pagination ── */
  const filtered = leaves.filter((l) => {
    const matchesSearch =
      l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (statusFilter === "all" || l.status === statusFilter);
  });

  const indexOfLastItem  = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems     = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages       = Math.ceil(filtered.length / itemsPerPage);

  /* ── Handlers ── */
  const handleAdd = () => {
    setCurrentItem(null);
    const shiftTimes = getShiftTime(user?.shift || "Morning", user?.shiftStart, user?.shiftEnd);
    setFormData({ staffId: user?._id || "", startDate: "", endDate: "",
      startTime: shiftTimes.start, endTime: shiftTimes.end, type: "sick", reason: "" });
    setStartTime12(convertTo12Hour(shiftTimes.start));
    setEndTime12(convertTo12Hour(shiftTimes.end));
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    const formatDate = (v) => {
      if (!v) return "";
      const d = new Date(v);
      return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    };
    const staff = staffList.find((s) => s._id === item.staffId);
    const shift = getShiftTime(staff?.shift, staff?.shiftStart, staff?.shiftEnd);
    const st = item.startTime || shift.start;
    const et = item.endTime   || shift.end;
    setFormData({ staffId: item.staffId, startDate: formatDate(item.startDate),
      endDate: formatDate(item.endDate), startTime: st, endTime: et,
      type: item.type, reason: item.reason });
    setStartTime12(convertTo12Hour(st));
    setEndTime12(convertTo12Hour(et));
    setShowForm(true);
  };

  const handleDeleteClick = (item) => { setCurrentItem(item); setShowDelete(true); };
  const handleApprove = async (item) => {
    try { await leaveAPI.approve(item._id); alert("Leave approved successfully"); loadData(); }
    catch (e) { console.error(e); alert("Failed to approve leave"); }
  };
  const handleRejectClick = (item) => { setCurrentItem(item); setRejectionReason(""); setShowReject(true); };
  const handleReject = async () => {
    try { await leaveAPI.reject(currentItem._id, rejectionReason); setShowReject(false); alert("Leave rejected"); loadData(); }
    catch (e) { console.error(e); alert("Failed to reject leave"); }
  };

  const handleSave = async () => {
    try {
      if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.reason) {
        alert("Please fill in all required fields"); return;
      }
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert("End date must be after start date"); return;
      }
      const dataToSend = {
        ...formData,
        startTime: convertTo24Hour(startTime12.hour, startTime12.minute, startTime12.period),
        endTime:   convertTo24Hour(endTime12.hour,   endTime12.minute,   endTime12.period),
      };
      if (currentItem) await leaveAPI.update(currentItem._id, dataToSend);
      else             await leaveAPI.create(dataToSend);
      setShowForm(false); loadData();
    } catch (e) { console.error(e); alert("Failed to save leave request"); }
  };

  const confirmDelete = async () => {
    try { await leaveAPI.delete(currentItem._id); setShowDelete(false); loadData(); }
    catch (e) { console.error(e); alert("Failed to delete leave request"); }
  };

  const getStats = () => ({
    pending:   leaves.filter((l) => l.status === "pending").length,
    approved:  leaves.filter((l) => l.status === "approved").length,
    rejected:  leaves.filter((l) => l.status === "rejected").length,
    totalDays: leaves.filter((l) => l.status === "approved").reduce((s, l) => s + l.days, 0),
  });

  const stats = getStats();

  const formatDateRange = (s, e) => {
    const start = new Date(s).toLocaleDateString("en-IN");
    const end   = new Date(e).toLocaleDateString("en-IN");
    return s === e ? start : `${start} - ${end}`;
  };

  /* ── RENDER ── */
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdEvent /> Leave Management
          </div>
          <div className="d-page-sub">Manage staff leave requests and approvals</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-gold" onClick={handleAdd}>
            <MdAdd /> Request Leave
          </button>
        </div>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <Col key={i} xs={12} sm={6} xl={3}>
                <div className="d-stat-card">
                  <div className="d-stat-icon d-gold" style={{ width: "42px", height: "42px", fontSize: "1.1rem" }} />
                  <div><div className="d-stat-value" style={{ fontSize: "1.4rem" }}>...</div><div className="d-stat-label">Loading...</div></div>
                </div>
              </Col>
            ))
          : [
              { label: "Pending Requests", value: stats.pending,   icon: <MdAccessTime />, color: "d-gold"  },
              { label: "Approved",          value: stats.approved,  icon: <MdCheckCircle />, color: "d-green" },
              { label: "Rejected",          value: stats.rejected,  icon: <MdCancel />,      color: "d-red"   },
              { label: "Total Days Taken",  value: stats.totalDays, icon: <MdEvent />,       color: "d-blue"  },
            ].map((s, i) => (
              <Col key={i} xs={12} sm={6} xl={3}>
                <div className="d-stat-card">
                  <div className={`d-stat-icon ${s.color}`} style={{ width: "42px", height: "42px", fontSize: "1.1rem" }}>{s.icon}</div>
                  <div><div className="d-stat-value" style={{ fontSize: "1.4rem" }}>{s.value}</div><div className="d-stat-label">{s.label}</div></div>
                </div>
              </Col>
            ))}
      </Row>

      {/* Filters */}
      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <div className="d-navbar-search-box w-100">
            <MdSearch className="d-search-icon" />
            <input type="text" placeholder="Search by name, role, or reason..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </Col>
        <Col xs={12} md={6}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Staff Summary */}
      <h5 className="mt-4 mb-3">Staff Leave Summary</h5>
      <Row className="g-3 mb-5">
        {loading
          ? Array(6).fill(0).map((_, i) => (
              <Col key={i} xs={12} sm={6} md={4}><div className="d-card"><div className="d-flex justify-content-between align-items-center"><div>Loading...</div></div></div></Col>
            ))
          : staffList.map((staff) => (
              <Col key={staff._id} xs={12} sm={6} md={4}>
                <div className="d-card h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <div style={{ width: 48, height: 48, borderRadius: "var(--d-radius-md)", background: `${staff.color}15`, color: staff.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.1rem", flexShrink: 0 }}>
                        {staff.initials}
                      </div>
                      <div><h6 className="mb-0">{staff.name}</h6><div className="small text-muted">{staff.role}</div></div>
                    </div>
                  </div>
                  <div className="progress mb-2" style={{ height: "6px" }}>
                    <div className="progress-bar" style={{ width: `${(staff.leavesTaken / staff.leavesTotal) * 100}%`, backgroundColor: staff.leavesTaken >= staff.leavesTotal ? "#e74c3c" : "#C9A84C" }} />
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>{staff.leavesTaken} leaves taken</span><span>{staff.leavesTotal} total</span>
                  </div>
                  <div className="small text-center mt-2"><strong>{staff.leavesTotal - staff.leavesTaken}</strong> leaves remaining</div>
                </div>
              </Col>
            ))}
      </Row>

      {/* Table */}
      <div className="d-card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr><th>Staff</th><th>Role</th><th>Date Range</th><th>Days</th><th>Type</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan="8" className="text-center py-4">Loading...</td></tr>)
                : filtered.length === 0
                  ? <tr><td colSpan="8" className="text-center py-4 text-muted">No leave requests found</td></tr>
                  : currentItems.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: 32, height: 32, borderRadius: "var(--d-radius-md)", background: `${staffList.find((s) => s._id === item.staffId)?.color || "#C9A84C"}15`, color: staffList.find((s) => s._id === item.staffId)?.color || "#C9A84C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                              {staffList.find((s) => s._id === item.staffId)?.initials || item.staffName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span>{item.staffName}</span>
                          </div>
                        </td>
                        <td>{item.role}</td>
                        <td>{formatDateRange(item.startDate, item.endDate)}</td>
                        <td>{item.days} day{item.days !== 1 ? "s" : ""}</td>
                        <td><span className="d-chip d-chip-gray" style={{ fontSize: "0.7rem" }}>{item.type.toUpperCase()}</span></td>
                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.reason}</td>
                        <td><span className={`d-chip ${item.status === "approved" ? "d-chip-green" : item.status === "rejected" ? "d-chip-red" : "d-chip-gold"}`} style={{ fontSize: "0.7rem" }}>{item.status.toUpperCase()}</span></td>
                        <td>
                          <div className="d-flex gap-1">
                            {isAdmin && item.status === "pending" && (
                              <>
                                <button className="d-btn-outline" onClick={() => handleApprove(item)} style={{ padding: "6px", fontSize: "0.8rem" }}><MdCheckCircle /> Approve</button>
                                <button className="d-btn-outline text-danger" onClick={() => handleRejectClick(item)} style={{ padding: "6px", fontSize: "0.8rem" }}><MdCancel /> Reject</button>
                              </>
                            )}
                            {((!isAdmin && item.staffId === user._id && item.status === "pending") || isAdmin) && (
                              <button className="d-navbar-icon-btn" onClick={() => handleEdit(item)}><MdEdit /></button>
                            )}
                            {isAdmin && <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(item)}><MdDelete /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
          </div>
          <div className="d-flex gap-2">
            <button className="d-btn-outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Previous</button>
            <div className="d-flex align-items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={`d-btn-outline ${currentPage === n ? "d-btn-gold" : ""}`} onClick={() => setCurrentPage(n)} style={{ padding: "6px 12px", fontSize: "0.8rem", minWidth: "40px" }}>{n}</button>
              ))}
            </div>
            <button className="d-btn-outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "6px 12px", fontSize: "0.8rem" }}>Next</button>
          </div>
        </div>
      )}

      {/* Leave Request Form Modal */}
      <FormModal show={showForm} onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Leave Request" : "Request Leave"} onSubmit={handleSave}>

        {/* ── Staff chip ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: 'linear-gradient(135deg, var(--d-primary, #16302B) 0%, #1f4238 100%)',
          borderRadius: '14px', padding: '14px 18px', marginBottom: '4px',
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '10px', flexShrink: 0,
            background: 'rgba(201,168,76,0.18)', border: '2px solid rgba(201,168,76,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem',
            fontWeight: 700, color: 'var(--d-gold, #C9A84C)',
          }}>
            {(user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(201,168,76,0.7)', marginBottom: '2px' }}>Staff Member</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{user?.name || 'Current User'}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '20px', padding: '4px 10px', color: 'var(--d-gold, #C9A84C)' }}>
              {user?.role || 'staff'}
            </span>
          </div>
        </div>

        {/* ── Date range card ── */}
        <div style={{
          background: 'var(--d-bg, #f5f4f0)', border: '1px solid var(--d-border, #e2e0da)',
          borderRadius: '14px', padding: '16px 18px', marginTop: '12px',
        }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--d-gold, #C9A84C)', marginBottom: '12px' }}>
            📅 Leave Duration
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
            {/* Start Date */}
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--d-text-muted, #6b7280)', marginBottom: '6px' }}>From</div>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                style={{
                  width: '100%', border: '1.5px solid var(--d-border, #e2e0da)',
                  borderRadius: '10px', padding: '10px 12px', fontSize: '0.88rem',
                  fontWeight: 600, color: 'var(--d-primary, #16302B)',
                  background: '#fff', outline: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--d-gold, #C9A84C)'}
                onBlur={e => e.target.style.borderColor = 'var(--d-border, #e2e0da)'}
              />
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center', paddingTop: '20px' }}>
              <div style={{ fontSize: '1.2rem', color: 'var(--d-gold, #C9A84C)', fontWeight: 700 }}>→</div>
            </div>

            {/* End Date */}
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--d-text-muted, #6b7280)', marginBottom: '6px' }}>To</div>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                style={{
                  width: '100%', border: '1.5px solid var(--d-border, #e2e0da)',
                  borderRadius: '10px', padding: '10px 12px', fontSize: '0.88rem',
                  fontWeight: 600, color: 'var(--d-primary, #16302B)',
                  background: '#fff', outline: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--d-gold, #C9A84C)'}
                onBlur={e => e.target.style.borderColor = 'var(--d-border, #e2e0da)'}
              />
            </div>
          </div>

          {/* Duration pill — shows calculated days */}
          {formData.startDate && formData.endDate && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '20px', padding: '5px 14px',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--d-primary, #16302B)',
              }}>
                🗓 {Math.max(0, Math.round((new Date(formData.endDate) - new Date(formData.startDate)) / 86400000) + 1)} day{Math.max(0, Math.round((new Date(formData.endDate) - new Date(formData.startDate)) / 86400000) + 1) !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* ── Time pickers card ── */}
        <div style={{
          background: 'var(--d-bg, #f5f4f0)', border: '1px solid var(--d-border, #e2e0da)',
          borderRadius: '14px', padding: '16px 18px', marginTop: '10px',
        }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--d-gold, #C9A84C)', marginBottom: '14px' }}>
            🕐 Working Hours
          </div>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <TimePicker label="Start Time" value={startTime12} onChange={setStartTime12} />
            </Col>
            <Col xs={12} md={6}>
              <TimePicker label="End Time" value={endTime12} onChange={setEndTime12} />
            </Col>
          </Row>
        </div>

        {/* ── Leave type + reason ── */}
        <div style={{
          background: 'var(--d-bg, #f5f4f0)', border: '1px solid var(--d-border, #e2e0da)',
          borderRadius: '14px', padding: '16px 18px', marginTop: '10px',
        }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--d-gold, #C9A84C)', marginBottom: '14px' }}>
            📝 Details
          </div>

          <Form.Group style={{ marginBottom: '14px' }}>
            <Form.Label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--d-text-muted, #6b7280)', marginBottom: '6px' }}>
              Leave Type *
            </Form.Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[
                { value: 'sick',      label: '🤒 Sick',      },
                { value: 'vacation',  label: '🌴 Vacation',  },
                { value: 'personal',  label: '👤 Personal',  },
                { value: 'maternity', label: '🤱 Maternity', },
                { value: 'paternity', label: '👨 Paternity', },
                { value: 'other',     label: '📋 Other',     },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setFormData({ ...formData, type: opt.value })}
                  style={{
                    padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 700, transition: 'all .18s',
                    border: '1.5px solid',
                    borderColor: formData.type === opt.value ? 'var(--d-primary, #16302B)' : 'var(--d-border, #e2e0da)',
                    background:  formData.type === opt.value ? 'var(--d-primary, #16302B)' : '#fff',
                    color:       formData.type === opt.value ? 'var(--d-gold, #C9A84C)'    : 'var(--d-text-muted, #6b7280)',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </Form.Group>

          <Form.Group>
            <Form.Label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--d-text-muted, #6b7280)', marginBottom: '6px' }}>
              Reason *
            </Form.Label>
            <Form.Control as="textarea" rows={3} value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please provide a reason for this leave request"
              required
              style={{ borderRadius: '10px', fontSize: '0.88rem', resize: 'vertical', border: '1.5px solid var(--d-border, #e2e0da)' }}
              onFocus={e => e.target.style.borderColor = 'var(--d-gold, #C9A84C)'}
              onBlur={e => e.target.style.borderColor = 'var(--d-border, #e2e0da)'}
            />
          </Form.Group>
        </div>

      </FormModal>

      {/* Reject Modal */}
      <FormModal show={showReject} onHide={() => setShowReject(false)}
        title="Reject Leave Request" onSubmit={handleReject}>
        <Form.Group>
          <Form.Label className="small fw-bold">Rejection Reason *</Form.Label>
          <Form.Control as="textarea" rows={3} value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this leave request" required />
        </Form.Group>
      </FormModal>

      {/* Delete Modal */}
      <DeleteModal show={showDelete} onHide={() => setShowDelete(false)} onConfirm={confirmDelete}
        itemName={currentItem?.staffName ? `leave request for ${currentItem.staffName}` : "leave request"} />
    </>
  );
}
