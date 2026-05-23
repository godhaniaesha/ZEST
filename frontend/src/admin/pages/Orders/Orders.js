import React, { useState } from 'react';
import { MdMoreVert, MdRefresh } from 'react-icons/md';

const ORDERS = [
  { id: '#T-1021', table: 'Table 4', waiter: 'Raj',   items: 'Pasta, Wine x2',      amount: '₹1,250', status: 'Served',     time: '2 min ago' },
  { id: '#T-1020', table: 'Table 7', waiter: 'Priya', items: 'Steak, Beer',          amount: '₹980',   status: 'Preparing',  time: '8 min ago' },
  { id: '#T-1019', table: 'Bar',     waiter: 'Sam',   items: 'Mojito x3',            amount: '₹750',   status: 'Served',     time: '14 min ago' },
  { id: '#T-1018', table: 'Table 2', waiter: 'Anita', items: 'Risotto, Water',       amount: '₹620',   status: 'Pending',    time: '20 min ago' },
  { id: '#T-1017', table: 'Table 9', waiter: 'Raj',   items: 'Burger, Fries',        amount: '₹540',   status: 'Cancelled',  time: '35 min ago' },
  { id: '#T-1016', table: 'Table 1', waiter: 'Priya', items: 'Soup, Salad, Dessert', amount: '₹870',   status: 'Served',     time: '45 min ago' },
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

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Orders</div>
          <div className="d-page-sub">Live table orders — {ORDERS.length} total today</div>
        </div>
        <button className="d-btn-outline"><MdRefresh /> Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            background: filter === s ? 'var(--d-primary)' : 'var(--d-bg-card)',
            color: filter === s ? 'var(--d-accent)' : 'var(--d-text-muted)',
            border: '1.5px solid var(--d-border)',
            borderRadius: 'var(--d-radius-sm)',
            padding: '6px 16px',
            fontFamily: 'Lato,sans-serif',
            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
            transition: 'var(--d-transition)'
          }}>{s}</button>
        ))}
      </div>

      <div className="d-card" style={{ padding: 0 }}>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Waiter</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><strong>{o.id}</strong></td>
                  <td>{o.table}</td>
                  <td>{o.waiter}</td>
                  <td style={{ color: 'var(--d-text-muted)', maxWidth: 180 }}>{o.items}</td>
                  <td><strong>{o.amount}</strong></td>
                  <td><span className={`d-chip ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.78rem' }}>{o.time}</td>
                  <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--d-text-muted)' }}><MdMoreVert /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}