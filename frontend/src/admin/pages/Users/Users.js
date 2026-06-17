import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPersonAdd, MdEdit, MdDelete, MdPhone } from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import Pagination from '../../components/Pagination';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, addUser, updateUser, deleteUser } from '../../../store/slices/usersSlice';
import { useAuth } from '../../../contexts/AuthContext';

export default function Users() {
  const dispatch = useDispatch();
  const { list: users, loading } = useSelector((state) => state.users);
  const { user } = useAuth();
  const userRole = user?.role || 'staff';
  const canAddEditDelete = userRole === 'manager' || userRole === 'superadmin';

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const filtered = users.filter(s => s.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleAdd = () => {
    if (!canAddEditDelete) return;
    setCurrentItem(null);
    setShowForm(true);
  };

  const handleEdit = (user) => {
    if (!canAddEditDelete) return;
    setCurrentItem(user);
    setShowForm(true);
  };

  const handleDeleteClick = (user) => {
    if (!canAddEditDelete) return;
    setCurrentItem(user);
    setShowDelete(true);
  };

  const handleSave = async (formData) => {
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

    try {
      if (currentItem) {
        await dispatch(updateUser({ id: currentItem._id, userData: formData })).unwrap();
      } else {
        await dispatch(addUser(formData)).unwrap();
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteUser(currentItem._id)).unwrap();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const formFields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, col: 12 },
    { name: 'email', label: 'Email Address', type: 'email', required: true, col: 6 },
    { name: 'phone', label: 'Phone Number', type: 'text', col: 6 },
    { name: 'address', label: 'Address', type: 'text', col: 12 },
    { name: 'role', label: 'Role', type: 'select', required: true, col: 6, options: [
      { label: 'Super Admin', value: 'superadmin' },
      { label: 'Manager', value: 'manager' },
      { label: 'Chef', value: 'chef' },
      { label: 'Waiter', value: 'waiter' },
      { label: 'Cashier', value: 'cashier' },
      { label: 'Bartender', value: 'bartender' },
      { label: 'Customer', value: 'customer' }
    ] },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 6, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'On Duty', value: 'On Duty' }
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
    { name: 'password', label: currentItem ? 'Password (leave empty to keep current)' : 'Password', type: 'password', required: !currentItem, col: 6 },
    ...(!currentItem ? [{ name: 'confirmPassword', label: 'Confirm Password', type: 'password', required: true, col: 6 }] : []),
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
        {canAddEditDelete && <button className="d-btn-gold" onClick={handleAdd}><MdPersonAdd /> Add New User</button>}
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
                <th>Salary</th>
                <th>Leaves</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">Loading users...</td>
                </tr>
              ) : (
                currentData.map((user) => (
                  <tr key={user._id}>
                    <td title={user.name}><strong>{user.name}</strong></td>
                    <td title={user.role}><span className="text-capitalize">{user.role}</span></td>
                    <td>{user.salary ? `₹${user.salary}` : '-'}</td>
                    <td>{user.leavesTaken || 0}/{user.leavesTotal || 12}</td>
                    <td style={{ color: 'var(--d-text-muted)' }}>
                      <div title={user.email}>{user.email}</div>
                      {user.phone && <div className="small"><MdPhone className="me-1" />{user.phone}</div>}
                    </td>
                    <td title={user.status}><span className={`d-chip ${user.status === 'Active' || user.status === 'On Duty' ? 'd-chip-green' : 'd-chip-gold'}`}>{user.status}</span></td>
                    <td>
                      {canAddEditDelete && (
                        <div className="d-flex gap-2">
                          <button className="d-navbar-icon-btn" onClick={() => handleEdit(user)} style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdEdit /></button>
                          <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(user)} style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdDelete /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
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
        initialData={currentItem || { name: '', role: 'waiter', status: 'Active', shift: 'Morning', leavesTotal: 12, leavesTaken: 0 }}
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
