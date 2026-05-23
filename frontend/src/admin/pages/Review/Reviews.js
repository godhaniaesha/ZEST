// Reviews.jsx
import React from 'react';
import { MdStar, MdStarBorder } from 'react-icons/md';

const REVIEWS = [
  { name: 'Arjun M.',   rating: 5, comment: 'Exceptional food and ambiance! Will definitely be back.', date: 'May 20' },
  { name: 'Sneha P.',   rating: 4, comment: 'Great cocktails, service was slightly slow.', date: 'May 19' },
  { name: 'Riya S.',    rating: 5, comment: 'Best truffle risotto I have had. Loved the intimate lighting.', date: 'May 18' },
  { name: 'Corporate',  rating: 3, comment: 'Good food but the private room booking was confusing.', date: 'May 17' },
];

function Stars({ n }) {
  return (
    <span style={{ color: 'var(--d-gold)', fontSize: '1rem' }}>
      {[1,2,3,4,5].map(i => i <= n ? <MdStar key={i} /> : <MdStarBorder key={i} />)}
    </span>
  );
}

export default function Reviews() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Reviews</div>
          <div className="d-page-sub">Guest feedback and ratings</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {REVIEWS.map((r, i) => (
          <div key={i} className="d-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <strong style={{ fontFamily: 'Playfair Display,serif', color: 'var(--d-text)' }}>{r.name}</strong>
                <div><Stars n={r.rating} /></div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif' }}>{r.date}</span>
            </div>
            <p style={{ fontFamily: 'Lato,sans-serif', fontSize: '0.88rem', color: 'var(--d-text-muted)', margin: 0 }}>{r.comment}</p>
          </div>
        ))}
      </div>
    </>
  );
}