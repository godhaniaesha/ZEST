import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdPersonAdd, MdEdit, MdDelete } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { usersAPI } from '../../../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const loadData = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setCurrentItem(user);
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    setCurrentItem(user);
    setShowDelete(true);
  };

  const handleSave = async (formData) => {
    try {
      if (currentItem) {
        const dataToSend = { ...formData };
        if (!dataToSend.password) delete dataToSend.password;
        await usersAPI.update(currentItem._id, dataToSend);
      } else {
        await usersAPI.create(formData);
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
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
        <div className="d-section-sub">Total {loading ? '...' : users.length} registered users</div>
        
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
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5">Loading...</td></tr>
              ) : users.map((user) => (
                <tr key={user._id}>
                  <td title={user.name}><strong>{user.name}</strong></td>
                  <td title={user.role}><span className="text-capitalize">{user.role}</span></td>
                  <td style={{ color: 'var(--d-text-muted)' }} title={user.email}>{user.email}</td>
                  <td title={user.status}><span className="text-capitalize">{user.status}</span></td>
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

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        title={currentItem ? "Edit User" : "Add New User"}
        initialData={currentItem || {}}
        fields={formFields}
      />

      <DeleteModal 
        show={showDelete} 
        onHide={() => setShowDelete(false)} 
        onDelete={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
