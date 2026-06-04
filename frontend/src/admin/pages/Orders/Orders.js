import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { 
  MdMoreVert, MdRefresh, MdLocalCafe, MdLocalBar, 
  MdAccessTime, MdPerson, MdReceipt, MdEdit, MdDelete
} from 'react-icons/md';
import { ordersAPI } from '../../../api';
import FormModal from '../../components/FormModal';
import DeleteModal from '../../components/DeleteModal';

const STATUS_MAP = {
  Served:     'd-chip-green',
  Preparing:  'd-chip-gold',
  Pending:    'd-chip-blue',
  Cancelled:  'd-chip-red',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const statuses = ['All', 'Pending', 'Preparing', 'Served', 'Cancelled'];
  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const loadData = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (formData) => {
    try {
      if (currentItem) {
        await ordersAPI.update(currentItem._id, formData);
      } else {
        await ordersAPI.create(formData);
      }
      loadData();
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await ordersAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (item) => {
    setCurrentItem(item);
    setShowForm(true);
  };

  const openDelete = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const formFields = [
    { name: 'id', label: 'Order ID', type: 'text', required: true },
    { name: 'table', label: 'Table', type: 'text', required: true },
    { name: 'waiter', label: 'Waiter', type: 'text', required: true },
    { name: 'items', label: 'Items', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { label: 'Cafe', value: 'Cafe' },
      { label: 'Bar', value: 'Bar' }
    ]},
    { name: 'amount', label: 'Amount', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Preparing', value: 'Preparing' },
      { label: 'Served', value: 'Served' },
      { label: 'Cancelled', value: 'Cancelled' }
    ]},
    { name: 'time', label: 'Time', type: 'text', required: true }
  ];

  const stats = {
    active: orders.filter(o => ['Pending', 'Preparing'].includes(o.status)).length,
    served: orders.filter(o => o.status === 'Served').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length
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
          <button className="d-btn-outline" onClick={loadData}><MdRefresh /> Refresh Feed</button>
          <button className="d-btn-gold" onClick={() => { setCurrentItem(null); setShowForm(true); }}>
            <MdReceipt /> New KOT
          </button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          ['Active Orders', stats.active, 'd-gold'],
          ['Served Today', stats.served, 'd-green'],
          ['Cancelled', stats.cancelled, 'd-red']
        ].map(([l, v, c]) => (
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
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">Loading orders...</td>
                </tr>
              ) : (
                filtered.map(o => (
                  <tr key={o._id}>
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
                    <td title={o.items}>{o.items}</td>
                    <td><strong>{o.amount}</strong></td>
                    <td><span className={`d-chip ${STATUS_MAP[o.status]}`}>{o.status}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-1" style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }}>
                        <MdAccessTime /> {o.time}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="d-navbar-icon-btn" onClick={() => openEdit(o)}>
                          <MdEdit />
                        </button>
                        <button className="d-navbar-icon-btn" onClick={() => openDelete(o)}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        title={currentItem ? 'Edit Order' : 'New KOT'}
        initialData={currentItem || {}}
        fields={formFields}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={handleDelete}
        itemName={currentItem?.id}
      />
    </>
  );
}
