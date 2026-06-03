import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdMoreVert, MdRefresh, MdLocalCafe, MdLocalBar, 
  MdAccessTime, MdPerson, MdReceipt 
} from 'react-icons/md';

const ORDERS = [
  { id: '#T-1021', table: 'Table 4', waiter: 'Raj',   items: 'Pasta, Wine x2',      type: 'Bar',  amount: '₹1,250', status: 'Served',     time: '2 min ago' },
  { id: '#T-1020', table: 'Table 7', waiter: 'Priya', items: 'Steak, Beer',          type: 'Bar',  amount: '₹980',   status: 'Preparing',  time: '8 min ago' },
  { id: '#T-1019', table: 'Bar',     waiter: 'Sam',   items: 'Mojito x3',            type: 'Bar',  amount: '₹750',   status: 'Served',     time: '14 min ago' },
  { id: '#T-1018', table: 'Table 2', waiter: 'Anita', items: 'Risotto, Water',       type: 'Cafe', amount: '₹620',   status: 'Pending',    time: '20 min ago' },
  { id: '#T-1017', table: 'Table 9', waiter: 'Raj',   items: 'Burger, Fries',        type: 'Cafe', amount: '₹540',   status: 'Cancelled',  time: '35 min ago' },
  { id: '#T-1016', table: 'Table 1', waiter: 'Priya', items: 'Soup, Salad, Dessert', type: 'Cafe', amount: '₹870',   status: 'Served',     time: '45 min ago' },
];

const STATUS_MAP = {
  Served:     'd-chip-green',
  Preparing:  'd-chip-gold',
  Pending:    'd-chip-blue',
  Cancelled:  'd-chip-red',
};

export default function Orders() {
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Preparing', 'Served', 'Cancelled'];
  const filtered = filter === 'All' ? ORDERS : ORDERS.filter(o => o.status === filter);

  const handleRefresh = () => {
    alert("Refreshing order feed...");
  };

  const handleNewKOT = () => {
    alert("Opening new Kitchen Order Ticket...");
  };

  const handleOrderAction = (orderId) => {
    alert(`Actions for order ${orderId}`);
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdReceipt /> Live Orders
          </div>
          <div className="d-page-sub">Real-time order management for Café & Bar</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline" onClick={handleRefresh}><MdRefresh /> Refresh Feed</button>
          <button className="d-btn-gold" onClick={handleNewKOT}><MdReceipt /> New KOT</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[['Active Orders', '4', 'd-gold'], ['Served Today', '128', 'd-green'], ['Cancelled', '2', 'd-red']].map(([l, v, c]) => (
          <Col key={l} xs={12} sm={4}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${c}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                <MdReceipt />
              </div>
              <div>
                <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>{v}</div>
                <div className="d-stat-label">{l}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button 
            key={s} 
            onClick={() => setFilter(s)} 
            style={{
              background: filter === s ? 'var(--d-primary)' : 'var(--d-white)',
              color: filter === s ? 'var(--d-white)' : 'var(--d-text-muted)',
              border: '1.5px solid var(--d-border)',
              borderRadius: 'var(--d-radius-md)',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'var(--d-transition)'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="d-card p-0 overflow-hidden">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Source</th>
                <th>Staff</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {o.type === 'Cafe' ? <MdLocalCafe className="text-success" /> : <MdLocalBar className="text-primary" />}
                      <span>{o.table}</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <MdPerson style={{ color: 'var(--d-text-light)' }} />
                      <span>{o.waiter}</span>
                    </div>
                  </td>
                  <td title={o.items}>
                    {o.items}
                  </td>
                  <td><strong>{o.amount}</strong></td>
                  <td><span className={`d-chip ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                  <td>
                    <div className="d-flex align-items-center gap-1" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>
                      <MdAccessTime /> {o.time}
                    </div>
                  </td>
                  <td>
                    <button className="d-navbar-icon-btn" onClick={() => handleOrderAction(o.id)}>
                      <MdMoreVert />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
