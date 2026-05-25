import React, { useState } from 'react';
import { Row, Col, InputGroup, Form } from 'react-bootstrap';
import { 
  MdAdd, MdEdit, MdDelete, MdSearch, MdFilterList, 
  MdLocalCafe, MdRestaurant, MdLocalBar, MdIcecream 
} from 'react-icons/md';

const MENU_ITEMS = [
  { id: 1, name: 'Truffle Risotto',  category: 'Mains',    price: '₹680', status: 'Available', img: <MdRestaurant />, color: '#2ecc71' },
  { id: 2, name: 'Mojito Classic',   category: 'Cocktails',price: '₹320', status: 'Available', img: <MdLocalBar />,  color: '#3498db' },
  { id: 3, name: 'Beef Tenderloin',  category: 'Mains',    price: '₹1,200', status: 'Available', img: <MdRestaurant />, color: '#2ecc71' },
  { id: 4, name: 'Tiramisu',         category: 'Desserts', price: '₹280', status: 'Sold Out', img: <MdIcecream />,   color: '#e74c3c' },
  { id: 5, name: 'Espresso Martini', category: 'Cocktails',price: '₹380', status: 'Available', img: <MdLocalBar />,  color: '#3498db' },
  { id: 6, name: 'Caesar Salad',     category: 'Starters', price: '₹320', status: 'Available', img: <MdRestaurant />, color: '#f39c12' },
];

const CATEGORIES = [
  { name: 'All', icon: <MdFilterList /> },
  { name: 'Starters', icon: <MdRestaurant /> },
  { name: 'Mains', icon: <MdRestaurant /> },
  { name: 'Desserts', icon: <MdIcecream /> },
  { name: 'Cocktails', icon: <MdLocalBar /> }
];

export default function Menu() {
  const [active, setActive] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = MENU_ITEMS.filter(item => {
    const matchesCategory = active === 'All' || item.category === active;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Menu Management</div>
          <div className="d-page-sub">Create and manage your culinary offerings</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile">Import Menu</button>
          <button className="d-btn-gold"><MdAdd /> Add New Item</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} lg={8}>
          <div className="d-flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button 
                key={c.name} 
                onClick={() => setActive(c.name)} 
                className={`d-btn-filter ${active === c.name ? 'active' : ''}`}
                style={{
                  background: active === c.name ? 'var(--d-primary)' : 'var(--d-white)',
                  color: active === c.name ? 'var(--d-white)' : 'var(--d-text-muted)',
                  border: '1.5px solid var(--d-border)',
                  borderRadius: 'var(--d-radius-md)',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--d-transition)'
                }}
              >
                {c.icon} {c.name}
              </button>
            ))}
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="d-navbar-search-box w-100 m-0">
            <MdSearch className="d-search-icon" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Col>
      </Row>

      <Row className="g-3">
        {filtered.map(item => (
          <Col key={item.id} xs={12} sm={6} xl={4}>
            <div className="d-card h-100 position-relative">
              <div className="d-flex gap-3">
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: 'var(--d-radius-md)',
                  background: `${item.color}15`,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  {item.img}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="d-section-title mb-0" style={{ fontSize: '1rem' }}>{item.name}</h5>
                    <div className="d-flex gap-1">
                      <button className="d-navbar-icon-btn" style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdEdit /></button>
                      <button className="d-navbar-icon-btn text-danger" style={{ width: '28px', height: '28px', fontSize: '1rem' }}><MdDelete /></button>
                    </div>
                  </div>
                  <div className="d-page-sub mb-2">{item.category}</div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--d-primary)', fontFamily: 'Playfair Display' }}>
                      {item.price}
                    </span>
                    <span className={`d-chip ${item.status === 'Available' ? 'd-chip-green' : 'd-chip-red'}`}>
                      {item.status}
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