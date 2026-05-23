import React from 'react';
import { Row, Col } from 'react-bootstrap';

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
          <div className="d-page-heading">Reports & Analytics</div>
          <div className="d-page-sub">Weekly performance overview</div>
        </div>
        <button className="d-btn-outline">Export PDF</button>
      </div>

      <Row className="g-3">
        <Col xs={12} lg={8}>
          <div className="d-card">
            <div className="d-section-title">Weekly Revenue</div>
            <div className="d-section-sub">Total: ₹6,88,000 this week</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginTop: 12 }}>
              {WEEKLY.map((w) => (
                <div key={w.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', borderRadius: '6px 6px 0 0',
                    background: 'linear-gradient(180deg, var(--d-gold), var(--d-primary))',
                    height: `${(w.rev / MAX) * 130}px`,
                    transition: 'height 0.4s ease',
                    opacity: w.day === 'Fri' || w.day === 'Sat' ? 1 : 0.65,
                  }} />
                  <span style={{ fontFamily: 'Lato,sans-serif', fontSize: '0.72rem', color: 'var(--d-text-muted)' }}>{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-card h-100">
            <div className="d-section-title">Top Items</div>
            <div className="d-section-sub">By revenue this week</div>
            {[
              ['Truffle Risotto', '₹48,200'],
              ['Beef Tenderloin', '₹39,600'],
              ['Old Fashioned',   '₹28,400'],
              ['House Red Wine',  '₹21,000'],
            ].map(([item, rev], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--d-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, background: 'var(--d-primary)', color: 'var(--d-gold)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Lato,sans-serif' }}>{i + 1}</span>
                  <span style={{ fontFamily: 'Lato,sans-serif', fontSize: '0.85rem' }}>{item}</span>
                </div>
                <strong style={{ fontFamily: 'Lato,sans-serif', color: 'var(--d-primary)' }}>{rev}</strong>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </>
  );
}