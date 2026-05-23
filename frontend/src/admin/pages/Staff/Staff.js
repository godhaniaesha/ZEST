import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdd, MdPhone, MdEmail } from 'react-icons/md';

const STAFF = [
  { name: 'Rajesh Kumar',   role: 'Head Chef',  shift: 'Morning', status: 'On Duty',  initials: 'RK', color: '#C9A84C' },
  { name: 'Priya Sharma',   role: 'Waiter',     shift: 'Evening', status: 'On Duty',  initials: 'PS', color: '#3498db' },
  { name: 'Sam D\'Souza',   role: 'Bartender',  shift: 'Evening', status: 'On Duty',  initials: 'SD', color: '#2ecc71' },
  { name: 'Anita Verma',    role: 'Cashier',    shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#9b59b6' },
  { name: 'Dev Malhotra',   role: 'Sous Chef',  shift: 'Morning', status: 'On Duty',  initials: 'DM', color: '#e74c3c' },
  { name: 'Leena Nair',     role: 'Manager',    shift: 'Both',    status: 'On Duty',  initials: 'LN', color: '#16302B' },
];

export default function Staff() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Staff Management</div>
          <div className="d-page-sub">{STAFF.filter(s => s.status === 'On Duty').length} staff on duty today</div>
        </div>
        <button className="d-btn-primary"><MdAdd /> Add Member</button>
      </div>

      <Row className="g-3">
        {STAFF.map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={4}>
            <div className="d-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: s.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontFamily: 'Lato,sans-serif', fontSize: '0.9rem', flexShrink: 0
              }}>{s.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontFamily: 'Playfair Display,serif', color: 'var(--d-text)' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif', marginBottom: 8 }}>
                  {s.role} · {s.shift} Shift
                </div>
                <span className={`d-chip ${s.status === 'On Duty' ? 'd-chip-green' : 'd-chip-gray'}`}>{s.status}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}