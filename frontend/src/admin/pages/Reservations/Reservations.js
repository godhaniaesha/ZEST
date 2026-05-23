import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdd, MdPhone, MdPeople } from 'react-icons/md';

const RESERVATIONS = [
  { id: 'R-001', name: 'Arjun Mehta',    time: '7:00 PM', guests: 4, table: 'Table 3', phone: '+91 98765 43210', status: 'Confirmed' },
  { id: 'R-002', name: 'Sneha Patel',    time: '7:30 PM', guests: 2, table: 'Table 6', phone: '+91 91234 56789', status: 'Confirmed' },
  { id: 'R-003', name: 'Corporate Grp.', time: '8:00 PM', guests: 12,table: 'Tables 1+2', phone: '+91 98001 11222', status: 'Pending' },
  { id: 'R-004', name: 'Riya Sharma',    time: '8:30 PM', guests: 3, table: 'Table 8', phone: '+91 77654 32109', status: 'Confirmed' },
  { id: 'R-005', name: 'Dev Kapoor',     time: '9:00 PM', guests: 6, table: 'Table 5', phone: '+91 88001 99882', status: 'Cancelled' },
];

export default function Reservations() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Reservations</div>
          <div className="d-page-sub">Manage table bookings for tonight</div>
        </div>
        <button className="d-btn-primary"><MdAdd /> New Booking</button>
      </div>

      <Row className="g-3">
        {[['Confirmed', '3', 'd-chip-green'], ['Pending', '1', 'd-chip-gold'], ['Cancelled', '1', 'd-chip-red']].map(([l, v, c]) => (
          <Col key={l} xs={12} sm={4}>
            <div className="d-stat-card">
              <div>
                <div className="d-stat-value">{v}</div>
                <div className="d-stat-label">{l}</div>
              </div>
              <span className={`d-chip ${c}`} style={{ marginLeft: 'auto' }}>{l}</span>
            </div>
          </Col>
        ))}
      </Row>

      <div className="d-card mt-4" style={{ padding: 0 }}>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Table</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RESERVATIONS.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--d-text-muted)' }}>{r.id}</td>
                  <td><strong>{r.name}</strong></td>
                  <td style={{ fontWeight: 700, color: 'var(--d-primary)' }}>{r.time}</td>
                  <td><MdPeople style={{ verticalAlign: 'middle', color: 'var(--d-text-muted)', marginRight: 4 }} />{r.guests}</td>
                  <td>{r.table}</td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.82rem' }}><MdPhone style={{ verticalAlign: 'middle', marginRight: 4 }} />{r.phone}</td>
                  <td>
                    <span className={`d-chip ${r.status === 'Confirmed' ? 'd-chip-green' : r.status === 'Pending' ? 'd-chip-gold' : 'd-chip-red'}`}>{r.status}</span>
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