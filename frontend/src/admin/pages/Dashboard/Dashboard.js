import React from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdTrendingUp, MdReceiptLong, MdPeople, MdStar,
  MdArrowUpward, MdArrowDownward, MdMoreVert
} from 'react-icons/md';

const STATS = [
  { icon: <MdTrendingUp />, color: 'd-gold',  value: '₹1,24,500', label: "Today's Revenue", change: '+12%', dir: 'up' },
  { icon: <MdReceiptLong />, color: 'd-blue',  value: '87',         label: 'Total Orders',   change: '+5%',  dir: 'up' },
  { icon: <MdPeople />,      color: 'd-green', value: '34',         label: 'Reservations',   change: '-2',   dir: 'down' },
  { icon: <MdStar />,        color: 'd-red',   value: '4.7',        label: 'Avg. Rating',    change: '+0.2', dir: 'up' },
];

const RECENT_ORDERS = [
  { id: '#T-1021', table: 'Table 4', items: 'Pasta, Wine x2', amount: '₹1,250', status: 'Served',  statusClass: 'd-chip-green' },
  { id: '#T-1020', table: 'Table 7', items: 'Steak, Beer',    amount: '₹980',   status: 'Preparing',statusClass: 'd-chip-gold' },
  { id: '#T-1019', table: 'Bar',     items: 'Mojito x3',      amount: '₹750',   status: 'Served',  statusClass: 'd-chip-green' },
  { id: '#T-1018', table: 'Table 2', items: 'Risotto, Water', amount: '₹620',   status: 'Pending', statusClass: 'd-chip-blue' },
  { id: '#T-1017', table: 'Table 9', items: 'Burger, Fries',  amount: '₹540',   status: 'Cancelled',statusClass: 'd-chip-red' },
];

export default function Dashboard() {
  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Good Evening 👋</div>
          <div className="d-page-sub">Here's what's happening at Breva today.</div>
        </div>
        <button className="d-btn-gold">+ New Order</button>
      </div>

      {/* Stats */}
      <Row className="g-3 mb-4">
        {STATS.map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${s.color}`}>{s.icon}</div>
              <div>
                <div className="d-stat-value">{s.value}</div>
                <div className="d-stat-label">{s.label}</div>
                <div className={`d-stat-change ${s.dir}`}>
                  {s.dir === 'up'
                    ? <MdArrowUpward style={{ verticalAlign: 'middle' }} />
                    : <MdArrowDownward style={{ verticalAlign: 'middle' }} />
                  } {s.change} vs yesterday
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Recent Orders */}
      <Row className="g-3">
        <Col xs={12} xl={8}>
          <div className="d-card">
            <div className="d-flex d-justify-content-between align-items-center mb-3">
              <div>
                <div className="d-section-title">Recent Orders</div>
                <div className="d-section-sub">Live updates from all tables</div>
              </div>
              <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                View All
              </button>
            </div>
            <div className="d-table-wrap">
              <table className="d-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id}>
                      <td><strong>{o.id}</strong></td>
                      <td>{o.table}</td>
                      <td style={{ color: 'var(--d-text-muted)' }}>{o.items}</td>
                      <td><strong>{o.amount}</strong></td>
                      <td><span className={`d-chip ${o.statusClass}`}>{o.status}</span></td>
                      <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-muted)' }}><MdMoreVert /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>

        <Col xs={12} xl={4}>
          <div className="d-card h-100">
            <div className="d-section-title">Table Status</div>
            <div className="d-section-sub">12 tables total</div>
            <div className="d-table-status-grid">
              {Array.from({ length: 12 }, (_, i) => {
                const statuses = ['occupied', 'occupied', 'free', 'occupied', 'free', 'reserved', 'occupied', 'free', 'occupied', 'free', 'occupied', 'reserved'];
                const s = statuses[i];
                const bg = s === 'occupied' ? 'rgba(231,76,60,0.1)' : s === 'reserved' ? 'rgba(52,152,219,0.1)' : 'rgba(46,204,113,0.1)';
                const color = s === 'occupied' ? 'var(--d-danger)' : s === 'reserved' ? 'var(--d-info)' : 'var(--d-success)';
                return (
                  <div key={i} style={{
                    background: bg,
                    border: `1.5px solid ${color}`,
                    borderRadius: 'var(--d-radius-sm)',
                    padding: '10px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--d-transition)'
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color, fontFamily: 'Lato,sans-serif' }}>T{i + 1}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[['Free','var(--d-success)'], ['Occupied','var(--d-danger)'], ['Reserved','var(--d-info)']].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Lato,sans-serif', fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
}