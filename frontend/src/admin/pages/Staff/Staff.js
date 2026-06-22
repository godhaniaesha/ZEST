import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import {
  MdAdd, MdSearch,
  MdBadge, MdAccessTime, MdFiberManualRecord,
  MdEdit, MdDelete, MdVisibility, MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStaffUsers,
  addStaffUser,
  updateStaffUser,
  deleteStaffUser
} from '../../../store/slices/usersSlice';
import { useAuth } from '../../../contexts/AuthContext';

const COLORS = ['#C9A84C', '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#16302B', '#1abc9c', '#f39c12'];

const STAFF_ROLE_OPTIONS = [
  { label: 'Super Admin', value: 'superadmin' },
  { label: 'Manager', value: 'manager' },
  { label: 'Chef', value: 'chef' },
  { label: 'Waiter', value: 'waiter' },
  { label: 'Cashier', value: 'cashier' },
];
  
const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getStaffColor = (member, index) =>
  COLORS[(member?.name?.length || index) % COLORS.length];

const formatRole = (role = '') =>
  role.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());

const formatSalary = (salary) => {
  if (salary == null || salary === '') return '-';
  const amount = Number(salary);
  const formatted = Number.isNaN(amount) ? salary : amount.toLocaleString('en-IN');
  return `₹${formatted}`;
};

const buildStaffPayload = (formData) => {
  const { confirmPassword, ...data } = formData;

  if (data.salary === '' || data.salary == null || Number.isNaN(data.salary)) {
    delete data.salary;
  } else {
    data.salary = String(data.salary);
  } 

  if (data.leavesTaken === '' || data.leavesTaken == null || Number.isNaN(data.leavesTaken)) {
    data.leavesTaken = 0;
  }
  if (data.leavesTotal === '' || data.leavesTotal == null || Number.isNaN(data.leavesTotal)) {
    data.leavesTotal = 12;
  }

  if (!data.password) {
    delete data.password;
  }

  return data;
};

