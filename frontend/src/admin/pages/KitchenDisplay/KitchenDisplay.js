import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  MdKitchen, MdTimer, MdCheckCircle, MdWarning, 
  MdNotificationsActive, MdHistory, MdRestaurantMenu,
  MdLocalBar, MdCoffee, MdArrowBack,
  MdFilterList, MdDoneAll, MdDragIndicator, MdMoreVert,
  MdRadioButtonUnchecked, MdCheckCircleOutline
} from 'react-icons/md';

const INITIAL_ORDERS = [
  { 
    id: '#K-102', 
    table: 'Table 4', 
    items: [
      { name: 'Cappuccino x2', status: 'pending' },
      { name: 'Butter Croissant x1', status: 'pending' }
    ], 
    startTime: new Date(Date.now() - 5 * 60000), 
    status: 'Preparing', 
    type: 'Cafe', 
    priority: 'Medium' 
  },
  { 
    id: '#K-103', 
    table: 'Table 7', 
    items: [
      { name: 'Old Fashioned x1', status: 'pending' },
      { name: 'Classic Mojito x1', status: 'pending' }
    ], 
    startTime: new Date(Date.now() - 2 * 60000), 
    status: 'New', 
    type: 'Bar', 
    priority: 'High' 
  },
  { 
    id: '#K-104', 
    table: 'Bar Counter', 
    items: [
      { name: 'Draft Beer x2', status: 'pending' }
    ], 
    startTime: new Date(Date.now() - 15 * 60000), 
    status: 'Delayed', 
    type: 'Bar', 
    priority: 'Urgent' 
  },
  { 
    id: '#K-105', 
    table: 'Table 2', 
    items: [
      { name: 'Truffle Risotto x1', status: 'pending' },
      { name: 'Caesar Salad x1', status: 'pending' }
    ], 
    startTime: new Date(Date.now() - 12 * 60000), 
    status: 'Preparing', 
    type: 'Kitchen', 
    priority: 'Medium' 
  },
];

