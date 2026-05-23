import React from 'react';
import { MdWarning, MdAdd } from 'react-icons/md';

const STOCK = [
  { name: 'Arborio Rice',     unit: 'kg',  qty: 12,  min: 5,   status: 'Good' },
  { name: 'Beef Tenderloin',  unit: 'kg',  qty: 3,   min: 4,   status: 'Low' },
  { name: 'White Wine',       unit: 'btl', qty: 24,  min: 12,  status: 'Good' },
  { name: 'Coffee Beans',     unit: 'kg',  qty: 2,   min: 3,   status: 'Critical' },
  { name: 'Cream',            unit: 'L',   qty: 8,   min: 5,   status: 'Good' },
  { name: 'Mint Leaves',      unit: 'pkg', qty: 1,   min: 3,   status: 'Critical' },
  { name: 'Whiskey (JD)',     unit: 'btl', qty: 18,  min: 6,   status: 'Good' },
  { name: 'Pasta',            unit: 'kg',  qty: 6,   min: 4,   status: 'Good' },
];

const STATUS_CLASS = { Good: 'd-chip-green', Low: 'd-chip-gold', Critical: 'd-chip-red' };

export default function Inventory() {
  const critical = STOCK.filter(s => s.status === 'Critical').length;

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Inventory</div>
          <div className="d-page-sub">Monitor and manage stock levels</div>
        </div>
        <button className="d-btn-primary"><MdAdd /> Add Stock</button>
      </div>

      {critical > 0 && (
        <div style={{
          background: 'rgba(231,76,60,0.08)', border: '1.5px solid rgba(231,76,60,0.3)',
          borderRadius: 'var(--d-radius-md)', padding: '12px 18px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Lato,sans-serif',
          fontSize: '0.85rem', color: 'var(--d-danger)'
        }}>
          <MdWarning size={18} />
          <strong>{critical} items</strong>&nbsp;are critically low — restock immediately.
        </div>
      )}

      <div className="d-card" style={{ padding: 0 }}>
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Min. Required</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {STOCK.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{s.unit}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 6, borderRadius: 3,
                        background: 'var(--d-border)', overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min((s.qty / (s.min * 2)) * 100, 100)}%`,
                          height: '100%', borderRadius: 3,
                          background: s.status === 'Good' ? 'var(--d-success)' : s.status === 'Low' ? 'var(--d-warning)' : 'var(--d-danger)'
                        }} />
                      </div>
                      <strong>{s.qty}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{s.min}</td>
                  <td><span className={`d-chip ${STATUS_CLASS[s.status]}`}>{s.status}</span></td>
                  <td>
                    <button className="d-btn-outline" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>Reorder</button>
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