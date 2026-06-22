import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdStar, MdStarBorder, MdMessage, MdThumbUp, MdSort } from 'react-icons/md';
import { ratingsAPI } from '../../../api';

function Stars({ n }) {
  return (
    <div className="d-flex gap-1" style={{ color: 'var(--d-gold)', fontSize: '1.1rem' }}>
      {[1,2,3,4,5].map(i => i <= n ? <MdStar key={i} /> : <MdStarBorder key={i} />)}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await ratingsAPI.getAllReservationRatings();
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const totalReviews = reviews.length;
  const positiveReviews = reviews.length > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)
    : 0;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getAvatar = (name) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdStar /> Guest Reviews
          </div>
          <div className="d-page-sub">Monitor and respond to customer feedback</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline"><MdSort /> Newest First</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Avg Rating', value: avgRating, icon: <MdStar />, color: 'd-gold' },
          { label: 'Total Reviews', value: totalReviews.toString(), icon: <MdMessage />, color: 'd-blue' },
          { label: 'Positive', value: `${positiveReviews}%`, icon: <MdThumbUp />, color: 'd-green' }
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
        {loading ? (
          <div className="d-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="d-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p>No reviews yet</p>
          </div>
        ) : (
          reviews.map((r, i) => (
            <div key={i} className="d-card">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex gap-3 align-items-start">
                  <div className="d-avatar" style={{ width: '44px', height: '44px', fontSize: '0.9rem' }}>
                    {getAvatar(r.userId?.name || r.reservationId?.customerName || 'User')}
                  </div>
                  <div>
                    <h6 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>
                      {r.userId?.name || r.reservationId?.customerName || 'Anonymous'}
                    </h6>
                    <div className="d-block d-sm-flex align-items-center gap-2">
                      <Stars n={r.rating} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif' }}>
                        • {formatDate(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Reply</button> */}
              </div>
              {r.review && (
                <p style={{ 
                  fontFamily: 'Lato,sans-serif', 
                  fontSize: '0.95rem', 
                  lineHeight: '1.6',
                  color: 'var(--d-text)', 
                  margin: '0',
                  padding: '12px',
                  background: 'var(--d-bg)',
                  borderRadius: 'var(--d-radius-sm)',
                  fontStyle: 'italic',
                  textWrap: 'wrap'
                }}>
                  "{r.review}"
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
