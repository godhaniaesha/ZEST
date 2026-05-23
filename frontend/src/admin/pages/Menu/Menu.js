import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';

const MENU_ITEMS = [
  { id: 1, name: 'Truffle Risotto',  category: 'Mains',    price: '₹680', status: 'Available', img: '🍚' },
  { id: 2, name: 'Mojito Classic',   category: 'Cocktails',price: '₹320', status: 'Available', img: '🍹' },
  { id: 3, name: 'Beef Tenderloin',  category: 'Mains',    price: '₹1,200', status: 'Available', img: '🥩' },
  { id: 4, name: 'Tiramisu',         category: 'Desserts', price: '₹280', status: 'Sold Out', img: '🍮' },
  { id: 5, name: 'Espresso Martini', category: 'Cocktails',price: '₹380', status: 'Available', img: '🍸' },
  { id: 6, name: 'Caesar Salad',     category: 'Starters', price: '₹320', status: 'Available', img: '🥗' },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Cocktails'];

export default function Menu() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(i => i.category === active);

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Menu Management</div>
          <div className="d-page-sub">Add, edit or remove menu items</div>
        </div>
        <button className="d-btn-primary"><MdAdd /> Add Item</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setActive(c)} style={{
            background: active === c ? 'var(--d-primary)' : 'var(--d-bg-card)',
            color: active === c ? 'var(--d-accent)' : 'var(--d-text-muted)',
            border: '1.5px solid var(--d-border)',
            borderRadius: 'var(--d-radius-sm)',
            padding: '6px 16px',
            fontFamily: 'Lato,sans-serif',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--d-transition)'
          }}>{c}</button>
        ))}
      </div>

      <Row className="g-3">
        {filtered.map(item => (
          <Col key={item.id} xs={12} sm={6} lg={4}>
            <div className="d-card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--d-radius-md)',
                background: 'var(--d-bg)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
              }}>{item.img}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--d-text)', fontFamily: 'Playfair Display,serif' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', fontFamily: 'Lato,sans-serif', marginBottom: 6 }}>{item.category}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ color: 'var(--d-primary)', fontFamily: 'Lato,sans-serif' }}>{item.price}</strong>
                  <span className={`d-chip ${item.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>{item.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button style={{ background: 'rgba(52,152,219,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--d-info)' }}><MdEdit size={14} /></button>
                <button style={{ background: 'rgba(231,76,60,0.1)', border: 'none', borderRadius: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--d-danger)' }}><MdDelete size={14} /></button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}