export default function Staff() {
  const dispatch = useDispatch();
  const { staffList, staffLoading } = useSelector((state) => state.users);
  const { user } = useAuth();
  const userRole = user?.role || 'staff';
  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showView, setShowView] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const filtered = useMemo(() =>
    staffList
      .filter(s => s.role !== 'customer')
      .filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [staffList, searchTerm]
  );

  const staffMembers = useMemo(
    () => staffList.filter(s => s.role !== 'customer'),
    [staffList]
  );

  useEffect(() => {
    dispatch(fetchStaffUsers());
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
    setCurrentItem(item);
    setShowView(true);
  };

  const handleSave = async (formData) => {
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a valid name');
      return;
    }

    // Email validation
    if (!formData.email || !formData.email.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email format (e.g., user@example.com)');
      return;
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
    }

    // Role validation
    if (!formData.role) {
      alert('Please select a role');
      return;
    }

    // Status validation
    if (!formData.status) {
      alert('Please select a status');
      return;
    }

    // Shift validation
    if (!formData.shift) {
      alert('Please select a shift');
      return;
    }

    // Salary validation (if provided)
    if (formData.salary && formData.salary < 0) {
      alert('Salary cannot be negative');
      return;
    }

    // Leaves validation
    if (formData.leavesTaken < 0) {
      alert('Leaves taken cannot be negative');
      return;
    }

    if (formData.leavesTotal < 0) {
      alert('Total leaves cannot be negative');
      return;
    }

    if (formData.leavesTaken > formData.leavesTotal) {
      alert('Leaves taken cannot exceed total leaves');
      return;
    }

    // Password validation for new users
    if (!currentItem) {
      if (!formData.password || formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    // Password validation for existing users (if changing password)
    if (currentItem && formData.password && formData.password.trim()) {
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
    }

    const payload = buildStaffPayload(formData);

    // Clean phone number if provided
    if (formData.phone) {
      payload.phone = formData.phone.replace(/\D/g, '');
    }

    try {
      if (currentItem) {
        await dispatch(updateStaffUser({ id: currentItem._id, userData: payload })).unwrap();
      } else {
        await dispatch(addStaffUser({ ...payload, password: formData.password })).unwrap();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(error?.message || 'Failed to save staff member');
    }
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteStaffUser(currentItem._id)).unwrap();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

  const formFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, col: 12, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, col: 6, placeholder: 'Enter email address' },
    { name: 'phone', label: 'Phone Number', type: 'text', col: 6, placeholder: 'Enter phone number' },
    { name: 'address', label: 'Address', type: 'text', col: 12, placeholder: 'Enter address' },
    {
      name: 'role', label: 'Role', type: 'select', required: true, col: 6, placeholder: 'Select role',
      options: STAFF_ROLE_OPTIONS
    },
    {
      name: 'status', label: 'Status', type: 'select', required: true, col: 6, placeholder: 'Select status', options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'On Duty', value: 'On Duty' }
      ]
    },
    {
      name: 'shift', label: 'Shift', type: 'select', required: true, col: 6, placeholder: 'Select shift', options: [
        { label: 'Morning', value: 'Morning' },
        { label: 'Evening', value: 'Evening' },
        { label: 'Both', value: 'Both' }
      ]
    },
    { name: 'salary', label: 'Salary (₹)', type: 'number', col: 4, placeholder: 'Enter salary' },
    { name: 'leavesTaken', label: 'Leaves Taken', type: 'number', col: 4, min: 0, placeholder: '0' },
    { name: 'leavesTotal', label: 'Total Leaves', type: 'number', col: 4, min: 0, placeholder: '12' },
    { name: 'joiningDate', label: 'Joining Date', type: 'date', col: 6, placeholder: 'Select joining date' },
    {
      name: 'password',
      label: currentItem ? 'Password (leave empty to keep current)' : 'Password',
      type: 'password',
      required: !currentItem,
      col: 6,
      placeholder: currentItem ? 'Leave empty to keep current' : 'Enter password'
    },
    ...(!currentItem ? [{ name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, col: 6, placeholder: 'Confirm password' }] : []),
  ];

  const statCards = [
    { label: 'Total Staff', value: staffMembers.length, icon: <MdBadge />, color: 'd-gold' },
    { label: 'On Duty', value: staffMembers.filter(s => s.status === 'On Duty').length, icon: <MdFiberManualRecord />, color: 'd-green' },
    { label: 'Morning Shift', value: staffMembers.filter(s => s.shift === 'Morning').length, icon: <MdAccessTime />, color: 'd-blue' },
    { label: 'Evening Shift', value: staffMembers.filter(s => s.shift === 'Evening').length, icon: <MdAccessTime />, color: 'd-blue' }
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
          {canAddEditDelete && <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Member</button>}
        </div>
      </div>

      <Row className="g-3 mb-4">
        {staffLoading ? (
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
          statCards.map((s, i) => (
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
        {staffLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} xl={4}>
              <div className="d-card h-100" style={{ borderRadius: '16px', overflow: 'hidden', border: 'none' }}>
                <div style={{ background: 'var(--d-bg)', padding: '24px', borderBottom: '1px solid var(--d-border)' }}>
                  <div className="d-flex gap-4 align-items-center">
                    <div style={{ width: 70, height: 70, borderRadius: '18px', background: 'var(--d-border)', opacity: 0.5 }}></div>
                    <div>
                      <div style={{ width: '120px', height: '20px', background: 'var(--d-border)', borderRadius: '4px', marginBottom: '8px', opacity: 0.5 }}></div>
                      <div style={{ width: '80px', height: '16px', background: 'var(--d-border)', borderRadius: '4px', opacity: 0.5 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))
        ) : filtered.length === 0 ? (
          <Col xs={12}>
            <div className="d-card text-center py-5 text-muted">No staff members found</div>
          </Col>
        ) : (
          filtered.map((s, index) => {
            const color = getStaffColor(s, index);
            const initials = getInitials(s.name);

            return (
              <Col key={s._id} xs={12} sm={6} xl={4}>
                <div
                  className="d-card h-100"
                  style={{ borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: 'none' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`, padding: '24px', borderBottom: '1px solid var(--d-border)' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="d-flex gap-4 align-items-center">
                        <div style={{
                          width: 70, height: 70, borderRadius: '18px',
                          background: `${color}25`, color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
                          boxShadow: `0 4px 12px ${color}15`
                        }}>{initials}</div>
                        <div>
                          <h5 className="d-section-title mb-1" style={{ fontSize: '1.15rem', margin: 0 }}>{s.name}</h5>
                          <div className="d-page-sub text-capitalize" style={{ fontSize: '0.95rem', margin: 0 }}>{formatRole(s.role)}</div>
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

                  <div style={{ padding: '20px' }}>
                    <div className="d-flex gap-3 mb-4">
                      <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Shift</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{s.shift || '-'}</div>
                      </div>
                      <div className="flex-grow-1" style={{ background: 'var(--d-bg)', padding: '12px 16px', borderRadius: '12px' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Status</div>
                        <span className={`d-chip ${s.status === 'On Duty' || s.status === 'Active' ? 'd-chip-green' : 'd-chip-gray'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                          {s.status}
                        </span>
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Salary</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--d-primary)' }}>{formatSalary(s.salary)}</div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Leaves</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{s.leavesTaken || 0}<span style={{ fontSize: '0.9rem', color: 'var(--d-text-muted)', fontWeight: 400 }}>/{s.leavesTotal || 12}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            );
          })
        )}
      </Row>

      <Modal show={showView} onHide={() => setShowView(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Staff Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (() => {
            const color = getStaffColor(currentItem, 0);
            const initials = getInitials(currentItem.name);

            return (
              <Row className="g-4">
                <Col xs={12} md={4} className="d-flex flex-column align-items-center">
                  <div style={{
                    width: 100, height: 100, borderRadius: 'var(--d-radius-md)',
                    background: `${color}15`, color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '2.5rem', flexShrink: 0
                  }}>{initials}</div>
                  <h4 className="mt-3 mb-0">{currentItem.name}</h4>
                  <p className="text-muted mb-0 text-capitalize">{formatRole(currentItem.role)}</p>
                  <span className={`d-chip mt-2 ${currentItem.status === 'On Duty' || currentItem.status === 'Active' ? 'd-chip-green' : 'd-chip-gray'}`}>
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
                        <span className="fw-medium">{currentItem.shift || '-'}</span>
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
            );
          })()}
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

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? 'Edit Staff Member' : 'Add New Staff Member'}
        initialData={currentItem ? {
          ...currentItem,
          salary: currentItem.salary ?? '',
          leavesTaken: currentItem.leavesTaken ?? 0,
          leavesTotal: currentItem.leavesTotal ?? 12,
          joiningDate: currentItem.joiningDate
            ? new Date(currentItem.joiningDate).toISOString().split('T')[0]
            : ''
        } : { name: '', email: '', role: 'waiter', status: 'Active', shift: 'Morning', salary: '', leavesTotal: 12, leavesTaken: 0 }}
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
