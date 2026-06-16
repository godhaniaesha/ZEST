import React, { useState, useEffect } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import {
  MdAdd, MdPhone, MdEmail, MdSearch,
  MdBadge, MdAccessTime, MdFiberManualRecord,
  MdEdit, MdDelete, MdVisibility, MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff, addStaff, updateStaff, deleteStaff } from '../../../store/slices/staffSlice';
import { useAuth } from '../../../contexts/AuthContext';

// Random colors for staff
const COLORS = ['#C9A84C', '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#16302B', '#1abc9c', '#f39c12'];

export default function Staff() {
  const dispatch = useDispatch();
  const { list: staffList, loading } = useSelector((state) => state.staff);
  const { user } = useAuth();
  const userRole = user?.role || 'staff';
  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const filtered = staffList.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.role?.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  const handleAdd = () => {
    if (!canAddEditDelete) return;
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    if (!canAddEditDelete) return;
    setCurrentItem(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    if (!canAddEditDelete) return;
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleViewClick = (item) => {
    console.log("items", item );
    setCurrentItem(item);
    setShowView(true);
  };

  const handleSave = async (formData) => {
    try {
      // Validation
      if (!formData.name || !formData.role) {
        alert('Please fill in all required fields');
        return;
      }

      const initials = formData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();

      // Pick random color if not set
      const color = currentItem?.color || COLORS[Math.floor(Math.random() * COLORS.length)];

      const dataToSave = {
        ...formData,
        initials,
        color
      };

      if (currentItem) {
        await dispatch(updateStaff({ id: currentItem._id, staffData: dataToSave })).unwrap();
      } else {
        await dispatch(addStaff(dataToSave)).unwrap();
      }

      setShowForm(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Failed to save staff member');
    }
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteStaff(currentItem._id)).unwrap();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  // Form fields for FormModal
  const formFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, col: 12 },
    { name: 'email', label: 'Email Address', type: 'email', col: 6 },
    { name: 'phone', label: 'Phone Number', type: 'text', col: 6 },
    { name: 'address', label: 'Address', type: 'text', col: 12 },
    { name: 'role', label: 'Role', type: 'select', required: true, col: 6, options: [
      { label: 'Head Chef', value: 'Head Chef' },
      { label: 'Sous Chef', value: 'Sous Chef' },
      { label: 'Chef', value: 'Chef' },
      { label: 'Waiter', value: 'Waiter' },
      { label: 'Bartender', value: 'Bartender' },
      { label: 'Cashier', value: 'Cashier' },
      { label: 'Manager', value: 'Manager' },
      { label: 'Cleaner', value: 'Cleaner' }
    ] },
    { name: 'shift', label: 'Shift', type: 'select', required: true, col: 6, options: [
      { label: 'Morning', value: 'Morning' },
      { label: 'Evening', value: 'Evening' },
      { label: 'Both', value: 'Both' }
    ] },
    { name: 'salary', label: 'Salary (₹)', type: 'number', col: 4 },
    { name: 'leavesTaken', label: 'Leaves Taken', type: 'number', col: 4, min: 0 },
    { name: 'leavesTotal', label: 'Total Leaves', type: 'number', col: 4, min: 0 },
    { name: 'joiningDate', label: 'Joining Date', type: 'date', col: 6 },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 6, options: [
      { label: 'On Duty', value: 'On Duty' },
      { label: 'Off Duty', value: 'Off Duty' },
      { label: 'On Leave', value: 'On Leave' }
    ] }
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdPeople /> Staff & Personnel
          </div>
          <div className="d-page-sub">Manage your service team and schedules</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile">Shift Roster</button>
          {canAddEditDelete && <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Member</button>}
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
            { label: 'Total Staff', value: staffList.length, icon: <MdBadge />, color: 'd-gold' },
            { label: 'On Duty', value: staffList.filter(s => s.status === 'On Duty').length, icon: <MdFiberManualRecord />, color: 'd-green' },
            { label: 'Morning Shift', value: staffList.filter(s => s.shift === 'Morning').length, icon: <MdAccessTime />, color: 'd-blue' },
            { label: 'Evening Shift', value: staffList.filter(s => s.shift === 'Evening').length, icon: <MdAccessTime />, color: 'd-blue' }
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

      <div className="d-navbar-search-box mb-4 w-100" style={{ maxWidth: '400px', margin: '0' }}>
        <MdSearch className="d-search-icon" />
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Row className="g-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} xl={4}>
              <div className="d-card h-100" style={{ borderRadius: '16px', overflow: 'hidden', border: 'none' }}>
                {/* Loading Skeleton Header */}
                <div style={{ background: 'var(--d-bg)', padding: '24px', borderBottom: '1px solid var(--d-border)' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-4 align-items-center">
                      <div style={{ width: 70, height: 70, borderRadius: '18px', background: 'var(--d-border)', opacity: 0.5 }}></div>
                      <div>
                        <div style={{ width: '120px', height: '20px', background: 'var(--d-border)', borderRadius: '4px', marginBottom: '8px', opacity: 0.5 }}></div>
                        <div style={{ width: '80px', height: '16px', background: 'var(--d-border)', borderRadius: '4px', opacity: 0.5 }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Loading Skeleton Body */}
                <div style={{ padding: '20px' }}>
                  <div className="d-flex gap-3 mb-4">
                    <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px', opacity: 0.5 }}></div>
                    <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px', opacity: 0.5 }}></div>
                  </div>
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div style={{ width: '60px', height: '12px', background: 'var(--d-border)', borderRadius: '4px', marginBottom: '6px', opacity: 0.5 }}></div>
                      <div style={{ width: '80px', height: '24px', background: 'var(--d-border)', borderRadius: '4px', opacity: 0.5 }}></div>
                    </div>
                    <div className="col-6">
                      <div style={{ width: '60px', height: '12px', background: 'var(--d-border)', borderRadius: '4px', marginBottom: '6px', opacity: 0.5 }}></div>
                      <div style={{ width: '80px', height: '24px', background: 'var(--d-border)', borderRadius: '4px', opacity: 0.5 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          filtered.map((s) => (
            <Col key={s._id} xs={12} sm={6} xl={4}>
              <div className="d-card h-100" style={{ borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                {/* Card Header with Avatar and Status */}
                <div style={{ background: `linear-gradient(135deg, ${s.color || '#C9A84C'}20 0%, ${s.color || '#C9A84C'}05 100%)`, padding: '24px', borderBottom: '1px solid var(--d-border)' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="d-flex gap-4 align-items-center">
                      <div style={{
                        width: 70, height: 70, borderRadius: '18px',
                        background: `${s.color || '#C9A84C'}25`, color: s.color || '#C9A84C',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
                        boxShadow: `0 4px 12px ${s.color || '#C9A84C'}15`
                      }}>{s.initials}</div>
                      <div>
                        <h5 className="d-section-title mb-1" style={{ fontSize: '1.15rem', margin: 0 }}>{s.name}</h5>
                        <div className="d-page-sub" style={{ fontSize: '0.95rem', margin: 0 }}>{s.role}</div>
                      </div>
                    </div>
                    <div className="d-flex gap-1">
                      <button className="d-navbar-icon-btn" style={{ width: '38px', height: '38px', borderRadius: '10px' }} onClick={() => handleViewClick(s)}><MdVisibility /></button>
                      {canAddEditDelete && (
                        <>
                          <button className="d-navbar-icon-btn" style={{ width: '38px', height: '38px', borderRadius: '10px' }} onClick={() => handleEdit(s)}><MdEdit /></button>
                          <button className="d-navbar-icon-btn text-danger" style={{ width: '38px', height: '38px', borderRadius: '10px' }} onClick={() => handleDeleteClick(s)}><MdDelete /></button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px' }}>
                  {/* Shift and Status */}
                  <div className="d-flex gap-3 mb-4">
                    <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px' }}>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Shift</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.shift}</div>
                    </div>
                    <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px' }}>
                      <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Status</div>
                      <span className={`d-chip ${s.status === 'On Duty' ? 'd-chip-green' : s.status === 'On Leave' ? 'd-chip-gold' : 'd-chip-gray'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                        {s.status}
                      </span>
                    </div>
                  </div>

                  {/* Salary and Leaves */}
                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>Salary</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--d-primary)' }}>₹{s.salary || '-'}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>Leaves</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{s.leavesTaken || 0}<span style={{ fontSize: '0.9rem', color: 'var(--d-text-muted)', fontWeight: 400 }}>/{s.leavesTotal || 12}</span></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    {s.phone && (
                      <a
                        href={`tel:${s.phone}`}
                        className="d-btn-outline flex-grow-1 text-decoration-none"
                        style={{ padding: '10px 16px', fontSize: '0.9rem', borderRadius: '10px', borderColor: 'var(--d-border)', textAlign: 'center' }}
                      >
                        <MdPhone className="me-2" /> Call
                      </a>
                    )}
                    {s.email && (
                      <a
                        href={`mailto:${s.email}`}
                        className="d-btn-outline flex-grow-1 text-decoration-none"
                        style={{ padding: '10px 16px', fontSize: '0.9rem', borderRadius: '10px', borderColor: 'var(--d-border)', textAlign: 'center' }}
                      >
                        <MdEmail className="me-2" /> Mail
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          ))
        )}
      </Row>

      {/* View Modal */}
      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Staff Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (
            <Row className="g-4">
              <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                <div style={{
                  width: 100, height: 100, borderRadius: 'var(--d-radius-md)',
                  background: `${currentItem.color || '#C9A84C'}15`, color: currentItem.color || '#C9A84C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '2.5rem', flexShrink: 0
                }}>{currentItem.initials}</div>
                <h4 className="mt-3 mb-0">{currentItem.name}</h4>
                <p className="text-muted mb-0">{currentItem.role}</p>
                <span className={`d-chip mt-2 ${currentItem.status === 'On Duty' ? 'd-chip-green' :
                    currentItem.status === 'On Leave' ? 'd-chip-gold' :
                      'd-chip-gray'
                  }`}>
                  {currentItem.status}
                </span>
              </Col>
              <Col xs={12} md={8}>
                <Row className="g-3">
                  {currentItem.email && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Email</span>
                        <span className="fw-medium">{currentItem.email}</span>
                      </div>
                    </Col>
                  )}
                  {currentItem.phone && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Phone</span>
                        <span className="fw-medium">{currentItem.phone}</span>
                      </div>
                    </Col>
                  )}
                  {currentItem.address && (
                    <Col xs={12}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Address</span>
                        <span className="fw-medium">{currentItem.address}</span>
                      </div>
                    </Col>
                  )}
                  <Col xs={12} sm={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Shift</span>
                      <span className="fw-medium">{currentItem.shift}</span>
                    </div>
                  </Col>
                  {currentItem.salary && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Salary</span>
                        <span className="fw-medium">₹{currentItem.salary}</span>
                      </div>
                    </Col>
                  )}
                  <Col xs={12} sm={6}>
                    <div className="d-flex flex-column">
                      <span className="text-muted small">Leaves Taken</span>
                      <span className="fw-medium">{currentItem.leavesTaken || 0}/{currentItem.leavesTotal || 12}</span>
                    </div>
                  </Col>
                  {currentItem.joiningDate && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Joining Date</span>
                        <span className="fw-medium">{new Date(currentItem.joiningDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </Col>
                  )}
                  {currentItem.createdAt && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Created At</span>
                        <span className="fw-medium">{new Date(currentItem.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                    </Col>
                  )}
                  {currentItem.updatedAt && (
                    <Col xs={12} sm={6}>
                      <div className="d-flex flex-column">
                        <span className="text-muted small">Updated At</span>
                        <span className="fw-medium">{new Date(currentItem.updatedAt).toLocaleString('en-IN')}</span>
                      </div>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="d-btn-outline" onClick={() => setShowView(false)}>Close</button>
          {canAddEditDelete && (
            <button className="d-btn-gold" onClick={() => {
              setShowView(false);
              handleEdit(currentItem);
            }}>
              <MdEdit /> Edit
            </button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modals */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Staff Member" : "Add New Staff Member"}
        initialData={currentItem || { name: '', role: '', shift: 'Morning', status: 'On Duty', leavesTotal: 12, leavesTaken: 0 }}
        onSave={handleSave}
        fields={formFields}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
