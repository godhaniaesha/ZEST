import React, { useState } from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { 
  MdWarning, MdAdd, MdSearch, MdInventory, 
  MdError, MdCheckCircle, MdMoreVert, MdHistory 
} from 'react-icons/md';

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
  const [searchTerm, setSearchTerm] = useState('');
  const criticalCount = STOCK.filter(s => s.status === 'Critical').length;
  const lowCount = STOCK.filter(s => s.status === 'Low').length;

  const filtered = STOCK.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading">Stock & Inventory</div>
          <div className="d-page-sub">Monitor supplies for your kitchen and bar</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile"><MdHistory /> View Logs</button>
          <button className="d-btn-gold"><MdAdd /> Add Stock</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Total Items', value: STOCK.length, icon: <MdInventory />, color: 'd-gold' },
          { label: 'Low Stock', value: lowCount, icon: <MdWarning />, color: 'd-gold' },
          { label: 'Critical', value: criticalCount, icon: <MdError />, color: 'd-red' },
          { label: 'In Stock', value: STOCK.length - criticalCount - lowCount, icon: <MdCheckCircle />, color: 'd-green' }
        ].map((s, i) => (
          <Col key={i} xs={12} sm={6} xl={3}>
            <div className="d-stat-card">
              <div className={`d-stat-icon ${s.color}`} style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                {s.icon}
              </div>
              <div>
                <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                <div className="d-stat-label">{s.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div className="d-card mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-navbar-search-box m-0" style={{ width: '300px' }}>
            <MdSearch className="d-search-icon" />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <button className="d-btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Filter by Category</button>
          </div>
        </div>

        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Unit</th>
                <th>Stock Level</th>
                <th>Min. Level</th>
                <th>Status</th>
                <th style={{ width: '120px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>{s.unit}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3" style={{ minWidth: '150px' }}>
                      <ProgressBar 
                        now={Math.min((s.qty / (s.min * 2)) * 100, 100)} 
                        variant={s.status === 'Good' ? 'success' : s.status === 'Low' ? 'warning' : 'danger'}
                        style={{ height: '6px', flexGrow: 1 }}
                      />
                      <strong style={{ minWidth: '30px', textAlign: 'right' }}>{s.qty}</strong>
                    </div>
                  </td>
                  <td style={{ color: 'var(--d-text-muted)' }}>{s.min} {s.unit}</td>
                  <td><span className={`d-chip ${STATUS_CLASS[s.status]}`}>{s.status}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="d-btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Update</button>
                      <button className="d-navbar-icon-btn" style={{ width: '28px', height: '28px' }}><MdMoreVert /></button>
                    </div>
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