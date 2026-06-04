import React, { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdPersonAdd, MdEdit, MdDelete, MdPhone } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import Pagination from '../../components/Pagination';

const USERS_LIST = [
  { id: 1, name: 'Admin User', role: 'superadmin', status: 'Active', email: 'admin@breva.com', phone: '+91 98765 43210' },
  { id: 2, name: 'Manager John', role: 'manager', status: 'Active', email: 'john@breva.com', phone: '+91 91234 56789' },
  { id: 3, name: 'Chef Marco', role: 'chef', status: 'On Duty', email: 'marco@breva.com', phone: '+91 98001 11222' },
  { id: 4, name: 'Waiter Sam', role: 'waiter', status: 'Active', email: 'sam@breva.com', phone: '+91 77654 32109' },
];

export default function Users() {
  const [users, setUsers] = useState(USERS_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: 'waiter', status: 'Active', email: '', phone: '', password: '', confirmPassword: '' });

  const filtered = users.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', role: 'waiter', status: 'Active', email: '', phone: '', password: '', confirmPassword: '' });
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setCurrentItem(user);
    setFormData({ name: user.name, role: user.role, status: user.status, email: user.email, phone: user.phone || '', password: '', confirmPassword: '' });
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setCurrentItem(user);
    setShowDelete(true);
  };

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    // Password validation for new users
    if (!currentItem) {
      if (!formData.password || formData.password.length < 6) {
        alert('Please enter a password (minimum 6 characters)');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    if (currentItem) {
      setUsers(users.map(u => u.id === currentItem.id ? { ...u, ...formData, password: undefined, confirmPassword: undefined } : u));
    } else {
      const newId = users.length + 1;
      setUsers([...users, { id: newId, ...formData, password: undefined, confirmPassword: undefined }]);
    }
  };

  const confirmDelete = async () => {
    try {
      await usersAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const formFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'email', label: 'Email Address', type: 'email', required: true },
    { name: 'password', label: currentItem ? 'Password (leave empty to keep current)' : 'Password', type: 'password', required: !currentItem },
    { name: 'image', label: 'Image URL', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', required: true, options: [
      { label: 'Super Admin', value: 'superadmin' },
      { label: 'Manager', value: 'manager' },
      { label: 'Chef', value: 'chef' },
      { label: 'Waiter', value: 'waiter' },
      { label: 'Cashier', value: 'cashier' },
      { label: 'Bartender', value: 'bartender' },
      { label: 'Customer', value: 'customer' }
    ] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'On Duty', value: 'On Duty' }
    ] }
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdAdminPanelSettings /> User Management
          </div>
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
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((user, i) => (
                <tr key={i}>
                  <td title={user.name}><strong>{user.name}</strong></td>
                  <td title={user.role}><span className="text-capitalize">{user.role}</span></td>
                  <td style={{ color: 'var(--d-text-muted)' }}>
                    <div title={user.email}>{user.email}</div>
                    {user.phone && <div className="small"><MdPhone className="me-1" />{user.phone}</div>}
                  </td>
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
        <div className="px-4">
          {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          )}
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
              <Form.Label className="small fw-bold">Full Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Sam D'Souza"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Email Address *</Form.Label>
              <Form.Control
                type="email"
                placeholder="sam@breva.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
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
          {!currentItem && (
            <>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Confirm Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </>
          )}
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Role</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
