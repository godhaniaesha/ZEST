import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdminPanelSettings, MdPeople, MdPersonAdd } from 'react-icons/md';

export default function Users() {
  const USERS_LIST = [
    { name: 'Admin User', role: 'superadmin', status: 'Active', email: 'admin@breva.com' },
    { name: 'Manager John', role: 'manager', status: 'Active', email: 'john@breva.com' },
    { name: 'Chef Marco', role: 'chef', status: 'On Duty', email: 'marco@breva.com' },
    { name: 'Waiter Sam', role: 'waiter', status: 'Active', email: 'sam@breva.com' },
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">User Management 👥</div>
          <div className="d-page-sub">Manage staff accounts and permissions</div>
        </div>
        <button className="d-btn-gold"><MdPersonAdd /> Add New User</button>
      </div>

      <div className="d-card">
        <div className="d-section-title">Staff Members</div>
        <div className="d-section-sub">Total {USERS_LIST.length} registered users</div>
        
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
              {USERS_LIST.map((user, i) => (
                <tr key={i}>
                  <td><strong>{user.name}</strong></td>
                  <td><span className="text-capitalize">{user.role}</span></td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{user.email}</td>
                  <td><span className={`d-chip ${user.status === 'Active' ? 'd-chip-green' : 'd-chip-gold'}`}>{user.status}</span></td>
                  <td><button className="d-btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
