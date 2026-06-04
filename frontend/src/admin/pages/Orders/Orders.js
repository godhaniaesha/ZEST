import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdMoreVert, MdRefresh, MdLocalCafe, MdLocalBar,
  MdAccessTime, MdPerson, MdReceipt, MdEdit, MdDelete
} from 'react-icons/md';
import Pagination from '../../components/Pagination';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { ordersAPI } from '../../../api';

const ORDERS = [
  { id: '#T-1021', table: 'Table 4', waiter: 'Raj', items: 'Pasta, Wine x2', type: 'Bar', amount: '₹1,250', status: 'Served', time: '2 min ago' },
  { id: '#T-1020', table: 'Table 7', waiter: 'Priya', items: 'Steak, Beer', type: 'Bar', amount: '₹980', status: 'Preparing', time: '8 min ago' },
  { id: '#T-1019', table: 'Bar', waiter: 'Sam', items: 'Mojito x3', type: 'Bar', amount: '₹750', status: 'Served', time: '14 min ago' },
  { id: '#T-1018', table: 'Table 2', waiter: 'Anita', items: 'Risotto, Water', type: 'Cafe', amount: '₹620', status: 'Pending', time: '20 min ago' },
  { id: '#T-1017', table: 'Table 9', waiter: 'Raj', items: 'Burger, Fries', type: 'Cafe', amount: '₹540', status: 'Cancelled', time: '35 min ago' },
  { id: '#T-1016', table: 'Table 1', waiter: 'Priya', items: 'Soup, Salad, Dessert', type: 'Cafe', amount: '₹870', status: 'Served', time: '45 min ago' },
  { id: '#T-1015', table: 'Table 5', waiter: 'Sam', items: 'Tiramisu, Coffee', type: 'Cafe', amount: '₹450', status: 'Served', time: '50 min ago' },
  { id: '#T-1014', table: 'Table 8', waiter: 'Anita', items: 'Espresso Martini x2', type: 'Bar', amount: '₹760', status: 'Preparing', time: '55 min ago' },
  { id: '#T-1013', table: 'Table 3', waiter: 'Raj', items: 'Caesar Salad', type: 'Cafe', amount: '₹320', status: 'Served', time: '1 hour ago' },
  { id: '#T-1012', table: 'Table 6', waiter: 'Priya', items: 'Beef Tenderloin', type: 'Cafe', amount: '₹1,200', status: 'Served', time: '1.2 hours ago' },
  { id: '#T-1011', table: 'Bar', waiter: 'Sam', items: 'Old Fashioned', type: 'Bar', amount: '₹480', status: 'Served', time: '1.5 hours ago' },
  { id: '#T-1010', table: 'Table 10', waiter: 'Anita', items: 'Pizza, Wine', type: 'Bar', amount: '₹950', status: 'Pending', time: '1.8 hours ago' },
  { id: '#T-1009', table: 'Table 12', waiter: 'Raj', items: 'Fish and Chips', type: 'Cafe', amount: '₹680', status: 'Preparing', time: '2 hours ago' },
  { id: '#T-1008', table: 'Table 11', waiter: 'Priya', items: 'Mocktails x4', type: 'Bar', amount: '₹560', status: 'Served', time: '2.2 hours ago' },
  { id: '#T-1007', table: 'Table 4', waiter: 'Sam', items: 'Chocolate Cake', type: 'Cafe', amount: '₹350', status: 'Served', time: '2.5 hours ago' },
  { id: '#T-1006', table: 'Table 7', waiter: 'Anita', items: 'Gin Tonic x2', type: 'Bar', amount: '₹640', status: 'Cancelled', time: '2.8 hours ago' },
  { id: '#T-1005', table: 'Table 2', waiter: 'Raj', items: 'Bruschetta', type: 'Cafe', amount: '₹280', status: 'Served', time: '3 hours ago' },
  { id: '#T-1004', table: 'Table 9', waiter: 'Priya', items: 'Truffle Risotto', type: 'Cafe', amount: '₹680', status: 'Served', time: '3.2 hours ago' },
  { id: '#T-1003', table: 'Bar', waiter: 'Sam', items: 'Whiskey Sour', type: 'Bar', amount: '₹440', status: 'Preparing', time: '3.5 hours ago' },
  { id: '#T-1002', table: 'Table 1', waiter: 'Anita', items: 'Lobster Bisque', type: 'Cafe', amount: '₹520', status: 'Served', time: '3.8 hours ago' },
];

const STATUS_MAP = {
  Served: 'd-chip-green',
  Preparing: 'd-chip-gold',
  Pending: 'd-chip-blue',
  Cancelled: 'd-chip-red',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const itemsPerPage = 10;
  const statuses = ['All', 'Pending', 'Preparing', 'Served', 'Cancelled'];
  const orderData = orders.length > 0 ? orders : ORDERS;
  const filtered = filter === 'All' ? orderData : orderData.filter(o => o.status === filter);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    {
      name: 'type', label: 'Type', type: 'select', required: true, options: [
        { label: 'Cafe', value: 'Cafe' },
        { label: 'Bar', value: 'Bar' }
      ]
    },
    { name: 'amount', label: 'Amount', type: 'text', required: true },
    {
      name: 'status', label: 'Status', type: 'select', required: true, options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Preparing', value: 'Preparing' },
        { label: 'Served', value: 'Served' },
        { label: 'Cancelled', value: 'Cancelled' }
      ]
    },
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
              {(currentData.length > 0 ? currentData : filtered).map(o => (
                <tr key={o._id || o.id}>
                  <td><strong>{o.id}</strong></td>

                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {o.type === 'Cafe' ? (
                        <MdLocalCafe className="text-success" />
                      ) : (
                        <MdLocalBar className="text-primary" />
                      )}
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

                  <td>
                    <strong>{o.amount}</strong>
                  </td>

                  <td>
                    <span className={`d-chip ${STATUS_MAP[o.status]}`}>
                      {o.status}
                    </span>
                  </td>

                  <td>
                    <div
                      className="d-flex align-items-center gap-1"
                      style={{
                        color: 'var(--d-text-muted)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <MdAccessTime /> {o.time}
                    </div>
                  </td>

                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="d-navbar-icon-btn"
                        onClick={() => openEdit(o)}
                      >
                        <MdEdit />
                      </button>

                      <button
                        className="d-navbar-icon-btn"
                        onClick={() => openDelete(o)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
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
