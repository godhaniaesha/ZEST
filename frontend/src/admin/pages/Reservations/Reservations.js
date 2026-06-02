import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdAdd, MdPhone, MdPeople, MdEventSeat, 
  MdCheckCircle, MdPendingActions, MdCancel, MdMoreVert 
} from 'react-icons/md';

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
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdEventSeat /> Reservations
          </div>
          <div className="d-page-sub">Manage guest bookings and table assignments</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile">View Floor Plan</button>
          <button className="d-btn-gold"><MdAdd /> New Booking</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Confirmed', value: '3', icon: <MdCheckCircle />, color: 'd-green' },
          { label: 'Pending', value: '1', icon: <MdPendingActions />, color: 'd-gold' },
          { label: 'Cancelled', value: '1', icon: <MdCancel />, color: 'd-red' }
        ].map((s) => (
          <Col key={s.label} xs={12} sm={4}>
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

      <div className="d-card p-0 overflow-hidden">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Schedule</th>
                <th>Party Size</th>
                <th>Assignment</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {RESERVATIONS.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>{r.id}</td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--d-primary)' }}>{r.name}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MdPendingActions className="text-muted" />
                      <span style={{ fontWeight: 600 }}>{r.time}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <MdPeople style={{ color: 'var(--d-text-light)' }} />
                      <span>{r.guests} Guests</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <MdEventSeat style={{ color: 'var(--d-gold)' }} />
                      <span>{r.table}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1" style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>
                      <MdPhone /> {r.phone}
                    </div>
                  </td>
                  <td>
                    <span className={`d-chip ${r.status === 'Confirmed' ? 'd-chip-green' : r.status === 'Pending' ? 'd-chip-gold' : 'd-chip-red'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button className="d-navbar-icon-btn">
                      <MdMoreVert />
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