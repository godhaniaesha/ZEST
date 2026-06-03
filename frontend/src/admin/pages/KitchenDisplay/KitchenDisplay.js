import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  MdKitchen, MdTimer, MdCheckCircle, MdWarning,
  MdNotificationsActive, MdHistory, MdRestaurantMenu,
  MdLocalBar, MdCoffee, MdArrowBack,
  MdFilterList, MdDoneAll, MdDragIndicator, MdMoreVert,
  MdRadioButtonUnchecked, MdCheckCircleOutline, MdClose
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

  const handleClearAll = () => {
    setOrders(orders.filter(o => !o.items.every(item => item.status === 'completed')));
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.type === filter);

  return (
    <div className="d-kot-page">
      {/* Page Header */}
      <div className="d-page-header">
        <div className="d-flex align-items-center gap-3">
          <button
            className="d-icon-btn"
            onClick={() => navigate('/admin/dashboard')}
          >
            <MdArrowBack fontSize="1.2rem" />
          </button>
          <div>
            <div className="d-page-heading d-flex align-items-center gap-2">
              <MdKitchen /> Kitchen Display System <span className="d-live-dot"></span>
            </div>
            <div className="d-page-sub">Real-time Order Monitoring & Management</div>
          </div>
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="d-urgent-badge">
            <MdNotificationsActive className="animate-pulse" />
            <span>{orders.filter(o => o.priority === 'Urgent').length} Urgent Orders</span>
          </div>
          <button
            className="d-btn-outline"
            onClick={() => navigate('/admin/reports')}
          >
            <MdHistory className="me-2" /> View History
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="d-kds-filter-bar">
        <div className="d-kds-filters">
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
        <button
          className="d-btn-clear-all"
          onClick={handleClearAll}
        >
          <MdDoneAll className="me-2" /> Clear All Completed
        </button>
      </div>

      {/* Orders Grid */}
      <div className="d-kds-orders-container">
        {filteredOrders.length === 0 ? (
          <div className="d-empty-state">
            <MdKitchen fontSize="3rem" />
            <p>No orders to display</p>
          </div>
        ) : (
          <Row className="g-3">
            {filteredOrders.map((order) => (
              <Col key={order.id} xs={12} sm={6} lg={4} xl={3}>
                <div className={`d-kot-card ${order.status === 'Delayed' ? 'delayed' : ''}`}>
                  {/* Priority Indicator */}
                  <div className={`d-kot-priority-indicator priority-${order.priority.toLowerCase()}`}></div>

                  {/* Card Header */}
                  <div className="d-kot-card-header">
                    <div className="d-kot-card-header-top">
                      <div className="d-kot-table-info">
                        <span className="d-table-icon"><MdDragIndicator /></span>
                        <span className="d-kot-table-name">{order.table}</span>
                      </div>
                      <Timer startTime={order.startTime} isDelayed={order.status === 'Delayed'} />
                    </div>
                    <div className="d-kot-card-header-bottom">
                      <span className="d-kot-order-id">{order.id}</span>
                      <span className={`d-kot-type-badge type-${order.type.toLowerCase()}`}>
                        {order.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Card Body - Items */}
                  <div className="d-kot-card-body">
                    <div className="d-kot-items-header">ITEMS TO PREPARE</div>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`d-kot-item ${item.status === 'completed' ? 'completed' : ''}`}
                        onClick={() => toggleItem(order.id, idx)}
                      >
                        <div className="d-kot-item-check">
                          {item.status === 'completed' ?
                            <MdCheckCircleOutline className="text-success" fontSize="1.3rem" /> :
                            <MdRadioButtonUnchecked className="text-muted" fontSize="1.3rem" />
                          }
                        </div>
                        <span className="d-kot-item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="d-kot-card-footer">
                    <button className="d-kot-action-btn d-kot-btn-more">
                      <MdMoreVert fontSize="1.1rem" />
                    </button>
                    {order.priority === 'Urgent' && (
                      <button className="d-kot-action-btn d-kot-btn-bump">
                        <MdWarning fontSize="1rem" /> BUMP
                      </button>
                    )}
                    <button
                      className="d-kot-action-btn d-kot-btn-ready"
                      onClick={() => handleMarkReady(order.id)}
                    >
                      <MdCheckCircle className="me-1" /> Mark Ready
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <style jsx>{`
        .d-kot-page {
          padding: 20px;
          background: #f5f7fa;
          min-height: auto;
          overflow-x: hidden;
        }

        /* Header Styles */
        .d-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .d-icon-btn {
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: white;
          border: 1.5px solid var(--d-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .d-icon-btn:hover {
          background: var(--d-accent-soft);
          border-color: var(--d-primary);
        }

        .d-page-heading {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--d-primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .d-page-sub {
          font-size: 0.85rem;
          color: var(--d-text-muted);
          margin-top: 2px;
        }

        .d-live-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #2ecc71;
          border-radius: 50%;
          animation: d-pulse-green 2s infinite;
        }

        @keyframes d-pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .d-urgent-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #fee;
          border: 1.5px solid #fcc;
          border-radius: 10px;
          color: #c33;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .d-btn-outline {
          padding: 10px 20px;
          border: 1.5px solid var(--d-border);
          border-radius: 10px;
          background: white;
          color: var(--d-text-muted);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .d-btn-outline:hover {
          background: var(--d-accent-soft);
          border-color: var(--d-primary);
          color: var(--d-primary);
        }

        /* Filter Bar */
        .d-kds-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          background: white;
          padding: 15px 20px;
          border-radius: 12px;
          border: 1.5px solid var(--d-border);
          flex-wrap: wrap;
          gap: 15px;
        }

        .d-kds-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .d-filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 10px;
          font-weight: 600;
          color: var(--d-text-muted);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .d-filter-btn:hover {
          background: var(--d-accent-soft);
          color: var(--d-primary);
        }

        .d-filter-btn.active {
          background: var(--d-primary);
          color: white;
        }

        .d-filter-icon {
          font-size: 1.1rem;
        }

        .d-filter-label {
          font-size: 0.85rem;
        }

        .d-btn-clear-all {
          padding: 10px 20px;
          background: var(--d-gold);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .d-btn-clear-all:hover {
          background: var(--d-primary);
        }

        /* Orders Container */
        .d-kds-orders-container {
          margin-top: 20px;
        }

        .d-empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--d-text-muted);
        }

        .d-empty-state p {
          margin-top: 15px;
          font-size: 1rem;
          font-weight: 600;
        }

        /* KOT Card */
        .d-kot-card {
          background: white;
          border-radius: 12px;
          border: 1.5px solid var(--d-border);
          overflow: hidden;
          position: relative;
          transition: all 0.2s;
          height: 100%;
        }

        .d-kot-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .d-kot-card.delayed {
          border-color: #e74c3c;
          box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
        }

        .d-kot-priority-indicator {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
        }

        .d-kot-priority-indicator.priority-urgent {
          background: #e74c3c;
        }

        .d-kot-priority-indicator.priority-high {
          background: #f39c12;
        }

        .d-kot-priority-indicator.priority-medium {
          background: #3498db;
        }

        .d-kot-priority-indicator.priority-low {
          background: #2ecc71;
        }

        /* Card Header */
        .d-kot-card-header {
          padding: 15px;
          border-bottom: 1px solid var(--d-border);
        }

        .d-kot-card-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .d-kot-table-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .d-table-icon {
          color: var(--d-text-light);
        }

        .d-kot-table-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--d-primary);
        }

        .d-timer-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          background: var(--d-accent-soft);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--d-primary);
        }

        .d-timer-badge.warning {
          background: #fee;
          color: #c33;
        }

        .d-kot-card-header-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .d-kot-order-id {
          font-weight: 800;
          font-size: 0.85rem;
          color: var(--d-text-muted);
        }

        .d-kot-type-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .d-kot-type-badge.type-cafe {
          background: #d4edda;
          color: #155724;
        }

        .d-kot-type-badge.type-bar {
          background: #cce5ff;
          color: #004085;
        }

        .d-kot-type-badge.type-kitchen {
          background: #fff3cd;
          color: #856404;
        }

        /* Card Body */
        .d-kot-card-body {
          padding: 15px;
        }

        .d-kot-items-header {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--d-text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }

        .d-kot-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 8px;
        }

        .d-kot-item:hover {
          background: var(--d-accent-soft);
        }

        .d-kot-item.completed {
          opacity: 0.5;
          text-decoration: line-through;
        }

        .d-kot-item-check {
          flex-shrink: 0;
        }

        .d-kot-item-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--d-primary);
        }

        /* Card Footer */
        .d-kot-card-footer {
          display: flex;
          gap: 8px;
          padding: 12px 15px;
          border-top: 1px solid var(--d-border);
        }

        .d-kot-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .d-kot-btn-more {
          background: #f8f9fa;
          border: 1.5px solid #e9ecef;
          color: var(--d-text-muted);
          flex-shrink: 0;
        }

        .d-kot-btn-more:hover {
          background: var(--d-accent-soft);
          border-color: var(--d-primary);
        }

        .d-kot-btn-bump {
          background: #fff3cd;
          color: #856404;
          flex-shrink: 0;
        }

        .d-kot-btn-bump:hover {
          background: #ffe69c;
        }

        .d-kot-btn-ready {
          background: var(--d-gold);
          color: white;
          flex-grow: 1;
        }

        .d-kot-btn-ready:hover {
          background: var(--d-primary);
        }

        /* Responsive Styles */
        @media (max-width: 992px) {
          .d-page-heading {
            font-size: 1.3rem;
          }
        }

        @media (max-width: 768px) {
          .d-kot-page {
            padding: 15px;
          }

          .d-page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .d-page-header > div:first-child {
            flex-direction: column;
            align-items: flex-start;
          }

          .d-page-header > div:last-child {
            flex-direction: column;
            align-items: stretch;
          }

          .d-kds-filter-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 15px;
          }

          .d-kds-filters {
            justify-content: center;
          }

          .d-filter-btn {
            flex: 1;
            justify-content: center;
            min-width: calc(50% - 5px);
          }

          .d-btn-clear-all {
            width: 100%;
          }

          .d-urgent-badge {
            justify-content: center;
          }

          .d-btn-outline {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .d-filter-btn {
            min-width: 100%;
          }

          .d-page-heading {
            font-size: 1.1rem;
          }

          .d-kot-card-header,
          .d-kot-card-body,
          .d-kot-card-footer {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
