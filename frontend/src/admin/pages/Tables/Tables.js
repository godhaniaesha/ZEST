import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdTableRestaurant, MdFiberManualRecord } from 'react-icons/md';

export default function Tables() {
  const TABLES = Array.from({ length: 16 }, (_, i) => ({
    id: `T-${i + 1}`,
    status: ['Free', 'Occupied', 'Reserved', 'Occupied'][i % 4],
    capacity: i % 2 === 0 ? 4 : 2
  }));

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Table Status 🪑</div>
          <div className="d-page-sub">Floor plan and table management</div>
        </div>
        <div className="d-flex gap-3 flex-wrap">
          {[['Free','var(--d-success)'], ['Occupied','var(--d-danger)'], ['Reserved','var(--d-info)']].map(([l, c]) => (
            <div key={l} className="d-flex align-items-center gap-2" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              <MdFiberManualRecord style={{ color: c }} /> {l}
            </div>
          ))}
        </div>
      </div>

      <div className="d-card">
        <div className="d-table-status-grid">
          {TABLES.map((t, i) => {
            const color = t.status === 'Occupied' ? 'var(--d-danger)' : t.status === 'Reserved' ? 'var(--d-info)' : 'var(--d-success)';
            const bg = t.status === 'Occupied' ? 'rgba(231,76,60,0.1)' : t.status === 'Reserved' ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)';
            return (
              <div key={i} style={{
                background: bg,
                border: `1.5px solid ${color}`,
                borderRadius: 'var(--d-radius-md)',
                padding: '20px 10px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'var(--d-transition)'
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color }}>{t.id}</div>
                <div style={{ fontSize: '0.7rem', color, textTransform: 'uppercase', fontWeight: 700 }}>{t.status}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--d-text-muted)', marginTop: '5px' }}>Cap: {t.capacity}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
