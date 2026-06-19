import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { MdNotificationsActive, MdCheck, MdMessage, MdPerson, MdTimer, MdEmail, MdPhone, MdDelete } from 'react-icons/md';
import { contactAPI } from '../../../api';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching contact requests:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load contact requests';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await contactAPI.updateStatus(id, newStatus);
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update status';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact request?')) return;
    
    try {
      await contactAPI.delete(id);
      setRequests(requests.filter(req => req._id !== id));
    } catch (err) {
      console.error('Error deleting request:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete request';
      alert(`Error: ${errorMessage}`);
    }
  };
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdNotificationsActive /> Contact Us Messages
          </div>
          <div className="d-page-sub">Manage customer inquiries and feedback</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline" onClick={fetchRequests}>Refresh</button>
          <button className="d-btn-gold" onClick={() => {
            const completed = requests.filter(r => r.status === 'Completed');
            if (completed.length === 0) {
              alert('No completed requests to clear');
              return;
            }
            if (window.confirm(`Clear ${completed.length} completed requests?`)) {
              completed.forEach(req => handleDelete(req._id));
            }
          }}>Clear All Completed</button>
        </div>
      </div>

      <div className="d-card">
        <div className="d-section-title">Contact Form Submissions</div>
        <div className="d-section-sub">All messages received from customers</div>
        
        <div className="d-table-wrap mt-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading contact requests...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No contact requests yet</p>
            </div>
          ) : (
            <table className="d-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Priority</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <MdPerson className="text-gold" />
                        <strong>{req.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                          <MdEmail /> {req.email}
                        </div>
                        <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.85rem' }}>
                          <MdPhone /> {req.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <MdMessage className="text-primary" />
                        <span>{req.subject}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', maxWidth: '200px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.message}
                      </span>
                    </td>
                    <td>
                      <Badge bg={req.priority === 'High' ? 'danger' : req.priority === 'Medium' ? 'warning' : 'secondary'} 
                             style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {req.priority || 'Medium'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-muted">
                        <MdTimer /> {formatTimeAgo(req.createdAt)}
                      </div>
                    </td>
                    <td>
                      <select 
                        className={`form-select form-select-sm ${
                          req.status === 'Pending' ? 'd-chip-red' : 
                          req.status === 'Processing' ? 'd-chip-gold' : 
                          'd-chip-green'
                        }`}
                        style={{ 
                          fontSize: '0.75rem', 
                          padding: '4px 8px', 
                          width: 'auto',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M2.5 4.5L6 8l3.5-3.5'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 8px center',
                          paddingRight: '28px'
                        }}
                        value={req.status}
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button 
                          className="d-btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => handleStatusUpdate(req._id, 'Completed')}
                          title="Mark as Completed"
                        >
                          <MdCheck />
                        </button>
                        <button 
                          className="d-btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#dc3545', color: '#dc3545' }}
                          onClick={() => handleDelete(req._id)}
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .text-gold { color: var(--d-gold); }
      `}</style>
    </>
  );
}
