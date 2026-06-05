import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdSearch, MdLocalCafe, MdLocalBar, MdTableRestaurant,
  MdAdd, MdRemove, MdDeleteOutline, MdSend, MdHistory,
  MdReceipt, MdShoppingCart,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { menuAPI, ordersAPI, reservationsAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

export default function TakeOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cafe');
  const [selectedReservationId, setSelectedReservationId] = useState('');
  const [confirmedTables, setConfirmedTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const itemHasType = (item, target) => {
    const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
    return types.includes(target);
  };

  const formatBookingDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const loadConfirmedTables = useCallback(async () => {
    try {
      const res = await reservationsAPI.getConfirmed();
      const list = Array.isArray(res.data) ? res.data : [];
      setConfirmedTables(list);
    } catch (err) {
      console.error('Error loading confirmed reservations:', err);
      try {
        const fallback = await reservationsAPI.getAll({ status: 'Confirmed' });
        setConfirmedTables(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (fallbackErr) {
        console.error('Fallback load failed:', fallbackErr);
        setConfirmedTables([]);
      }
    }
  }, []);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const [menuRes] = await Promise.all([
          menuAPI.getAll(),
          loadConfirmedTables(),
        ]);
        const data = Array.isArray(menuRes.data) ? menuRes.data : [];
        setMenuItems(data);
      } catch (error) {
        console.error('Error loading menu:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, [loadConfirmedTables]);

  const selectedReservation = confirmedTables.find((r) => r._id === selectedReservationId);

  const filteredMenuItems = menuItems.filter(
    (item) =>
      itemHasType(item, activeTab === 'cafe' ? 'Cafe' : 'Bar') &&
      item.status === 'Available'
  );

  const filteredItems = filteredMenuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) => (i._id === item._id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (_id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === _id) {
            const newQty = Math.max(0, item.qty + delta);
            return newQty === 0 ? null : { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (_id) => {
    setCart((prev) => prev.filter((item) => item._id !== _id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleSendToKitchen = async () => {
    if (!selectedReservation || cart.length === 0) return;

    setSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        menuItemId: item._id,
        name: item.name,
        price: Number(item.price),
        qty: item.qty,
      }));

      const itemsSummary = orderItems
        .map((i) => `${i.name}${i.qty > 1 ? ` x${i.qty}` : ''}`)
        .join(', ');

      const payload = {
        table: `Table ${selectedReservation.tableNumber}`,
        tableNumber: selectedReservation.tableNumber,
        waiter: user?.name || 'Waiter',
        type: activeTab === 'cafe' ? 'Cafe' : 'Bar',
        status: 'Pending',
        orderItems,
        items: itemsSummary,
        amount: `₹${cartTotal.toLocaleString('en-IN')}`,
        total: cartTotal,
        reservationId: selectedReservation._id,
      };
      if (selectedReservation.userId) {
        payload.userId = selectedReservation.userId;
      }

      await ordersAPI.create(payload);

      setCart([]);
      setSelectedReservationId('');
      alert('Order sent to kitchen successfully!');
      navigate('/admin/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send order to kitchen.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-pos-container">
      <Row className="g-4">
        <Col xs={12} lg={8}>
          <div className="d-page-header">
            <div>
              <div className="d-page-heading d-flex align-items-center gap-2">
                <MdReceipt /> New Order
              </div>
              <div className="d-page-sub">Select items for confirmed table bookings</div>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="d-btn-outline" onClick={() => navigate('/admin/orders')}>
                <MdHistory className="me-2" /> Recent Orders
              </button>
            </div>
          </div>

          <div className="d-pos-category-bar">
            {[
              { id: 'cafe', icon: <MdLocalCafe />, label: 'Café Menu' },
              { id: 'bar', icon: <MdLocalBar />, label: 'Bar Menu' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`d-pos-cat-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-8">
              <div className="d-pos-search-wrapper">
                <MdSearch className="text-muted" fontSize="1.2rem" />
                <input
                  type="text"
                  placeholder={`Search in ${activeTab} menu...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-pos-table-select">
                <MdTableRestaurant className="text-gold" fontSize="1.2rem" />
                <select
                  value={selectedReservationId}
                  onChange={(e) => setSelectedReservationId(e.target.value)}
                >
                  <option value="">Select Confirmed Table</option>
                  {confirmedTables.map((r) => (
                    <option key={r._id} value={r._id}>
                      Table {r.tableNumber} — {r.customerName} · {formatBookingDate(r.date)}
                      {r.isToday ? ' (Today)' : ''} · {r.guests} guests · {r.time}
                    </option>
                  ))}
                </select>
              </div>
              {confirmedTables.length === 0 && !loading && (
                <small className="text-muted d-block mt-1">
                  No confirmed bookings yet. In Admin → Reservations, set status to <strong>Confirmed</strong>, then click Refresh below.
                </small>
              )}
              <button
                type="button"
                className="d-btn-outline btn-sm mt-2 w-100"
                onClick={loadConfirmedTables}
                disabled={loading}
              >
                Refresh tables
              </button>
            </div>
          </div>

          <div className="d-pos-menu-grid">
            {loading ? (
              <div className="text-center py-5 w-100">Loading menu items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-5 w-100" style={{ color: 'var(--d-text-muted)' }}>
                No menu items available
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="d-pos-card"
                  onClick={() => addToCart(item)}
                  onKeyDown={(e) => e.key === 'Enter' && addToCart(item)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="d-pos-card-img-wrapper">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="d-pos-card-img" />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: `${item.color || '#2ecc71'}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2.5rem',
                          color: item.color || '#2ecc71',
                        }}
                      >
                        {activeTab === 'cafe' ? '🍽️' : '🍸'}
                      </div>
                    )}
                  </div>
                  <div className="d-pos-card-name">{item.name}</div>
                  <div className="d-pos-card-price">₹{item.price}</div>
                  <button type="button" className="d-pos-add-btn">
                    <MdAdd />
                  </button>
                </div>
              ))
            )}
          </div>
        </Col>

        <Col xs={12} lg={4}>
          <div className="d-pos-cart">
            <div className="d-pos-cart-header">
              <div className="d-section-title d-flex justify-content-between align-items-center mb-0">
                Order Summary
                {selectedReservation && (
                  <span className="d-chip d-chip-gold" style={{ fontSize: '0.7rem' }}>
                    TABLE {selectedReservation.tableNumber}
                  </span>
                )}
              </div>
              {selectedReservation && (
                <small className="text-muted d-block mt-1">
                  Guest: {selectedReservation.customerName}
                  {selectedReservation.userId ? ' · Linked account' : ''}
                </small>
              )}
            </div>

            <div className="d-pos-cart-items">
              {cart.length === 0 ? (
                <div className="text-center mt-5" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                    <MdShoppingCart />
                  </div>
                  <p style={{ fontWeight: 600 }}>Your cart is empty</p>
                  <small>Select items from the menu</small>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="d-pos-cart-item">
                    <div className="d-pos-item-info">
                      <div className="d-pos-item-name">{item.name}</div>
                      <div className="d-pos-item-price">₹{item.price}</div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-pos-qty-controls">
                        <button
                          type="button"
                          className="d-pos-qty-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQty(item._id, -1);
                          }}
                        >
                          <MdRemove />
                        </button>
                        <span className="d-pos-qty-val">{item.qty}</span>
                        <button
                          type="button"
                          className="d-pos-qty-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQty(item._id, 1);
                          }}
                        >
                          <MdAdd />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="d-pos-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item._id);
                        }}
                      >
                        <MdDeleteOutline fontSize="1rem" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="d-pos-cart-footer">
              <div className="d-pos-total-row">
                <span className="d-pos-total-label">Subtotal</span>
                <span className="fw-bold">₹{cartTotal}</span>
              </div>
              <div className="d-pos-total-row mb-4">
                <span className="d-pos-total-label" style={{ fontSize: '1.1rem', color: 'var(--d-primary)' }}>
                  Total Amount
                </span>
                <span className="d-pos-total-val">₹{cartTotal}</span>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="d-btn-outline flex-grow-1"
                  style={{ height: '52px', borderRadius: '12px' }}
                  onClick={() => setCart([])}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="d-btn-gold flex-grow-1"
                  style={{ height: '52px', borderRadius: '12px', fontWeight: 800 }}
                  disabled={cart.length === 0 || !selectedReservationId || submitting}
                  onClick={handleSendToKitchen}
                >
                  <MdSend className="me-2" fontSize="1.2rem" />
                  {submitting ? 'Sending...' : 'SEND TO KITCHEN'}
                </button>
              </div>
              {!selectedReservationId && cart.length > 0 && (
                <div className="text-danger mt-3 text-center fw-bold" style={{ fontSize: '0.8rem' }}>
                  <MdTableRestaurant className="me-1" /> Select a confirmed table to proceed
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <style>{`
        .d-pos-delete-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: rgba(231, 76, 60, 0.1);
          color: var(--d-danger);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .d-pos-delete-btn:hover {
          background: rgba(231, 76, 60, 0.2);
        }
      `}</style>
    </div>
  );
}
