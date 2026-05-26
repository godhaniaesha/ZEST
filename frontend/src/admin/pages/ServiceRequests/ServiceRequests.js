import React from 'react';
import { MdNotificationsActive, MdCheck, MdMessage } from 'react-icons/md';

export default function ServiceRequests() {
  const REQUESTS = [
    { id: 1, table: 'T-4', type: 'Waiter Call', time: '2m ago', status: 'Pending' },
    { id: 2, table: 'T-7', type: 'Water Request', time: '5m ago', status: 'Pending' },
    { id: 3, table: 'Bar', type: 'Bill Request', time: '8m ago', status: 'Processing' },
    { id: 4, table: 'T-10', type: 'Waiter Call', time: '15m ago', status: 'Completed' },
  ];

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Customer Requests 🔔</div>
          <div className="d-page-sub">Live service notifications from tables</div>
        </div>
        <button className="d-btn-gold">Clear All Completed</button>
      </div>

      <div className="d-card">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Table</th>
                <th>Request Type</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((req) => (
                <tr key={req.id}>
                  <td><strong>{req.table}</strong></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MdMessage className="text-primary" />
                      <span>{req.type}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{req.time}</td>
                  <td><span className={`d-chip ${req.status === 'Pending' ? 'd-chip-red' : req.status === 'Processing' ? 'd-chip-gold' : 'd-chip-green'}`}>{req.status}</span></td>
                  <td>
                    <button className="d-btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                      <MdCheck /> Acknowledge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
