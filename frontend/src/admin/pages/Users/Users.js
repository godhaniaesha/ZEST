import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const USERS_LIST = [
  { id: 1, name: 'Admin User', role: 'superadmin', status: 'Active', email: 'admin@breva.com' },
  { id: 2, name: 'Manager John', role: 'manager', status: 'Active', email: 'john@breva.com' },
  { id: 3, name: 'Chef Marco', role: 'chef', status: 'On Duty', email: 'marco@breva.com' },
  { id: 4, name: 'Waiter Sam', role: 'waiter', status: 'Active', email: 'sam@breva.com' },
];

export default function Users() {
  const [users, setUsers] = useState(USERS_LIST);
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'waiter', status: 'Active', email: '' });

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', role: 'waiter', status: 'Active', email: '' });
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setCurrentItem(user);
    setFormData({ name: user.name, role: user.role, status: user.status, email: user.email });
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setCurrentItem(user);
    setShowDelete(true);
  };

  const handleSave = () => {
    if (currentItem) {
      setUsers(users.map(u => u.id === currentItem.id ? { ...u, ...formData } : u));
    } else {
      const newId = users.length + 1;
      setUsers([...users, { id: newId, ...formData }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setUsers(users.filter(u => u.id !== currentItem.id));
    setShowDelete(false);
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">User Management 👥</div>
          <div className="d-page-sub">Manage staff accounts and permissions</div>
        </div>
        <button className="d-btn-gold" onClick={handleAdd}><MdPersonAdd /> Add New User</button>
      </div>

      <div className="d-card">
        <div className="d-section-title">Staff Members</div>
        <div className="d-section-sub">Total {users.length} registered users</div>
        
        <div className="d-table-wrap mt-4">
          <table className="d-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={i}>
                  <td title={user.name}><strong>{user.name}</strong></td>
                  <td title={user.role}><span className="text-capitalize">{user.role}</span></td>
                  <td style={{ color: 'var(--d-text-muted)' }} title={user.email}>{user.email}</td>
                  <td title={user.status}><span className={`d-chip ${user.status === 'Active' || user.status === 'On Duty' ? 'd-chip-green' : 'd-chip-gold'}`}>{user.status}</span></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="d-navbar-icon-btn" onClick={() => handleEdit(user)} style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdEdit /></button>
                      <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(user)} style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <FormModal 
        show={showForm} 
        onHide={() => setShowForm(false)} 
        title={currentItem ? "Edit User" : "Add New User"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Full Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Sam D'Souza"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Email Address</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="sam@breva.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Role</Form.Label>
              <Form.Select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="superadmin">Super Admin</option>
                <option value="manager">Manager</option>
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Duty">On Duty</option>
              </Form.Select>
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
