import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdLocalBar, MdAdd } from 'react-icons/md';

const DRINKS = [
  { name: 'Classic Mojito',     cat: 'Cocktail', price: '₹320', available: true,  img: '🍹' },
  { name: 'Old Fashioned',      cat: 'Cocktail', price: '₹480', available: true,  img: '🥃' },
  { name: 'Kingfisher Draught', cat: 'Beer',     price: '₹180', available: true,  img: '🍺' },
  { name: 'House Red Wine',     cat: 'Wine',     price: '₹420', available: true,  img: '🍷' },
  { name: 'Espresso Martini',   cat: 'Cocktail', price: '₹380', available: false, img: '🍸' },
  { name: 'Whiskey Sour',       cat: 'Cocktail', price: '₹440', available: true,  img: '🥃' },
];

export default function Bar() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Bar & Drinks</div>
          <div className="d-page-sub">Manage cocktails, spirits, beers and wines</div>
        </div>
        <button className="d-btn-primary"><MdAdd /> Add Drink</button>
      </div>

      <Row className="g-3">
        {DRINKS.map((d, i) => (
          <Col key={i} xs={12} sm={6} lg={4}>
            <div className="d-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--d-radius-md)',
                background: 'rgba(22,48,43,0.06)', fontSize: '1.6rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>{d.img}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontFamily: 'Playfair Display,serif', color: 'var(--d-text)' }}>{d.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif' }}>{d.cat}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <strong style={{ fontFamily: 'Lato,sans-serif', color: 'var(--d-primary)' }}>{d.price}</strong>
                  <span className={`d-chip ${d.available ? 'd-chip-green' : 'd-chip-red'}`}>{d.available ? 'Available' : 'Sold Out'}</span>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}