const Timer = ({ startTime, isDelayed }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}m ${secs}s`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className={`d-timer-badge ${isDelayed ? 'warning' : ''}`}>
      <MdTimer /> {elapsed}
    </div>
  );
};

export default function KitchenDisplay() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const toggleItem = (orderId, itemIndex) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newItems = [...order.items];
        newItems[itemIndex].status = newItems[itemIndex].status === 'completed' ? 'pending' : 'completed';
        return { ...order, items: newItems };
      }
      return order;
    }));
  };

  const handleMarkReady = (id) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.type === filter);

  return (
    <div className="d-kot-page">
      {/* Page Header */}
      <div className="d-page-header">
        <div className="d-flex align-items-center gap-3">
          <button className="d-icon-btn" style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'white', border: '1.5px solid var(--d-border)' }} onClick={() => navigate('/admin/dashboard')}>
            <MdArrowBack fontSize="1.2rem" />
          </button>
          <div>
            <div className="d-page-heading">Kitchen Display System <span className="d-live-dot"></span></div>
            <div className="d-page-sub">Real-time Order Monitoring & Management</div>
          </div>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-urgent-badge">
            <MdNotificationsActive className="animate-pulse" />
            <span>{orders.filter(o => o.priority === 'Urgent').length} Urgent Orders</span>
          </div>
          <button className="d-btn-outline" style={{ borderRadius: '10px', height: '45px' }} onClick={() => navigate('/admin/reports')}>
            <MdHistory className="me-2" /> View History
          </button>
        </div>
      </div>

      {/* Filter and Clear Bar */}
      <div className="d-kds-filter-bar">
        <div className="d-flex gap-2">
          {[
            { id: 'All', icon: <MdFilterList />, label: 'All Orders' },
            { id: 'Kitchen', icon: <MdRestaurantMenu />, label: 'Kitchen' },
            { id: 'Bar', icon: <MdLocalBar />, label: 'Bar' },
            { id: 'Cafe', icon: <MdCoffee />, label: 'Cafe' }
          ].map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`d-filter-btn ${filter === cat.id ? 'active' : ''}`}
            >
              <span className="d-filter-icon">{cat.icon}</span>
              <span className="d-filter-label">{cat.label}</span>
            </button>
          ))}
        </div>
        <button className="d-btn-gold" style={{ borderRadius: '12px', height: '48px', padding: '0 25px', fontWeight: 800 }}>
          <MdDoneAll className="me-2" fontSize="1.2rem" /> Clear All Completed
        </button>
      </div>

      {/* KOT Grid */}
      <div className="d-kds-grid">
        {filteredOrders.map((order) => (
          <div key={order.id} className={`d-kot-card ${order.status === 'Delayed' ? 'delayed' : ''}`}>
            <div className={`d-kot-priority-bar d-kot-priority-${order.priority.toLowerCase()}`}></div>
            
            <div className="d-kot-header">
              <div className="d-kot-header-top">
                <div className="d-kot-table-name">
                  <span className="d-table-icon"><MdDragIndicator /></span>
                  {order.table}
                </div>
                <Timer startTime={order.startTime} isDelayed={order.status === 'Delayed'} />
              </div>
              <div className="d-flex align-items-center justify-content-between mt-1">
                <div className="d-kot-order-id">{order.id}</div>
                <span className={`d-chip ${
                  order.type === 'Cafe' ? 'd-chip-green' : 
                  order.type === 'Bar' ? 'd-chip-blue' : 
                  'd-chip-gold'
                }`} style={{ fontSize: '0.65rem' }}>
                  {order.type.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="d-kot-body">
              <div className="d-item-list-header">ITEMS TO PREPARE</div>
              {order.items.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`d-kot-item-box ${item.status === 'completed' ? 'completed' : ''}`}
                  onClick={() => toggleItem(order.id, idx)}
                >
                  <div className="d-item-check">
                    {item.status === 'completed' ? 
                      <MdCheckCircleOutline className="text-success" fontSize="1.4rem" /> : 
                      <MdRadioButtonUnchecked className="text-muted" fontSize="1.4rem" />
                    }
                  </div>
                  <span className="d-item-name">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="d-kot-footer">
              <button className="d-icon-btn" style={{ width: '42px', height: '42px', background: '#fff', border: '1.5px solid #eee' }}>
                <MdMoreVert fontSize="1.2rem" />
              </button>
              {order.priority === 'Urgent' && (
                <button className="d-btn-bump">
                  <MdWarning /> BUMP
                </button>
              )}
              <button 
                className="d-btn-gold flex-grow-1" 
                style={{ height: '42px', fontSize: '0.9rem', borderRadius: '10px' }}
                onClick={() => handleMarkReady(order.id)}
              >
                <MdCheckCircle className="me-2" /> Mark Ready
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .d-live-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #2ecc71;
          border-radius: 50%;
          margin-left: 10px;
          box-shadow: 0 0 0 rgba(46, 204, 113, 0.4);
          animation: d-pulse-green 2s infinite;
        }
        @keyframes d-pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        .d-kds-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          background: white;
          padding: 12px 20px;
          border-radius: 15px;
          border: 1.5px solid var(--d-border);
        }
        .d-filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 10px;
          font-weight: 600;
          color: var(--d-text-muted);
          transition: all 0.2s;
        }
        .d-filter-btn:hover {
          background: var(--d-accent-soft);
          color: var(--d-primary);
        }
        .d-filter-btn.active {
          background: var(--d-primary);
          color: white;
        }
        .d-filter-icon { font-size: 1.2rem; }
        .d-filter-label { font-size: 0.9rem; }
        
        .d-item-list-header {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--d-text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
          padding-left: 5px;
        }
        .d-item-name {
          font-weight: 700;
          font-size: 1rem;
          color: var(--d-primary);
        }
        .d-table-icon {
          color: var(--d-text-light);
          margin-right: 5px;
          display: flex;
          align-items: center;
        }
      `}</style>

    </div>
  );
}
