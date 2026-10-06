import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Badge } from 'react-bootstrap';
import {
  MdSearch, MdLocalCafe, MdLocalBar, MdTableRestaurant,
  MdAdd, MdRemove, MdDeleteOutline, MdSend, MdHistory,
  MdReceipt, MdShoppingCart
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { menuAPI, reservationsAPI, ordersAPI, tablesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const ACTIVE_RESERVATION_STATUSES = ['Pending', 'Confirmed', 'Completed'];

const isActiveReservation = (reservation) =>
  ACTIVE_RESERVATION_STATUSES.includes(reservation.status) &&
  !(reservation.status === 'Completed' && reservation.fullPaymentDone);

export default function TakeOrder() {
  const [activeTab, setActiveTab] = useState('cafe'); // 'cafe' or 'bar'
  const [selectedTable, setSelectedTable] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const alertedReservations = useRef(new Set());

  const itemHasType = (item, target) => {
    const types = Array.isArray(item?.type) ? item.type : item?.type ? [item.type] : [];
    return types.includes(target);
  };

  useEffect(() => {
    let mounted = true;

    const refreshTables = async () => {
      try {
        const tablesRes = await tablesAPI.getAll();
        if (!mounted) return;

        const allTables = Array.isArray(tablesRes.data) ? tablesRes.data : [];
        let activeReservations = [];
        try {
          const resRes = await reservationsAPI.getAll();
          activeReservations = Array.isArray(resRes.data)
            ? resRes.data.filter(isActiveReservation)
            : [];
        } catch {
          // Reservations are not available to every staff role.
        }
        if (!mounted) return;

        const entries = allTables.map((table) => {
          const displayId = table.displayId
            || `${table.type === 'Bar' ? 'B' : 'C'}-${String(table.number).padStart(2, '0')}`;
          const activeReservation = activeReservations.find((reservation) => {
            const reservationTableId = reservation.table?._id || reservation.table;
            return String(reservationTableId) === String(table._id);
          });
          const reservation = table.status === 'Reserved' ? activeReservation : null;

          return {
            tableId: table._id,
            displayId,
            capacity: table.capacity,
            type: table.type,
            location: table.location,
            status: table.status,
            reservation: reservation || null,
            value: table._id,
            label: `${displayId} — ${table.capacity} seats (${table.status})${reservation ? ` · ${reservation.customerName} (${reservation.guests} guests)` : ''}`,
          };
        });

        const tableById = new Map(allTables.map((table) => [String(table._id), table]));
        activeReservations.forEach((reservation) => {
          const reservationTableId = reservation.table?._id || reservation.table;
          const table = tableById.get(String(reservationTableId));
          if (
            !reservation.reservationAlertDue ||
            !table ||
            table.status !== 'Reserved' ||
            alertedReservations.current.has(String(reservation._id))
          ) {
            return;
          }

          alertedReservations.current.add(String(reservation._id));
          const displayId = table.displayId
            || `${table.type === 'Bar' ? 'B' : 'C'}-${String(table.number).padStart(2, '0')}`;
          window.alert(
            `Online reservation for ${displayId} (${reservation.customerName}) starts at ${reservation.time}. The table is now Reserved.`
          );
        });

        setReservations(entries);
      } catch (error) {
        console.error('Error refreshing tables and reservations:', error);
      }
    };

    const loadData = async () => {
      try {
        const menuRes = await menuAPI.getAll();
        if (mounted) setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
        await refreshTables();
      } catch (error) {
        console.error('Error loading menu:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const refreshId = setInterval(refreshTables, 15000);

    return () => {
      mounted = false;
      clearInterval(refreshId);
    };
  }, []);

  const filteredMenuItems = menuItems.filter(item => 
    itemHasType(item, activeTab === 'cafe' ? 'Cafe' : 'Bar') &&
    item.status === 'Available'
  );
  
  const filteredItems = filteredMenuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id);
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (_id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id === _id) {
        const newQty = Math.max(0, item.qty + delta);
        return newQty === 0 ? null : { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (_id) => {
    setCart(prev => prev.filter(item => item._id !== _id));
  };

  const handleSendToKitchen = async () => {
    if (cart.length === 0 || !selectedTable) return;

    const entry = reservations.find(e => e.tableId === selectedTable);
    const tableLabel = entry?.displayId || selectedTable;
    const tableId = entry?.tableId;

    const orderData = {
      id: `ORD-${Date.now()}`,
      table: tableLabel,
      tableId: tableId, // Add table ID for status updates
      waiter: user?.name || 'Staff',
      items: cart.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
        menuItemId: item._id
      })),
      type: activeTab === 'cafe' ? 'Dine-in' : 'Bar',
      amount: Number(cartTotal),
      status: 'Pending',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userId: user?._id,
      // Use reservation _id if available, otherwise null
      reservationId: entry?.reservation ? entry.reservation._id : null,
    };

    try {
      // Create order
      await ordersAPI.create(orderData);

      // Update table status to Occupied
      if (tableId) {
        await tablesAPI.update(tableId, { status: 'Occupied' });
      }

      alert('Order sent to kitchen successfully!');
      setCart([]);
      setSelectedTable('');
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to send order to kitchen');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="d-pos-container">
      <Row className="g-4">
        {/* Left Side: Menu Selection */}
        <Col lg={12} xl={8}>
          <div className="d-page-header">
            <div>
            <div className="d-page-heading d-flex align-items-center gap-2">
              <MdReceipt /> New Order
            </div>
            <div className="d-page-sub">Select items for the customer</div>
          </div>
            <div className="d-flex gap-2">
              <button className="d-btn-outline" onClick={() => navigate('/admin/orders')}>
                <MdHistory className="me-2" /> Recent Orders
              </button>
            </div>
          </div>

          <div className="d-pos-category-bar">
            {[
              { id: 'cafe', icon: <MdLocalCafe />, label: 'Café Menu' },
              { id: 'bar', icon: <MdLocalBar />, label: 'Bar Menu' }
            ].map(tab => (
              <button 
                key={tab.id}
                className={`d-pos-cat-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
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
            <div className="col-md-6">
              <div className="d-pos-table-select">
                <MdTableRestaurant className="text-gold" fontSize="1.2rem" />
                <select 
                  value={selectedTable} 
                  onChange={(e) => setSelectedTable(e.target.value)}
                >
                  <option className='d_cnf_tbl' value="">
                    {loading ? 'Loading tables…' : reservations.length === 0 ? 'No tables available' : 'Select Table'}
                  </option>
                  {reservations.map(entry => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
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
                <div key={item._id} className="d-pos-card" onClick={() => addToCart(item)}>
                  <div className="d-pos-card-img-wrapper">
                    {item.img ? (
                      <img src={item.img} alt={item.name} className="d-pos-card-img" />
                    ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        background: `${item.color || '#2ecc71'}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem', 
                        color: item.color || '#2ecc71' 
                      }}>
                        {activeTab === 'cafe' ? '🍽️' : '🍸'}
                      </div>
                    )}
                  </div>
                  <div className="d-pos-card-name">{item.name}</div>
                  <div className="d-pos-card-price">₹{item.price}</div>
                  <button className="d-pos-add-btn"><MdAdd /></button>
                </div>
              ))
            )}
          </div>
        </Col>

        {/* Right Side: Order Summary / Cart */}
        <Col lg={12} xl={4}>
          <div className="d-pos-cart">
            <div className="d-pos-cart-header">
              <div className="d-section-title d-flex justify-content-between align-items-center mb-0">
                Order Summary
                {selectedTable && (() => {
                  const entry = reservations.find(e => e.value === selectedTable);
                  return (
                    <span className="d-chip d-chip-gold" style={{ fontSize: '0.7rem' }}>
                      {(entry?.displayId || selectedTable).toUpperCase()}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="d-pos-cart-items">
              {cart.length === 0 ? (
                <div className="text-center mt-5" style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}><MdShoppingCart /></div>
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
                        <button className="d-pos-qty-btn" onClick={(e) => { e.stopPropagation(); updateQty(item._id, -1); }}><MdRemove /></button>
                        <span className="d-pos-qty-val">{item.qty}</span>
                        <button className="d-pos-qty-btn" onClick={(e) => { e.stopPropagation(); updateQty(item._id, 1); }}><MdAdd /></button>
                      </div>
                      <button 
                        className="d-pos-delete-btn" 
                        onClick={(e) => { e.stopPropagation(); removeFromCart(item._id); }}
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
                <span className="d-pos-total-label" style={{ fontSize: '1.1rem', color: 'var(--d-primary)' }}>Total Amount</span>
                <span className="d-pos-total-val">₹{cartTotal}</span>
              </div>
              
              <div className="d-flex gap-2">
                {/* <button className="d-btn-outline flex-grow-1" style={{ height: '52px', borderRadius: '12px' }}>
                  Hold
                </button> */}
                <button 
                  className="d-btn-outline flex-grow-1" 
                  style={{ height: '50px', borderRadius: '12px', fontWeight: 800 }}
                  disabled={cart.length === 0 || !selectedTable}
                  onClick={handleSendToKitchen}
                >
                  <MdSend className="me-2" fontSize="1.2rem" /> SEND TO KITCHEN
                </button>
              </div>
              {!selectedTable && cart.length > 0 && (
                <div className="text-danger mt-3 text-center fw-bold" style={{ fontSize: '0.8rem' }}>
                  <MdTableRestaurant className="me-1" /> Please select a table to proceed
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
      <style jsx>{`
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
