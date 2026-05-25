import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdLocalBar, MdAdd, MdSearch, MdFilterList, 
  MdWineBar, MdSportsBar, MdWineBar as MdWine, MdEdit, MdDelete 
} from 'react-icons/md';

const DRINKS = [
  { name: 'Classic Mojito',     cat: 'Cocktail', price: '₹320', available: true,  img: <MdLocalBar />, color: '#2ecc71' },
  { name: 'Old Fashioned',      cat: 'Cocktail', price: '₹480', available: true,  img: <MdLocalBar />, color: '#f39c12' },
  { name: 'Kingfisher Draught', cat: 'Beer',     price: '₹180', available: true,  img: <MdSportsBar />, color: '#3498db' },
  { name: 'House Red Wine',     cat: 'Wine',     price: '₹420', available: true,  img: <MdWine />, color: '#e74c3c' },
  { name: 'Espresso Martini',   cat: 'Cocktail', price: '₹380', available: false, img: <MdLocalBar />, color: '#9b59b6' },
  { name: 'Whiskey Sour',       cat: 'Cocktail', price: '₹440', available: true,  img: <MdLocalBar />, color: '#e67e22' },
];

const CATEGORIES = ['All', 'Cocktail', 'Beer', 'Wine', 'Spirits'];

export default function Bar() {
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = DRINKS.filter(d => {
    const matchesCat = active === 'All' || d.cat === active;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Bar & Beverage Management</div>
          <div className="d-page-sub">Curate your premium spirits and cocktail collection</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile">Stock Inventory</button>
          <button className="d-btn-gold"><MdAdd /> Add New Drink</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <div className="d-flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button 
                key={c} 
                onClick={() => setActive(c)} 
                style={{
                  background: active === c ? 'var(--d-primary)' : 'var(--d-white)',
                  color: active === c ? 'var(--d-white)' : 'var(--d-text-muted)',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'var(--d-transition)',
                  cursor: 'pointer'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input 
              type="text" 
              placeholder="Search spirits..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        {filtered.map((d, i) => (
          <Col key={i} xs={12} sm={6} xl={4}>
            <div className="d-card h-100">
              <div className="d-flex gap-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--d-radius-md)',
                  background: `${d.color}15`,
                  color: d.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {d.img}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{d.name}</h5>
                    <div className="d-flex gap-1">
                      <button className="d-navbar-icon-btn" style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdEdit /></button>
                      <button className="d-navbar-icon-btn text-danger" style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdDelete /></button>
                    </div>
                  </div>
                  <div className="d-page-sub mb-2">{d.cat}</div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                      {d.price}
                    </span>
                    <span className={`d-chip ${d.available ? 'd-chip-green' : 'd-chip-red'}`}>
                      {d.available ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}