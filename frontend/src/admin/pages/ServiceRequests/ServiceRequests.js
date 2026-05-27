import React from 'react';
import { Badge } from 'react-bootstrap';
import { MdNotificationsActive, MdCheck, MdMessage, MdTableBar, MdTimer } from 'react-icons/md';

const REQUESTS = [
  { id: 1, table: 'T-4', type: 'Waiter Call', time: '2m ago', status: 'Pending', priority: 'High' },
  { id: 2, table: 'T-7', type: 'Water Request', time: '5m ago', status: 'Pending', priority: 'Medium' },
  { id: 3, table: 'Bar Counter', type: 'Bill Request', time: '8m ago', status: 'Processing', priority: 'High' },
  { id: 4, table: 'T-10', type: 'Waiter Call', time: '15m ago', status: 'Completed', priority: 'Low' },
  { id: 5, table: 'T-2', type: 'Clean Table', time: '20m ago', status: 'Pending', priority: 'Medium' },
];

export default function ServiceRequests() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Customer Requests 🔔</div>
          <div className="d-page-sub">Live service notifications and alerts from tables</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline">Notification Settings</button>
          <button className="d-btn-gold">Clear All Completed</button>
        </div>
      </div>

      <div className="d-card">
        <div className="d-section-title">Active Notifications</div>
        <div className="d-section-sub">Real-time alerts for the service team</div>
        
        <div className="d-table-wrap mt-4">
          <table className="d-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Request Details</th>
                <th>Priority</th>
                <th>Received</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MdTableBar className="text-gold" />
                      <strong>{req.table}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MdMessage className="text-primary" />
                      <span>{req.type}</span>
                    </div>
                  </td>
                  <td>
                    <Badge bg={req.priority === 'High' ? 'danger' : req.priority === 'Medium' ? 'warning' : 'secondary'} 
                           style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      {req.priority}
                    </Badge>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1 text-muted">
                      <MdTimer /> {req.time}
                    </div>
                  </td>
                  <td>
                    <span className={`d-chip ${
                      req.status === 'Pending' ? 'd-chip-red' : 
                      req.status === 'Processing' ? 'd-chip-gold' : 
                      'd-chip-green'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <button className="d-btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      <MdCheck /> Acknowledge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .text-gold { color: var(--d-gold); }
      `}</style>
    </>
  );
}
