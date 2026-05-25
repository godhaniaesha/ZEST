import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdStar, MdStarBorder, MdMessage, MdThumbUp, MdSort } from 'react-icons/md';

const REVIEWS = [
  { name: 'Arjun M.',   rating: 5, comment: 'Exceptional food and ambiance! Will definitely be back.', date: 'May 20', avatar: 'AM' },
  { name: 'Sneha P.',   rating: 4, comment: 'Great cocktails, service was slightly slow.', date: 'May 19', avatar: 'SP' },
  { name: 'Riya S.',    rating: 5, comment: 'Best truffle risotto I have had. Loved the intimate lighting.', date: 'May 18', avatar: 'RS' },
  { name: 'Corporate',  rating: 3, comment: 'Good food but the private room booking was confusing.', date: 'May 17', avatar: 'CG' },
];

function Stars({ n }) {
  return (
    <div className="d-flex gap-1" style={{ color: 'var(--d-gold)', fontSize: '1.1rem' }}>
      {[1,2,3,4,5].map(i => i <= n ? <MdStar key={i} /> : <MdStarBorder key={i} />)}
    </div>
  );
}

export default function Reviews() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Guest Reviews</div>
          <div className="d-page-sub">Monitor and respond to customer feedback</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline"><MdSort /> Newest First</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Avg Rating', value: '4.8', icon: <MdStar />, color: 'd-gold' },
          { label: 'Total Reviews', value: '1,240', icon: <MdMessage />, color: 'd-blue' },
          { label: 'Positive', value: '92%', icon: <MdThumbUp />, color: 'd-green' }
        ].map((s, i) => (
          <Col key={i} xs={12} sm={4}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {REVIEWS.map((r, i) => (
          <div key={i} className="d-card">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex gap-3 align-items-center">
                <div className="d-avatar" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }}>{r.avatar}</div>
                <div>
                  <h6 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{r.name}</h6>
                  <div className="d-flex align-items-center gap-2">
                    <Stars n={r.rating} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif' }}>• {r.date}</span>
                  </div>
                </div>
              </div>
              <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Reply</button>
            </div>
            <p style={{ 
              fontFamily: 'Lato,sans-serif', 
              fontSize: '0.95rem', 
              lineHeight: '1.6',
              color: 'var(--d-text)', 
              margin: '0',
              padding: '12px',
              background: 'var(--d-bg)',
              borderRadius: 'var(--d-radius-sm)',
              fontStyle: 'italic'
            }}>
              "{r.comment}"
            </p>
          </div>
        ))}
      </div>
    </>
  );
}