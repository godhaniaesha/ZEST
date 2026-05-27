import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { 
  MdAdd, MdPhone, MdEmail, MdSearch, 
  MdMoreVert, MdBadge, MdAccessTime, MdFiberManualRecord,
  MdEdit, MdDelete
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const STAFF = [
  { id: 1, name: 'Rajesh Kumar',   role: 'Head Chef',  shift: 'Morning', status: 'On Duty',  initials: 'RK', color: '#C9A84C' },
  { id: 2, name: 'Priya Sharma',   role: 'Waiter',     shift: 'Evening', status: 'On Duty',  initials: 'PS', color: '#3498db' },
  { id: 3, name: 'Sam D\'Souza',   role: 'Bartender',  shift: 'Evening', status: 'On Duty',  initials: 'SD', color: '#2ecc71' },
  { id: 4, name: 'Anita Verma',    role: 'Cashier',    shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#9b59b6' },
  { id: 5, name: 'Dev Malhotra',   role: 'Sous Chef',  shift: 'Morning', status: 'On Duty',  initials: 'DM', color: '#e74c3c' },
  { id: 6, name: 'Leena Nair',     role: 'Manager',    shift: 'Both',    status: 'On Duty',  initials: 'LN', color: '#16302B' },
];

export default function Staff() {
  const [staffList, setStaffList] = useState(STAFF);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', shift: 'Morning', status: 'On Duty' });

  const filtered = staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', role: '', shift: 'Morning', status: 'On Duty' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({ name: item.name, role: item.role, shift: item.shift, status: item.status });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (currentItem) {
      setStaffList(staffList.map(s => s.id === currentItem.id ? { ...s, ...formData } : s));
    } else {
      const newId = staffList.length + 1;
      const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase();
      setStaffList([...staffList, { id: newId, ...formData, initials, color: '#C9A84C' }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setStaffList(staffList.filter(s => s.id !== currentItem.id));
    setShowDelete(false);
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Staff & Personnel</div>
          <div className="d-page-sub">Manage your service team and schedules</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile">Shift Roster</button>
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Member</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
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
        ))}
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
        {filtered.map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={4}>
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

              <div className="d-flex gap-2">
                <button className="d-btn-outline flex-grow-1" style={{ padding: '6px', fontSize: '0.8rem' }}><MdPhone /> Call</button>
                <button className="d-btn-outline flex-grow-1" style={{ padding: '6px', fontSize: '0.8rem' }}><MdEmail /> Mail</button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Modals */}
      <FormModal 
        show={showForm} 
        onHide={() => setShowForm(false)} 
        title={currentItem ? "Edit Staff Member" : "Add New Staff Member"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Rajesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Role</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Head Chef"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Shift</Form.Label>
              <Form.Select 
                value={formData.shift}
                onChange={(e) => setFormData({...formData, shift: e.target.value})}
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Both">Both</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <div className="d-flex gap-3">
                <Form.Check 
                  type="radio" 
                  label="On Duty" 
                  name="status" 
                  checked={formData.status === 'On Duty'}
                  onChange={() => setFormData({...formData, status: 'On Duty'})}
                />
                <Form.Check 
                  type="radio" 
                  label="Off Duty" 
                  name="status" 
                  checked={formData.status === 'Off Duty'}
                  onChange={() => setFormData({...formData, status: 'Off Duty'})}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      <DeleteModal 
        show={showDelete} 
        onHide={() => setShowDelete(false)} 
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
