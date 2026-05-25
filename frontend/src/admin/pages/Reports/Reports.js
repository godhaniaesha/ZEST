import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdTrendingUp, MdShowChart, MdPieChart, MdFileDownload, 
  MdDateRange, MdLocalCafe, MdLocalBar 
} from 'react-icons/md';

const WEEKLY = [
  { day: 'Mon', rev: 68000 },
  { day: 'Tue', rev: 82000 },
  { day: 'Wed', rev: 75000 },
  { day: 'Thu', rev: 91000 },
  { day: 'Fri', rev: 124000 },
  { day: 'Sat', rev: 138000 },
  { day: 'Sun', rev: 110000 },
];

const MAX = Math.max(...WEEKLY.map(w => w.rev));

export default function Reports() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Analytics & Reports</div>
          <div className="d-page-sub">Comprehensive overview of your business performance</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline"><MdDateRange /> Last 7 Days</button>
          <button className="d-btn-gold"><MdFileDownload /> Export Data</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Net Revenue', value: '₹6,88,000', change: '+14%', icon: <MdTrendingUp />, color: 'd-gold' },
          { label: 'Avg Order Value', value: '₹1,420', change: '+5%', icon: <MdShowChart />, color: 'd-blue' },
          { label: 'Customer Growth', value: '240', change: '+12%', icon: <MdPieChart />, color: 'd-green' }
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${s.color}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                {s.icon}
              </div>
              <div className="flex-grow-1">
                <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="d-stat-label">{s.label}</span>
                  <span className="text-success" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{s.change}</span>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={8}>
          <div className="d-card h-100">
            <div className="d-section-title">Revenue Trends</div>
            <div className="d-section-sub">Daily sales performance (Café + Bar)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4%', height: '220px', marginTop: '30px', padding: '0 10px' }}>
              {WEEKLY.map((w) => (
                <div key={w.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <div 
                    className="position-relative w-100" 
                    style={{ 
                      borderRadius: 'var(--d-radius-sm) var(--d-radius-sm) 0 0',
                      background: w.day === 'Fri' || w.day === 'Sat' ? 'var(--d-gold)' : 'var(--d-primary)',
                      height: `${(w.rev / MAX) * 180}px`,
                      transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: 0.9,
                      cursor: 'pointer'
                    }}
                    title={`₹${w.rev.toLocaleString()}`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-25px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: 'var(--d-text-muted)'
                    }}>
                      {Math.round(w.rev/1000)}k
                    </div>
                  </div>
                  <span style={{ fontFamily: 'Lato,sans-serif', fontSize: '0.8rem', fontWeight: 600, color: 'var(--d-text-muted)' }}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title">Category Distribution</div>
            <div className="d-section-sub">Sales breakdown by department</div>
            
            <div className="mt-4">
              {[
                { label: 'Bar & Spirits', value: '58%', icon: <MdLocalBar />, color: 'var(--d-info)' },
                { label: 'Café & Kitchen', value: '32%', icon: <MdLocalCafe />, color: 'var(--d-success)' },
                { label: 'Desserts', value: '10%', icon: <MdTrendingUp />, color: 'var(--d-gold)' }
              ].map((cat, i) => (
                <div key={i} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ color: cat.color }}>{cat.icon}</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat.label}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--d-primary)' }}>{cat.value}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--d-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: cat.value, height: '100%', background: cat.color, borderRadius: '4px' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded" style={{ background: 'var(--d-primary)', color: 'var(--d-white)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Busiest Day</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Playfair Display' }}>Saturday Night</div>
              <div style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--d-gold)' }}>Avg. ₹1.38L Sales</div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}