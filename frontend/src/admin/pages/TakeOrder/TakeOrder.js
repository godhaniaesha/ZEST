import React, { useState } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import { 
  MdSearch, MdLocalCafe, MdLocalBar, MdTableRestaurant, 
  MdAdd, MdRemove, MdDeleteOutline, MdSend, MdHistory
} from 'react-icons/md';

const CAFE_MENU = [
  { id: 1, name: 'Cappuccino', price: 180, category: 'Coffee', icon: '☕' },
  { id: 2, name: 'Iced Latte', price: 220, category: 'Coffee', icon: '🥤' },
  { id: 3, name: 'Butter Croissant', price: 150, category: 'Snacks', icon: '🥐' },
  { id: 4, name: 'Avocado Toast', price: 350, category: 'Snacks', icon: '🥑' },
  { id: 5, name: 'Blueberry Muffin', price: 120, category: 'Snacks', icon: '🧁' },
  { id: 6, name: 'Cold Brew', price: 200, category: 'Coffee', icon: '🧊' },
];

const BAR_MENU = [
  { id: 101, name: 'Old Fashioned', price: 550, category: 'Cocktails', icon: '🥃' },
  { id: 102, name: 'Classic Mojito', price: 450, category: 'Cocktails', icon: '🍸' },
  { id: 103, name: 'Draft Beer (Pint)', price: 350, category: 'Beer', icon: '🍺' },
  { id: 104, name: 'Red Wine (Glass)', price: 650, category: 'Wine', icon: '🍷' },
  { id: 105, name: 'Signature Gin Tonic', price: 500, category: 'Cocktails', icon: '🍹' },
  { id: 106, name: 'Whiskey Sour', price: 520, category: 'Cocktails', icon: '🍋' },
];

