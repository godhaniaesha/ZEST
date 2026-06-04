import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdPhone, MdEmail, MdSearch,
  MdMoreVert, MdBadge, MdAccessTime, MdFiberManualRecord,
  MdEdit, MdDelete,
  MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const STAFF = [
  { id: 1, name: 'Rajesh Kumar', role: 'Head Chef', shift: 'Morning', status: 'On Duty', initials: 'RK', color: '#C9A84C', phone: '+91 98765 43210', email: 'rajesh@breva.com', salary: '45000', leavesTaken: 2, leavesTotal: 15, joiningDate: '2023-01-10' },
  { id: 2, name: 'Priya Sharma', role: 'Waiter', shift: 'Evening', status: 'On Duty', initials: 'PS', color: '#3498db', phone: '+91 91234 56789', email: 'priya@breva.com', salary: '20000', leavesTaken: 5, leavesTotal: 12, joiningDate: '2023-03-15' },
  { id: 3, name: 'Sam D\'Souza', role: 'Bartender', shift: 'Evening', status: 'On Leave', initials: 'SD', color: '#2ecc71', phone: '+91 98001 11222', email: 'sam@breva.com', salary: '28000', leavesTaken: 8, leavesTotal: 12, joiningDate: '2022-11-20' },
  { id: 4, name: 'Anita Verma', role: 'Cashier', shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#9b59b6', phone: '+91 77654 32109', email: 'anita@breva.com', salary: '22000', leavesTaken: 3, leavesTotal: 12, joiningDate: '2023-05-01' },
  { id: 5, name: 'Dev Malhotra', role: 'Sous Chef', shift: 'Morning', status: 'On Duty', initials: 'DM', color: '#e74c3c', phone: '+91 88001 99882', email: 'dev@breva.com', salary: '35000', leavesTaken: 1, leavesTotal: 15, joiningDate: '2023-02-28' },
  { id: 6, name: 'Leena Nair', role: 'Manager', shift: 'Both', status: 'On Duty', initials: 'LN', color: '#16302B', phone: '+91 99999 11111', email: 'leena@breva.com', salary: '55000', leavesTaken: 0, leavesTotal: 20, joiningDate: '2022-06-10' },
];

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', shift: 'Morning', status: 'On Duty', phone: '', email: '', salary: '', leavesTaken: 0, leavesTotal: 12, joiningDate: '' });

  const filtered = staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', role: '', shift: 'Morning', status: 'On Duty', phone: '', email: '', salary: '', leavesTaken: 0, leavesTotal: 12, joiningDate: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      role: item.role,
      shift: item.shift,
      status: item.status,
      phone: item.phone || '',
      email: item.email || '',
      salary: item.salary || '',
      leavesTaken: item.leavesTaken || 0,
      leavesTotal: item.leavesTotal || 12,
      joiningDate: item.joiningDate || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

 const handleSave = async () => {
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

    if (currentItem) {
      // Update existing staff
      const response = await staffAPI.update(
        currentItem._id,
        { ...formData, initials }
      );

      setStaffList(
        staffList.map(s =>
          s._id === currentItem._id ? response.data : s
        )
      );
    } else {
      // Create new staff
      const response = await staffAPI.create({
        ...formData,
        initials
      });

      setStaffList([...staffList, response.data]);
    }

    setShowForm(false);
  } catch (error) {
    console.error('Error saving staff:', error);
    alert('Failed to save staff member');
  }
};

  const confirmDelete = async () => {
    try {
      await staffAPI.delete(currentItem._id);
      setStaffList(staffList.filter(s => s._id !== currentItem._id));
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  };

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
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Member</button>
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

      <Row className="g-3">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} xl={4}>
              <div className="d-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex gap-3 align-items-center">
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--d-radius-md)',
                      background: '#C9A84C15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}></div>
                    <div>
                      <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>Loading...</h5>
                      <div className="d-page-sub m-0">...</div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          filtered.map((s) => (
            <Col key={s._id} xs={12} sm={6} xl={4}>
              <div className="d-card h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex gap-3 align-items-center">
                    <div style={{
                      width: 52, height: 52, borderRadius: 'var(--d-radius-md)',
                      background: `${s.color}15`, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '1rem', flexShrink: 0
                    }}>{s.initials}</div>
                    <div>
                      <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{s.name}</h5>
                      <div className="d-page-sub m-0">{s.role}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    <button className="d-navbar-icon-btn" onClick={() => handleEdit(s)}><MdEdit /></button>
                    <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(s)}><MdDelete /></button>
                  </div>
                </div>

                <div className="p-2 rounded mb-3" style={{ background: 'var(--d-bg)', fontSize: '0.85rem' }}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Shift:</span>
                    <span style={{ fontWeight: 600 }}>{s.shift}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Status:</span>
                    <span className={`d-chip ${s.status === 'On Duty' ? 'd-chip-green' : 'd-chip-gray'}`} style={{ fontSize: '0.65rem' }}>
                      {s.status}
                    </span>
                  </div>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Status:</span>
                  <span className={`d-chip ${s.status === 'On Duty' ? 'd-chip-green' :
                      s.status === 'On Leave' ? 'd-chip-gold' :
                        'd-chip-gray'
                    }`} style={{ fontSize: '0.65rem' }}>
                    {s.status}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Salary:</span>
                  <span style={{ fontWeight: 600 }}>₹{s.salary}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Leaves:</span>
                  <span style={{ fontWeight: 600 }}>{s.leavesTaken}/{s.leavesTotal}</span>
                </div>
              </div>

              {s.joiningDate && (
                <div className="mb-2" style={{ fontSize: '0.8rem', color: 'var(--d-text-muted)' }}>
                  <span className="text-muted">Joining:</span> {new Date(s.joiningDate).toLocaleDateString('en-IN')}
                </div>
              )}
              {s.phone && (
                <div className="mb-1" style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
                  <MdPhone className="me-1" /> {s.phone}
                </div>
              )}
              {s.email && (
                <div className="mb-3" style={{ fontSize: '0.85rem', color: 'var(--d-text-muted)' }}>
                  <MdEmail className="me-1" /> {s.email}
                </div>
              )}

              <div className="d-flex gap-2">
                <button className="d-btn-outline flex-grow-1" style={{ padding: '6px', fontSize: '0.8rem' }}><MdPhone /> Call</button>
                <button className="d-btn-outline flex-grow-1" style={{ padding: '6px', fontSize: '0.8rem' }}><MdEmail /> Mail</button>
              </div>
          </Col>
        )))}
    </Row >

      {/* Modals */ }
      < FormModal
  show = { showForm }
  onHide = {() => setShowForm(false)
}
title = { currentItem? "Edit Staff Member": "Add New Staff Member" }
onSubmit = { handleSave }
  >
  <Row className="g-3">
    <Col xs={12}>
      <Form.Group>
        <Form.Label className="small fw-bold">Full Name *</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Rajesh Kumar"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Role *</Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g. Head Chef"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          required
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Shift</Form.Label>
        <Form.Select
          value={formData.shift}
          onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
        >
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
          <option value="Both">Both</option>
        </Form.Select>
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Phone Number</Form.Label>
        <Form.Control
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="staff@breva.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={4}>
      <Form.Group>
        <Form.Label className="small fw-bold">Salary (₹)</Form.Label>
        <Form.Control
          type="number"
          placeholder="25000"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={4}>
      <Form.Group>
        <Form.Label className="small fw-bold">Leaves Taken</Form.Label>
        <Form.Control
          type="number"
          min="0"
          value={formData.leavesTaken}
          onChange={(e) => setFormData({ ...formData, leavesTaken: parseInt(e.target.value) || 0 })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={4}>
      <Form.Group>
        <Form.Label className="small fw-bold">Total Leaves</Form.Label>
        <Form.Control
          type="number"
          min="0"
          value={formData.leavesTotal}
          onChange={(e) => setFormData({ ...formData, leavesTotal: parseInt(e.target.value) || 12 })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Joining Date</Form.Label>
        <Form.Control
          type="date"
          value={formData.joiningDate}
          onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6}>
      <Form.Group>
        <Form.Label className="small fw-bold">Status</Form.Label>
        <Form.Select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="On Duty">On Duty</option>
          <option value="Off Duty">Off Duty</option>
          <option value="On Leave">On Leave</option>
        </Form.Select>
      </Form.Group>
    </Col>
  </Row>
      </FormModal >

  <DeleteModal
    show={showDelete}
    onHide={() => setShowDelete(false)}
    onConfirm={confirmDelete}
    itemName={currentItem?.name}
  />
    </>
  );
}
