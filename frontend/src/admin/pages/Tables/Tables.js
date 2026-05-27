import React from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { MdTableRestaurant, MdFiberManualRecord, MdPeople } from 'react-icons/md';

const TABLES = [
  { id: 'T-1', status: 'Occupied', cap: 2, time: '45m' },
  { id: 'T-2', status: 'Free', cap: 4, time: '-' },
  { id: 'T-3', status: 'Reserved', cap: 2, time: '7:30 PM' },
  { id: 'T-4', status: 'Occupied', cap: 6, time: '1h 20m' },
  { id: 'T-5', status: 'Free', cap: 4, time: '-' },
  { id: 'T-6', status: 'Free', cap: 2, time: '-' },
  { id: 'T-7', status: 'Occupied', cap: 4, time: '10m' },
  { id: 'T-8', status: 'Reserved', cap: 4, time: '8:00 PM' },
  { id: 'B-1', status: 'Occupied', cap: 1, time: '30m' },
  { id: 'B-2', status: 'Free', cap: 1, time: '-' },
];

export default function Tables() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Table Status 🪑</div>
          <div className="d-page-sub">Real-time floor management and table availability</div>
        </div>
        <div className="d-flex gap-3 align-items-center flex-wrap">
          <div className="d-flex align-items-center gap-2 small fw-bold">
            <MdFiberManualRecord className="text-success" /> Free
          </div>
          <div className="d-flex align-items-center gap-2 small fw-bold">
            <MdFiberManualRecord className="text-danger" /> Occupied
          </div>
          <div className="d-flex align-items-center gap-2 small fw-bold">
            <MdFiberManualRecord className="text-info" /> Reserved
          </div>
          <div className="d-divider-v d-hide-mobile"></div>
          <button className="d-btn-gold">+ Quick Reserve</button>
        </div>
      </div>

      <div className="d-card">
        <div className="d-section-title">Floor Plan Overview</div>
        <div className="d-section-sub">Café & Bar seating area</div>
        
        <div className="d-table-status-grid mt-4">
          {TABLES.map((t, i) => (
            <div key={i} className={`d-table-box ${t.status.toLowerCase()}`}>
              <div className="d-table-id">{t.id}</div>
              <div className="d-table-cap">
                <MdPeople /> {t.cap}
              </div>
              <div className="d-table-status-text">{t.status}</div>
              {t.time !== '-' && <div className="d-table-time">{t.time}</div>}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .d-table-status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 20px;
        }
        .d-table-box {
          border-radius: var(--d-radius-md);
          padding: 24px 15px;
          text-align: center;
          border: 1.5px solid var(--d-border);
          transition: var(--d-transition);
          cursor: pointer;
          position: relative;
          background: var(--d-bg);
        }
        .d-table-box:hover {
          transform: translateY(-4px);
          box-shadow: var(--d-shadow-md);
        }
        .d-table-id {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--d-primary);
          margin-bottom: 4px;
        }
        .d-table-cap {
          font-size: 0.75rem;
          color: var(--d-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-bottom: 12px;
        }
        .d-table-status-text {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .d-table-time {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 0.6rem;
          color: var(--d-text-muted);
          font-weight: 600;
        }
        
        .d-table-box.free { border-color: var(--d-success); background: rgba(46,204,113,0.05); }
        .d-table-box.free .d-table-status-text { color: var(--d-success); }
        
        .d-table-box.occupied { border-color: var(--d-danger); background: rgba(231,76,60,0.05); }
        .d-table-box.occupied .d-table-status-text { color: var(--d-danger); }
        
        .d-table-box.reserved { border-color: var(--d-info); background: rgba(52,152,219,0.05); }
        .d-table-box.reserved .d-table-status-text { color: var(--d-info); }
      `}</style>
    </>
  );
}