export default function TakeOrder() {
  const [activeTab, setActiveTab] = useState('cafe'); // 'cafe' or 'bar'
  const [selectedTable, setSelectedTable] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);

  const menuItems = activeTab === 'cafe' ? CAFE_MENU : BAR_MENU;
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="d-take-order-page">
      <Row className="g-4">
        {/* Left Side: Menu Selection */}
        <Col xs={12} lg={8}>
          <div className="d-page-header flex-column align-items-start gap-3 mb-4">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <div>
                <div className="d-page-heading">New Order 📝</div>
                <div className="d-page-sub">Select items for the customer</div>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className={`d-tab-btn ${activeTab === 'cafe' ? 'active' : ''}`}
                  onClick={() => setActiveTab('cafe')}
                >
                  <MdLocalCafe /> Café
                </button>
                <button 
                  className={`d-tab-btn ${activeTab === 'bar' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bar')}
                >
                  <MdLocalBar /> Bar
                </button>
              </div>
            </div>

            <div className="d-flex w-100 gap-3 flex-wrap">
              <div className="d-search-bar flex-grow-1">
                <MdSearch />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab} menu...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="d-table-select">
                <MdTableRestaurant />
                <select 
                  value={selectedTable} 
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="d-select-input"
                >
                  <option value="">Select Table</option>
                  {[1,2,3,4,5,6,7,8,9,10, 'Bar Counter'].map(t => (
                    <option key={t} value={t}>Table {t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Row className="g-3">
            {filteredItems.map((item) => (
              <Col key={item.id} xs={6} sm={4} xl={3}>
                <div className="d-menu-card" onClick={() => addToCart(item)}>
                  <div className="d-menu-icon">{item.icon}</div>
                  <div className="d-menu-info">
                    <div className="d-menu-name">{item.name}</div>
                    <div className="d-menu-price">₹{item.price}</div>
                  </div>
                  <button className="d-add-btn"><MdAdd /></button>
                </div>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Right Side: Order Summary / Cart */}
        <Col xs={12} lg={4}>
          <div className="d-card d-order-summary h-100 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="d-section-title mb-0">Order Summary</div>
              {selectedTable && (
                <Badge bg="warning" text="dark" style={{ fontSize: '0.75rem' }}>
                  Table {selectedTable}
                </Badge>
              )}
            </div>

            <div className="d-cart-items flex-grow-1">
              {cart.length === 0 ? (
                <div className="text-center mt-5" style={{ color: 'var(--d-text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="d-cart-item">
                    <div className="d-item-details">
                      <div className="d-item-name">{item.name}</div>
                      <div className="d-item-price">₹{item.price}</div>
                    </div>
                    <div className="d-item-actions">
                      <div className="d-qty-controls">
                        <button onClick={() => updateQty(item.id, -1)}><MdRemove /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}><MdAdd /></button>
                      </div>
                      <button className="d-delete-btn" onClick={() => removeFromCart(item.id)}>
                        <MdDeleteOutline />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="d-order-footer mt-auto pt-4 border-top">
              <div className="d-flex justify-content-between mb-2">
                <span style={{ color: 'var(--d-text-muted)' }}>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="d-flex justify-content-between mb-4">
                <strong style={{ fontSize: '1.2rem' }}>Total</strong>
                <strong style={{ fontSize: '1.2rem', color: 'var(--d-gold)' }}>₹{cartTotal}</strong>
              </div>
              
              <div className="d-flex gap-2">
                <button className="d-btn-outline flex-grow-1" style={{ justifyContent: 'center' }}>
                  <MdHistory className="me-1" /> Hold
                </button>
                <button 
                  className="d-btn-gold flex-grow-2 w-100" 
                  style={{ justifyContent: 'center' }}
                  disabled={cart.length === 0 || !selectedTable}
                >
                  <MdSend className="me-2" /> Send to Kitchen
                </button>
              </div>
              {!selectedTable && cart.length > 0 && (
                <div className="text-danger mt-2 text-center" style={{ fontSize: '0.75rem' }}>
                  Please select a table to proceed
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .d-take-order-page {
          padding-bottom: 2rem;
        }
        .d-tab-btn {
          background: var(--d-bg);
          border: 1px solid var(--d-border);
          color: var(--d-text-muted);
          padding: 8px 16px;
          border-radius: var(--d-radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .d-tab-btn.active {
          background: var(--d-gold);
          color: white;
          border-color: var(--d-gold);
        }
        .d-table-select {
          background: var(--d-bg);
          border: 1px solid var(--d-border);
          padding: 0 12px;
          border-radius: var(--d-radius-md);
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--d-text-muted);
        }
        .d-select-input {
          background: none;
          border: none;
          padding: 10px 0;
          outline: none;
          color: var(--d-text);
          font-weight: 500;
          font-size: 0.9rem;
        }
        .d-menu-card {
          background: white;
          border: 1px solid var(--d-border);
          border-radius: var(--d-radius-lg);
          padding: 20px 15px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .d-menu-card:hover {
          border-color: var(--d-gold);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        .d-menu-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }
        .d-menu-name {
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        .d-menu-price {
          color: var(--d-gold);
          font-weight: 800;
        }
        .d-add-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--d-bg);
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--d-gold);
          font-weight: bold;
        }
        .d-cart-items {
          overflow-y: auto;
          max-height: calc(100vh - 450px);
          padding-right: 5px;
        }
        .d-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--d-border);
        }
        .d-item-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .d-item-price {
          font-size: 0.8rem;
          color: var(--d-text-muted);
        }
        .d-item-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .d-qty-controls {
          display: flex;
          align-items: center;
          background: var(--d-bg);
          border-radius: 20px;
          padding: 2px 8px;
          gap: 10px;
        }
        .d-qty-controls button {
          background: none;
          border: none;
          color: var(--d-gold);
          display: flex;
          align-items: center;
        }
        .d-qty-controls span {
          font-weight: 700;
          min-width: 20px;
          text-align: center;
        }
        .d-delete-btn {
          background: none;
          border: none;
          color: #e74c3c;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
