import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdEvent, MdCheckCircle, MdCancel, MdSearch,
  MdEdit, MdDelete, MdAdd, MdAccessTime, MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { leaveAPI, staffAPI } from '../../../api';

// Mock data for demo
const MOCK_LEAVES = [
  { _id: '1', staffId: '1', staffName: 'Rajesh Kumar', role: 'Head Chef', startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], type: 'vacation', reason: 'Going on vacation with family', status: 'pending', days: 3 },
  { _id: '2', staffId: '2', staffName: 'Priya Sharma', role: 'Waiter', startDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], endDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], type: 'sick', reason: 'Feeling unwell', status: 'approved', days: 1 },
  { _id: '3', staffId: '3', staffName: 'Sam D\'Souza', role: 'Bartender', startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], type: 'personal', reason: 'Personal work', status: 'pending', days: 4 },
  { _id: '4', staffId: '5', staffName: 'Dev Malhotra', role: 'Sous Chef', startDate: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], endDate: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0], type: 'sick', reason: 'High fever', status: 'rejected', rejectionReason: 'Staff shortage, please reschedule', days: 2 },
];

const MOCK_STAFF = [
  { _id: '1', name: 'Rajesh Kumar', role: 'Head Chef', initials: 'RK', color: '#C9A84C', leavesTotal: 15, leavesTaken: 2 },
  { _id: '2', name: 'Priya Sharma', role: 'Waiter', initials: 'PS', color: '#3498db', leavesTotal: 12, leavesTaken: 5 },
  { _id: '3', name: 'Sam D\'Souza', role: 'Bartender', initials: 'SD', color: '#2ecc71', leavesTotal: 12, leavesTaken: 8 },
  { _id: '4', name: 'Anita Verma', role: 'Cashier', initials: 'AV', color: '#9b59b6', leavesTotal: 12, leavesTaken: 3 },
  { _id: '5', name: 'Dev Malhotra', role: 'Sous Chef', initials: 'DM', color: '#e74c3c', leavesTotal: 15, leavesTaken: 1 },
  { _id: '6', name: 'Leena Nair', role: 'Manager', initials: 'LN', color: '#16302B', leavesTotal: 20, leavesTaken: 0 },
];

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState({ staffId: '', startDate: '', endDate: '', type: 'sick', reason: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      // In real app, use API calls
      // const [leavesRes, staffRes] = await Promise.all([
      //   leaveAPI.getAll(),
      //   staffAPI.getAll()
      // ]);
      // setLeaves(Array.isArray(leavesRes.data) ? leavesRes.data : []);
      // setStaffList(Array.isArray(staffRes.data) ? staffRes.data : []);

      // For demo, use mock data
      setLeaves(MOCK_LEAVES);
      setStaffList(MOCK_STAFF);
    } catch (error) {
      console.error('Error loading data:', error);
      setLeaves(MOCK_LEAVES);
      setStaffList(MOCK_STAFF);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = leaves.filter(l => {
    const matchesSearch = l.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ staffId: '', startDate: '', endDate: '', type: 'sick', reason: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      staffId: item.staffId,
      startDate: item.startDate,
      endDate: item.endDate,
      type: item.type,
      reason: item.reason
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleApprove = async (item) => {
    try {
      // await leaveAPI.approve(item._id);
      setLeaves(leaves.map(l => l._id === item._id ? { ...l, status: 'approved' } : l));
      alert('Leave approved successfully');
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Failed to approve leave');
    }
  };
  
  const handleRejectClick = (item) => {
    setCurrentItem(item);
    setRejectionReason('');
    setShowReject(true);
  };

  const handleReject = async () => {
    try {
      // await leaveAPI.reject(currentItem._id, rejectionReason);
      setLeaves(leaves.map(l => l._id === currentItem._id ? { ...l, status: 'rejected', rejectionReason } : l));
      setShowReject(false);
      alert('Leave rejected');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      alert('Failed to reject leave');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.reason) {
        alert('Please fill in all required fields');
        return;
      }

      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert('End date must be after start date');
        return;
      }

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (currentItem) {
        // Update existing leave
        // const response = await leaveAPI.update(currentItem._id, formData);
        const staff = staffList.find(s => s._id === formData.staffId);
        setLeaves(leaves.map(l => l._id === currentItem._id ? { ...currentItem, ...formData, staffName: staff?.name || currentItem.staffName, role: staff?.role || currentItem.role, days } : l));
      } else {
        // Create new leave
        // const response = await leaveAPI.create(formData);
        const staff = staffList.find(s => s._id === formData.staffId);
        const newLeave = {
          _id: Date.now().toString(),
          ...formData,
          staffName: staff?.name || '',
          role: staff?.role || '',
          status: 'pending',
          days
        };
        setLeaves([newLeave, ...leaves]);
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error saving leave:', error);
      alert('Failed to save leave request');
    }
  };

  const confirmDelete = async () => {
    try {
      // await leaveAPI.delete(currentItem._id);
      setLeaves(leaves.filter(l => l._id !== currentItem._id));
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting leave:', error);
      alert('Failed to delete leave request');
    }
  };

  const getStats = () => {
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;
    const totalDays = leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0);

    return { pending, approved, rejected, totalDays };
  };

  const stats = getStats();

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-IN');
    const end = new Date(endDate).toLocaleDateString('en-IN');
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
          <div className="d-page-sub">Manage staff leave requests and approvals</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Request Leave</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} xl={3}>
              <div className="d-stat-card">
                <div className="d-stat-icon d-gold" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}></div>
                <div>
                  <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>...</div>
                  <div className="d-stat-label">Loading...</div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          [
            { label: 'Pending Requests', value: stats.pending, icon: <MdAccessTime />, color: 'd-gold' },
            { label: 'Approved', value: stats.approved, icon: <MdCheckCircle />, color: 'd-green' },
            { label: 'Rejected', value: stats.rejected, icon: <MdCancel />, color: 'd-red' },
            { label: 'Total Days Taken', value: stats.totalDays, icon: <MdEvent />, color: 'd-blue' }
          ].map((s, i) => (
            <Col key={i} xs={12} sm={6} xl={3}>
              <div className="d-stat-card">
                <div className={`d-stat-icon ${s.color}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                  {s.icon}
                </div>
                <div>
                  <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                  <div className="d-stat-label">{s.label}</div>
                </div>
              </div>
            </Col>
          ))
        )}
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
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} md={4}>
              <div className="d-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>Loading...</div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          staffList.map((staff) => (
            <Col key={staff._id} xs={12} sm={6} md={4}>
              <div className="d-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex gap-3 align-items-center">
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--d-radius-md)',
                      background: `${staff.color}15`, color: staff.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
                    }}>{staff.initials}</div> 
                    <div>
                      <h6 className="mb-0">{staff.name}</h6>
                      <div className="small text-muted">{staff.role}</div>
                    </div>
                  </div>
                </div>
                <div className="progress mb-2" style={{ height: '6px' }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${(staff.leavesTaken / staff.leavesTotal) * 100}%`,
                      backgroundColor: staff.leavesTaken >= staff.leavesTotal ? '#e74c3c' : '#C9A84C'
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>{staff.leavesTaken} leaves taken</span>
                  <span>{staff.leavesTotal} total</span>
                </div>
                <div className="small text-center mt-2">
                  <strong>{staff.leavesTotal - staff.leavesTaken}</strong> leaves remaining
                </div>
              </div>
            </Col>
          ))
        )}
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
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="8" className="text-center py-4">Loading...</td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No leave requests found</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--d-radius-md)',
                          background: `${staffList.find(s => s._id === item.staffId)?.color || '#C9A84C'}15`,
                          color: staffList.find(s => s._id === item.staffId)?.color || '#C9A84C',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {staffList.find(s => s._id === item.staffId)?.initials || item.staffName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{item.staffName}</span>
                      </div>
                    </td>
                    <td>{item.role}</td>
                    <td>{formatDateRange(item.startDate, item.endDate)}</td>
                    <td>{item.days} day{item.days !== 1 ? 's' : ''}</td>
                    <td>
                      <span className="d-chip d-chip-gray" style={{ fontSize: '0.7rem' }}>
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.reason}
                    </td>
                    <td>
                      <span className={`d-chip ${item.status === 'approved' ? 'd-chip-green' : item.status === 'rejected' ? 'd-chip-red' : 'd-chip-gold'}`} style={{ fontSize: '0.7rem' }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {item.status === 'pending' && (
                          <>
                            <button className="d-btn-outline" onClick={() => handleApprove(item)} style={{ padding: '6px', fontSize: '0.8rem' }}>
                              <MdCheckCircle /> Approve
                            </button>
                            <button className="d-btn-outline text-danger" onClick={() => handleRejectClick(item)} style={{ padding: '6px', fontSize: '0.8rem' }}>
                              <MdCancel /> Reject
                            </button>
                          </>
                        )}
                        <button className="d-navbar-icon-btn" onClick={() => handleEdit(item)}>
                          <MdEdit />
                        </button>
                        <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(item)}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <Form.Select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                required
              >
                <option value="">Select Staff</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name} - {staff.role}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Leave Type *</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
        itemName={currentItem?.staffName ? `leave request for ${currentItem.staffName}` : 'leave request'}
      />
    </>
  );
}
