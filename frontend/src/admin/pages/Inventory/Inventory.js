import React, { useState } from 'react';
import { Row, Col, ProgressBar, Form } from 'react-bootstrap';
import { 
  MdWarning, MdAdd, MdSearch, MdInventory, 
  MdError, MdCheckCircle, MdEdit, MdDelete, MdHistory 
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';

const STOCK = [
  { id: 1, name: 'Arborio Rice',     unit: 'kg',  qty: 12,  min: 5,   status: 'Good' },
  { id: 2, name: 'Beef Tenderloin',  unit: 'kg',  qty: 3,   min: 4,   status: 'Low' },
  { id: 3, name: 'White Wine',       unit: 'btl', qty: 24,  min: 12,  status: 'Good' },
  { id: 4, name: 'Coffee Beans',     unit: 'kg',  qty: 2,   min: 3,   status: 'Critical' },
  { id: 5, name: 'Cream',            unit: 'L',   qty: 8,   min: 5,   status: 'Good' },
  { id: 6, name: 'Mint Leaves',      unit: 'pkg', qty: 1,   min: 3,   status: 'Critical' },
  { id: 7, name: 'Whiskey (JD)',     unit: 'btl', qty: 18,  min: 6,   status: 'Good' },
  { id: 8, name: 'Pasta',            unit: 'kg',  qty: 6,   min: 4,   status: 'Good' },
];

const STATUS_CLASS = { Good: 'd-chip-green', Low: 'd-chip-gold', Critical: 'd-chip-red' };

export default function Inventory() {
  const [stockList, setStockList] = useState(STOCK);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', unit: 'kg', qty: '', min: '' });

  const criticalCount = stockList.filter(s => s.status === 'Critical').length;
  const lowCount = stockList.filter(s => s.status === 'Low').length;

  const filtered = stockList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ name: '', unit: 'kg', qty: '', min: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({ name: item.name, unit: item.unit, qty: item.qty, min: item.min });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = () => {
    const qty = parseInt(formData.qty);
    const min = parseInt(formData.min);
    let status = 'Good';
    if (qty <= min / 2) status = 'Critical';
    else if (qty <= min) status = 'Low';

    if (currentItem) {
      setStockList(stockList.map(s => s.id === currentItem.id ? { ...s, ...formData, qty, min, status } : s));
    } else {
      const newId = stockList.length + 1;
      setStockList([...stockList, { id: newId, ...formData, qty, min, status }]);
    }
    setShowForm(false);
  };

  const confirmDelete = () => {
    setStockList(stockList.filter(s => s.id !== currentItem.id));
    setShowDelete(false);
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdInventory /> Stock & Inventory
          </div>
          <div className="d-page-sub">Monitor supplies for your kitchen and bar</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile"><MdHistory /> View Logs</button>
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> Add Stock</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Total Items', value: stockList.length, icon: <MdInventory />, color: 'd-gold' },
          { label: 'Low Stock', value: lowCount, icon: <MdWarning />, color: 'd-gold' },
          { label: 'Critical', value: criticalCount, icon: <MdError />, color: 'd-red' },
          { label: 'In Stock', value: stockList.length - criticalCount - lowCount, icon: <MdCheckCircle />, color: 'd-green' }
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
                      <button className="d-navbar-icon-btn" onClick={() => handleEdit(s)}><MdEdit /></button>
                      <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(s)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <FormModal 
        show={showForm} 
        onHide={() => setShowForm(false)} 
        title={currentItem ? "Update Stock" : "Add New Stock"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12} md={8}>
            <Form.Group>
              <Form.Label className="small fw-bold">Item Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Arborio Rice"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Unit</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="kg, L, btl, etc."
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Current Quantity</Form.Label>
              <Form.Control 
                type="number" 
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Minimum Level (Alert)</Form.Label>
              <Form.Control 
                type="number" 
                value={formData.min}
                onChange={(e) => setFormData({...formData, min: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      <DeleteModal 
        show={showDelete} 
        onHide={() => setShowDelete(false)} 
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
