import React, { useState, useEffect } from "react";

import { Row, Col, Form } from "react-bootstrap";

import {
  MdEvent,
  MdCheckCircle,
  MdCancel,
  MdSearch,
  MdEdit,
  MdDelete,
  MdAdd,
  MdAccessTime,
  MdPeople,
} from "react-icons/md";

import DeleteModal from "../../components/DeleteModal";

import FormModal from "../../components/FormModal";

import { leaveAPI, usersAPI } from "../../../api";

import { useAuth } from "../../../contexts/AuthContext";

export default function LeaveManagement() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'superadmin' || user?.role === 'manager';

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
    staffId: "",

    startDate: "",

    endDate: "",

    startTime: "",

    endTime: "",

    type: "sick",

    reason: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const isAdmin = user?.role === 'superadmin' || user?.role === 'manager';
      
      const requests = [leaveAPI.getAll()];
      
      // Only load staff list for admins
      if (isAdmin) {
        requests.push(usersAPI.getAll());
      }

      const responses = await Promise.all(requests);
      const leavesRes = responses[0];
      const staffRes = isAdmin ? responses[1] : null;

      console.log('Leaves response:', leavesRes.data);
      setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);

      if (isAdmin && staffRes) {
        setStaffList(
          Array.isArray(staffRes.data)
            ? staffRes.data

                .filter((staff) => staff.role !== "customer" && staff.role !== "superadmin")

                .map((staff) => ({
                  _id: staff._id,

                  name: staff.name,

                  role: staff.role,

                  initials: staff.name

                    .split(" ")

                    .map((n) => n[0])

                    .join("")

                    .toUpperCase(),

                  color: "#C9A84C",

                  leavesTotal: staff.leavesTotal || 12,

                  leavesTaken: staff.leavesTaken || 0,
                }))
            : [],
        );
      } else {
        // For non-admin users, just add themselves to staff list
        if (user) {
          setStaffList([{
            _id: user._id,
            name: user.name,
            role: user.role,
            initials: user.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
            color: "#C9A84C",
            leavesTotal: user.leavesTotal || 12,
            leavesTaken: user.leavesTaken || 0,
          }]);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);

      setLeaves([]);

      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = leaves.filter((l) => {
    const matchesSearch =
      l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || l.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleAdd = () => {
    setCurrentItem(null);

    setFormData({
      staffId: user?._id || "",

      startDate: "",

      endDate: "",

      startTime: "",

      endTime: "",

      type: "sick",

      reason: "",
    });

    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);

    setFormData({
      staffId: item.staffId,

      startDate: item.startDate,

      endDate: item.endDate,

      startTime: item.startTime || "",

      endTime: item.endTime || "",  

      type: item.type,

      reason: item.reason,
    });

    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);

    setShowDelete(true);
  };

  const handleApprove = async (item) => {
    try {
      await leaveAPI.approve(item._id);

      alert("Leave approved successfully");

      loadData();
    } catch (error) {
      console.error("Error approving leave:", error);

      alert("Failed to approve leave");
    }
  };

  const handleRejectClick = (item) => {
    setCurrentItem(item);

    setRejectionReason("");

    setShowReject(true);
  };

  const handleReject = async () => {
    try {
      await leaveAPI.reject(currentItem._id, rejectionReason);

      setShowReject(false);

      alert("Leave rejected");

      loadData();
    } catch (error) {
      console.error("Error rejecting leave:", error);

      alert("Failed to reject leave");
    }
  };

  const handleSave = async () => {
    try {
      if (
        !formData.staffId ||
        !formData.startDate ||
        !formData.endDate ||
        !formData.reason
      ) {
        alert("Please fill in all required fields");

        return;
      }

      const start = new Date(formData.startDate);

      const end = new Date(formData.endDate);

      if (end < start) {
        alert("End date must be after start date");

        return;
      }

      if (currentItem) {
        await leaveAPI.update(currentItem._id, formData);
      } else {
        await leaveAPI.create(formData);
      }

      setShowForm(false);

      loadData();
    } catch (error) {
      console.error("Error saving leave:", error);

      alert("Failed to save leave request");
    }
  };

  const confirmDelete = async () => {
    try {
      await leaveAPI.delete(currentItem._id);

      setShowDelete(false);

      loadData();
    } catch (error) {
      console.error("Error deleting leave:", error);

      alert("Failed to delete leave request");
    }
  };

  const getStats = () => {
    const pending = leaves.filter((l) => l.status === "pending").length;

    const approved = leaves.filter((l) => l.status === "approved").length;

    const rejected = leaves.filter((l) => l.status === "rejected").length;

    const totalDays = leaves

      .filter((l) => l.status === "approved")

      .reduce((sum, l) => sum + l.days, 0);

    return { pending, approved, rejected, totalDays };
  };

  const stats = getStats();

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString("en-IN");

    const end = new Date(endDate).toLocaleDateString("en-IN");

    if (startDate === endDate) return start;

    return `${start} - ${end}`;
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdEvent /> Leave Management
          </div>  

          <div className="d-page-sub">
            Manage staff leave requests and approvals
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="d-btn-gold" onClick={handleAdd}>
            <MdAdd /> Request Leave
          </button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {loading
          ? Array(4)
              .fill(0)

              .map((_, i) => (
                <Col key={i} xs={12} sm={6} xl={3}>
                  <div className="d-stat-card">
                    <div
                      className="d-stat-icon d-gold"
                      style={{
                        width: "42px",

                        height: "42px",

                        fontSize: "1.1rem",
                      }}
                    ></div>

                    <div>
                      <div
                        className="d-stat-value"
                        style={{ fontSize: "1.4rem" }}
                      >
                        ...
                      </div>

                      <div className="d-stat-label">Loading...</div>
                    </div>
                  </div>
                </Col>
              ))
          : [
              {
                label: "Pending Requests",

                value: stats.pending,

                icon: <MdAccessTime />,

                color: "d-gold",
              },

              {
                label: "Approved",

                value: stats.approved,

                icon: <MdCheckCircle />,

                color: "d-green",
              },

              {
                label: "Rejected",

                value: stats.rejected,

                icon: <MdCancel />,

                color: "d-red",
              },

              {
                label: "Total Days Taken",

                value: stats.totalDays,

                icon: <MdEvent />,

                color: "d-blue",
              },
            ].map((s, i) => (
              <Col key={i} xs={12} sm={6} xl={3}>
                <div className="d-stat-card">
                  <div
                    className={`d-stat-icon ${s.color}`}
                    style={{
                      width: "42px",

                      height: "42px",

                      fontSize: "1.1rem",
                    }}
                  >
                    {s.icon}
                  </div>

                  <div>
                    <div
                      className="d-stat-value"
                      style={{ fontSize: "1.4rem" }}
                    >
                      {s.value}
                    </div>

                    <div className="d-stat-label">{s.label}</div>
                  </div>
                </div>
              </Col>
            ))}
      </Row>

      <Row className="g-3 mb-4">
        <Col xs={12} md={6}>
          <div className="d-navbar-search-box w-100">
            <MdSearch className="d-search-icon" />

            <input
              type="text"
              placeholder="Search by name, role, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>

        <Col xs={12} md={6}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>

            <option value="pending">Pending</option>

            <option value="approved">Approved</option>

            <option value="rejected">Rejected</option>
          </Form.Select>
        </Col>
      </Row>

      <h5 className="mt-4 mb-3">Staff Leave Summary</h5>

      <Row className="g-3 mb-5">
        {loading
          ? Array(6)
              .fill(0)

              .map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4}>
                  <div className="d-card">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>Loading...</div>
                    </div>
                  </div>
                </Col>
              ))
          : staffList.map((staff) => (
              <Col key={staff._id} xs={12} sm={6} md={4}>
                <div className="d-card h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <div
                        style={{
                          width: 48,

                          height: 48,

                          borderRadius: "var(--d-radius-md)",

                          background: `${staff.color}15`,

                          color: staff.color,

                          display: "flex",

                          alignItems: "center",

                          justifyContent: "center",

                          fontWeight: 800,

                          fontSize: "1.1rem",

                          flexShrink: 0,
                        }}
                      >
                        {staff.initials}
                      </div>

                      <div>
                        <h6 className="mb-0">{staff.name}</h6>

                        <div className="small text-muted">{staff.role}</div>
                      </div>
                    </div>
                  </div>

                  <div className="progress mb-2" style={{ height: "6px" }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(staff.leavesTaken / staff.leavesTotal) * 100}%`,

                        backgroundColor:
                          staff.leavesTaken >= staff.leavesTotal
                            ? "#e74c3c"
                            : "#C9A84C",
                      }}
                    />
                  </div>

                  <div className="d-flex justify-content-between small text-muted">
                    <span>{staff.leavesTaken} leaves taken</span>

                    <span>{staff.leavesTotal} total</span>
                  </div>

                  <div className="small text-center mt-2">
                    <strong>{staff.leavesTotal - staff.leavesTaken}</strong>{" "}
                    leaves remaining
                  </div>
                </div>
              </Col>
            ))}
      </Row>

      <div className="d-card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>

                <th>Date Range</th>

                <th>Days</th>

                <th>Type</th>

                <th>Reason</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array(5)
                  .fill(0)

                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div
                          style={{
                            width: 32,

                            height: 32,

                            borderRadius: "var(--d-radius-md)",

                            background: `${staffList.find((s) => s._id === item.staffId)?.color || "#C9A84C"}15`,

                            color:
                              staffList.find((s) => s._id === item.staffId)
                                ?.color || "#C9A84C",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            fontWeight: 700,

                            fontSize: "0.8rem",
                          }}
                        >
                          {staffList.find((s) => s._id === item.staffId)
                            ?.initials ||
                            item.staffName

                              .split(" ")

                              .map((n) => n[0])

                              .join("")}
                        </div>

                        <span>{item.staffName}</span>
                      </div>
                    </td>

                    <td>{item.role}</td>

                    <td>{formatDateRange(item.startDate, item.endDate)}</td>

                    <td>
                      {item.days} day{item.days !== 1 ? "s" : ""}
                    </td>

                    <td>
                      <span
                        className="d-chip d-chip-gray"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </td>

                    <td
                      style={{
                        maxWidth: "200px",

                        overflow: "hidden",

                        textOverflow: "ellipsis",

                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.reason}
                    </td>

                    <td>
                      <span
                        className={`d-chip ${item.status === "approved" ? "d-chip-green" : item.status === "rejected" ? "d-chip-red" : "d-chip-gold"}`}
                        style={{ fontSize: "0.7rem" }}
                      >
                        {item.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div className="d-flex gap-1">
                        {isAdmin && item.status === "pending" && (
                          <>
                            <button
                              className="d-btn-outline"
                              onClick={() => handleApprove(item)}
                              style={{ padding: "6px", fontSize: "0.8rem" }}
                            >
                              <MdCheckCircle /> Approve
                            </button>

                            <button
                              className="d-btn-outline text-danger"
                              onClick={() => handleRejectClick(item)}
                              style={{ padding: "6px", fontSize: "0.8rem" }}
                            >
                              <MdCancel /> Reject
                            </button>
                          </>
                        )}

                        {/* Non-admin users can only edit their own pending leaves */}
                        {(!isAdmin && item.staffId === user._id && item.status === "pending") || isAdmin ? (
                          <button
                            className="d-navbar-icon-btn"
                            onClick={() => handleEdit(item)}
                          >
                            <MdEdit />
                          </button>
                        ) : null}

                        {/* Only admin can delete */}
                        {isAdmin && (
                          <button
                            className="d-navbar-icon-btn text-danger"
                            onClick={() => handleDeleteClick(item)}
                          >
                            <MdDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filtered.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filtered.length)} of {filtered.length} entries
          </div>
          <div className="d-flex gap-2">
            <button
              className="d-btn-outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            >
              Previous
            </button>
            <div className="d-flex align-items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`d-btn-outline ${currentPage === pageNumber ? "d-btn-gold" : ""}`}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{ padding: "6px 12px", fontSize: "0.8rem", minWidth: "40px" }}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
            <button
              className="d-btn-outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Leave Request" : "Request Leave"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Staff Member *</Form.Label>

              <Form.Control
                type="text"
                value={user?.name || "Current User"}
                disabled
                style={{ backgroundColor: "#f8f9fa" }}
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Start Date *</Form.Label>

              <Form.Control
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">End Date *</Form.Label>

              <Form.Control
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Start Time</Form.Label>

              <Form.Control
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">End Time</Form.Label>

              <Form.Control
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Leave Type *</Form.Label>

              <Form.Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="sick">Sick Leave</option>

                <option value="vacation">Vacation</option>

                <option value="personal">Personal</option>

                <option value="maternity">Maternity</option>

                <option value="paternity">Paternity</option>

                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Reason *</Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Please provide a reason for this leave request"
                required
              />
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      {/* Reject Modal */}

      <FormModal
        show={showReject}
        onHide={() => setShowReject(false)}
        title="Reject Leave Request"
        onSubmit={handleReject}
      >
        <Form.Group>
          <Form.Label className="small fw-bold">Rejection Reason *</Form.Label>

          <Form.Control
            as="textarea"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a reason for rejecting this leave request"
            required
          />
        </Form.Group>
      </FormModal>
 
      {/* Delete Modal */}

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={
          currentItem?.staffName
            ? `leave request for ${currentItem.staffName}`
            : "leave request"
        }
      />
    </>
  );
}
