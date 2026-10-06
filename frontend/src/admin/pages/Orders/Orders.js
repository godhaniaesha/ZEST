import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Modal } from 'react-bootstrap';
import {
  MdLocalCafe, MdLocalBar,
  MdPerson, MdReceipt, MdDelete, MdVisibility
} from 'react-icons/md';
import Pagination from '../../components/Pagination';
import DeleteModal from '../../components/DeleteModal';
import { ordersAPI, tablesAPI } from '../../../api';
import { useAuth } from '../../../contexts/AuthContext';

const STATUS_MAP = {
  Pending: 'd-chip-blue',
  Paid: 'd-chip-green',
  Cancelled: 'd-chip-red',
  Completed: 'd-chip-gray'
};

const ITEM_STATUS_MAP = {
  Pending: 'd-chip-blue',
  Preparing: 'd-chip-gold',
  Ready: 'd-chip-gray',
  Served: 'd-chip-green',
};

const getOrderDateKey = (createdAt) => {
  if (!createdAt) return '';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatOrderDate = (createdAt) => {
  const date = createdAt ? new Date(createdAt) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
};

const formatOrderTime = (createdAt) => {
  const date = createdAt ? new Date(createdAt) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const itemsPerPage = 10;
  const statuses = ['All', 'Pending', 'Paid', 'Completed', 'Cancelled'];
  const filtered = orders.filter((order) => {
    const matchesStatus = filter === 'All' || order.status === filter;
    const matchesDate = !dateFilter || getOrderDateKey(order.createdAt) === dateFilter;
    return matchesStatus && matchesDate;
  });
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { user } = useAuth();
  const userRole = user?.role || 'waiter';
  const canDelete = userRole === 'manager' || userRole === 'superadmin';

  const loadData = async () => {
    try {
      const response = await ordersAPI.getAll();
      const sortedOrders = (response.data || []).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleItemStatusUpdate = async (orderId, itemId, newStatus) => {
    try {
      await ordersAPI.updateItemStatus(orderId, itemId, {
        status: newStatus
      });

      // If item is marked as Served, check if all items in the order are served
      // If yes, update table status to Reserved
      if (newStatus === 'Served') {
        // Reload data to get updated item statuses
        const response = await ordersAPI.getAll();
        const updatedOrders = response.data;
        const order = updatedOrders.find(o => o._id === orderId);

        if (order && order.tableId) {
          const allServed = order.items.every(item => item.status === 'Served');
          if (allServed) {
            await tablesAPI.update(order.tableId, { status: 'Reserved' });
          }
        }
      }

      // Reload orders to reflect the update
      loadData();
    } catch (err) {
      console.error('Error updating item status:', err);
    }
  };


  const handleDelete = async () => {
    try {
      // Now we use MongoDB _id for deletes too!
      await ordersAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (err) {
      console.error(err);
    }
  };

  const openDelete = (item) => {
    if (!canDelete) {
      alert('You do not have permission to delete orders');
      return;
    }
    setCurrentItem(item);
    setShowDelete(true);
  };

  const stats = {
    active: orders.filter(o => o.status === 'Pending').length,
    served: orders.filter(o => o.status === 'Paid').length,
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
            onClick={() => {
              setFilter(s);
              setCurrentPage(1);
            }}
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
        <Form.Control
          type="date"
          aria-label="Filter orders by date"
          value={dateFilter}
          onChange={(event) => {
            setDateFilter(event.target.value);
            setCurrentPage(1);
          }}
          style={{ width: 'auto', minWidth: '170px' }}
        />
        {dateFilter && (
          <button
            type="button"
            className="d-btn-outline"
            onClick={() => {
              setDateFilter('');
              setCurrentPage(1);
            }}
          >
            Clear date
          </button>
        )}
      </div>

      <div className="d-card p-0 overflow-hidden orders-history-card">
        <div className="orders-history-toolbar">
          <div>
            <div className="orders-history-title">Order details</div>
            <div className="orders-history-subtitle">
              {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
              {dateFilter ? ` on ${formatOrderDate(`${dateFilter}T12:00:00`)}` : ''}
              {filter !== 'All' ? ` · ${filter}` : ''}
            </div>
          </div>
          <div className="orders-history-page-size">
            {filtered.length > 0
              ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filtered.length)} of ${filtered.length}`
              : 'No results'}
          </div>
        </div>
        <div className="d-table-wrap">
          <table className="d-table orders-history-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Source</th>
                <th>Staff</th>
                <th>Items</th>
                <th>Qty</th>
                <th>Item Status</th>
                <th>Amount</th>
                <th>Payment Status</th>

                <th style={{ width: canDelete ? "120px" : "80px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    Loading orders...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4">
                    No orders found for the selected filters.
                  </td>
                </tr>
              ) : currentData.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                const itemStatuses = [...new Set(items.map((item) => item.status || 'Pending'))];
                const totalQuantity = items.reduce((total, item) => total + (Number(item.qty) || 0), 0);

                return (
                  <tr key={order._id} className="order-group-start order-group-end">
                    <td><span className="order-id-badge">#{order.id}</span></td>
                    <td>
                      <div className="order-date-cell">
                        <strong>{formatOrderDate(order.createdAt)}</strong>
                        <span>{formatOrderTime(order.createdAt)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="order-source-cell">
                        <span className={`order-source-icon ${order.type === 'Cafe' ? 'cafe' : 'bar'}`}>
                          {order.type === "Cafe" ? <MdLocalCafe /> : <MdLocalBar />}
                        </span>
                        <div>
                          <strong>{order.table || '—'}</strong>
                          <span>{order.type === 'Bar' ? 'Bar' : 'Café'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <MdPerson style={{ color: "var(--d-text-light)" }} />
                        <span>{order.waiter || '—'}</span>
                      </div>
                    </td>
                    <td>
                      {items.length ? (
                        <div className="order-items-summary">
                          {items.slice(0, 2).map((item, index) => (
                            <span key={item._id || `${item.name}-${index}`}>{item.name}</span>
                          ))}
                          {items.length > 2 && <span className="text-muted">+{items.length - 2} more</span>}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {items.length ? <span className="order-qty-badge">{totalQuantity}</span> : '—'}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {itemStatuses.length
                          ? itemStatuses.map((status) => (
                            <span key={status} className={`d-chip ${ITEM_STATUS_MAP[status] || 'd-chip-gray'}`}>
                              {status}
                            </span>
                          ))
                          : '—'}
                      </div>
                    </td>
                    <td>
                      <strong className="order-amount">
                        ₹{typeof order.amount === "number"
                          ? order.amount.toLocaleString('en-IN')
                          : order.amount}
                      </strong>
                    </td>
                    <td>
                      <span className={`d-chip ${STATUS_MAP[order.status] || 'd-chip-gray'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="d-navbar-icon-btn"
                          title="View ordered items"
                          aria-label={`View items for order ${order.id}`}
                          onClick={() => setViewOrder(order)}
                        >
                          <MdVisibility />
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            className="d-navbar-icon-btn"
                            title="Delete order"
                            aria-label={`Delete order ${order.id}`}
                            onClick={() => openDelete(order)}
                          >
                            <MdDelete />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={handleDelete}
        itemName={currentItem?.id}
      />
      <Modal
        show={Boolean(viewOrder)}
        onHide={() => {
          setViewOrder(null);
          setEditingItem(null);
        }}
        centered
        size="lg"
        dialogClassName="order-items-modal"
      >
        <Modal.Header closeButton className="order-items-modal-header">
          <div className="order-items-modal-heading">
            <span className={`order-source-icon ${viewOrder?.type === 'Cafe' ? 'cafe' : 'bar'}`}>
              {viewOrder?.type === 'Cafe' ? <MdLocalCafe /> : <MdLocalBar />}
            </span>
            <div>
              <Modal.Title>Order #{viewOrder?.id}</Modal.Title>
              <div className="order-items-modal-subtitle">Order items and preparation status</div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <>
              <div className="order-items-meta">
                <div className="order-items-meta-card">
                  <span>TABLE</span>
                  <strong>{viewOrder.table || '—'}</strong>
                </div>
                <div className="order-items-meta-card">
                  <span>ORDERED BY</span>
                  <strong>{viewOrder.waiter || '—'}</strong>
                </div>
                <div className="order-items-meta-card">
                  <span>DATE &amp; TIME</span>
                  <strong>{formatOrderDate(viewOrder.createdAt)}</strong>
                  <small>{formatOrderTime(viewOrder.createdAt) || '—'}</small>
                </div>
              </div>
              <div className="order-items-section-heading">
                <div>
                  <h3>Items in this order</h3>
                  <span>
                    {viewOrder.items?.length || 0} {(viewOrder.items?.length || 0) === 1 ? 'item' : 'items'}
                    {' · '}
                    {(viewOrder.items || []).reduce((total, item) => total + (Number(item.qty) || 0), 0)} total qty
                  </span>
                </div>
                <span className={`d-chip ${STATUS_MAP[viewOrder.status] || 'd-chip-gray'}`}>
                  {viewOrder.status}
                </span>
              </div>
              {viewOrder.items?.length ? (
                <div className="order-items-list">
                  {viewOrder.items.map((item, index) => {
                    const quantity = Number(item.qty) || 0;
                    const lineTotal = typeof item.price === 'number'
                      ? item.price * quantity
                      : null;

                    return (
                      <div className="order-item-card" key={item._id || `${item.name}-${index}`}>
                        <span className="order-item-index">{String(index + 1).padStart(2, '0')}</span>
                        <div className="order-item-details">
                          <strong>{item.name || 'Unnamed item'}</strong>
                          <span>
                            {quantity} × {typeof item.price === 'number'
                              ? `₹${item.price.toLocaleString('en-IN')}`
                              : 'Price unavailable'}
                          </span>
                        </div>
                        <div className="order-item-line-total">
                          <span>ITEM TOTAL</span>
                          <strong>{lineTotal === null ? '—' : `₹${lineTotal.toLocaleString('en-IN')}`}</strong>
                        </div>
                        <div className="order-item-status">
                          <span>STATUS</span>
                          {editingItem === item._id ? (
                            <Form.Select
                              size="sm"
                              autoFocus
                              className="d-status-select text-nowrap"
                              value={item.status || 'Pending'}
                              onChange={async (event) => {
                                const newStatus = event.target.value;
                                setOrders((prev) => prev.map((order) => ({
                                  ...order,
                                  items: order.items.map((orderedItem) =>
                                    orderedItem._id === item._id
                                      ? { ...orderedItem, status: newStatus }
                                      : orderedItem
                                  )
                                })));
                                setViewOrder((prev) => prev && ({
                                  ...prev,
                                  items: prev.items.map((orderedItem) =>
                                    orderedItem._id === item._id
                                      ? { ...orderedItem, status: newStatus }
                                      : orderedItem
                                  )
                                }));
                                await handleItemStatusUpdate(viewOrder._id, item._id, newStatus);
                                setEditingItem(null);
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Preparing">Preparing</option>
                              <option value="Ready">Ready</option>
                              <option value="Served">Served</option>
                            </Form.Select>
                          ) : (
                            <button
                              type="button"
                              className={`d-chip ${ITEM_STATUS_MAP[item.status] || 'd-chip-gray'}`}
                              onClick={() => setEditingItem(item._id)}
                              aria-label={`Change ${item.name} status`}
                            >
                              {item.status || 'Pending'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="order-items-empty">No items in this order.</div>
              )}
              <div className="order-items-total">
                <span>Order total</span>
                <strong>
                  ₹{typeof viewOrder.amount === 'number'
                    ? viewOrder.amount.toLocaleString('en-IN')
                    : viewOrder.amount}
                </strong>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
      <style>{`
        .orders-history-card { border: 1px solid rgba(22, 48, 43, 0.08); }
        .orders-history-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1.1rem 1.35rem;
          background: linear-gradient(110deg, rgba(22, 48, 43, 0.045), rgba(201, 168, 76, 0.07));
          border-bottom: 1px solid var(--d-border);
        }
        .orders-history-title { color: var(--d-primary); font-size: 1rem; font-weight: 800; }
        .orders-history-subtitle { color: var(--d-text-muted); font-size: 0.76rem; margin-top: 3px; }
        .orders-history-page-size {
          padding: 0.42rem 0.7rem;
          border: 1px solid var(--d-border);
          border-radius: 999px;
          background: var(--d-white);
          color: var(--d-text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .orders-history-table { min-width: 1120px; border-collapse: separate; border-spacing: 0; }
        .orders-history-table thead tr { background: #f5f4ef; }
        .orders-history-table th { padding-top: 14px; padding-bottom: 14px; color: #66736d; }
        .orders-history-table td { padding-top: 12px; padding-bottom: 12px; }
        .orders-history-table .order-group-start td { border-top: 10px solid #f7f6f2; background: #fff; }
        .orders-history-table .order-group-continuation td { background: #fcfbf8; }
        .orders-history-table .order-group-end td { border-bottom: 1px solid #e5e2d9; }
        .orders-history-table tbody tr.order-group-start:hover td,
        .orders-history-table tbody tr.order-group-continuation:hover td { background: #f5f8f5; }
        .orders-history-table .order-id-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.42rem 0.62rem;
          border-radius: 8px;
          background: rgba(22, 48, 43, 0.08);
          color: var(--d-primary);
          font-size: 0.76rem;
          font-weight: 800;
        }
        .orders-history-table .order-date-cell { display: flex; flex-direction: column; gap: 2px; }
        .orders-history-table .order-date-cell strong { color: var(--d-primary); font-size: 0.78rem; }
        .orders-history-table .order-date-cell span { color: var(--d-text-muted); font-size: 0.7rem; }
        .orders-history-table .order-items-summary { display: flex; flex-direction: column; gap: 3px; }
        .orders-history-table .order-items-summary span { color: var(--d-text); font-size: 0.78rem; }
        .orders-history-table .order-source-cell { display: flex; align-items: center; gap: 9px; }
        .orders-history-table .order-source-cell > div { display: flex; flex-direction: column; gap: 2px; }
        .orders-history-table .order-source-cell strong { color: var(--d-primary); font-size: 0.8rem; }
        .orders-history-table .order-source-cell span:last-child { color: var(--d-text-muted); font-size: 0.68rem; }
        .orders-history-table .order-source-icon {
          display: grid;
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          place-items: center;
          border-radius: 10px;
          font-size: 1rem;
        }
        .orders-history-table .order-source-icon.cafe { background: rgba(46, 204, 113, 0.12); color: #26965a; }
        .orders-history-table .order-source-icon.bar { background: rgba(52, 152, 219, 0.12); color: #2980b9; }
        .orders-history-table .order-qty-badge {
          display: inline-grid;
          min-width: 28px;
          height: 28px;
          padding: 0 7px;
          place-items: center;
          border-radius: 8px;
          background: rgba(22, 48, 43, 0.06);
          color: var(--d-primary);
          font-weight: 800;
        }
        .orders-history-table .order-amount { color: var(--d-primary); font-size: 0.92rem; }
        .order-items-modal .modal-content {
          overflow: hidden;
          border: 0;
          border-radius: 20px;
          box-shadow: 0 24px 80px rgba(11, 25, 21, 0.25);
        }
        .order-items-modal-header {
          align-items: center;
          padding: 1.2rem 1.5rem;
          border: 0;
          background: linear-gradient(120deg, #112923, #1b4035);
          color: #fff;
        }
        .order-items-modal-header .btn-close { filter: invert(1); opacity: 0.8; }
        .order-items-modal-heading { display: flex; align-items: center; gap: 0.9rem; }
        .order-items-modal-heading .order-source-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 13px; font-size: 1.25rem; }
        .order-items-modal-heading .order-source-icon.cafe { background: rgba(255,255,255,0.15); color: #b8efcd; }
        .order-items-modal-heading .order-source-icon.bar { background: rgba(255,255,255,0.15); color: #b9dfff; }
        .order-items-modal-heading .modal-title { color: #fff; font-size: 1.15rem; font-weight: 800; }
        .order-items-modal-subtitle { margin-top: 3px; color: rgba(255,255,255,0.7); font-size: 0.75rem; }
        .order-items-modal .modal-body { padding: 1.4rem 1.5rem; background: #fbfaf7; }
        .order-items-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.7rem; }
        .order-items-meta-card { display: flex; min-width: 0; flex-direction: column; gap: 4px; padding: 0.8rem 0.9rem; border: 1px solid #e9e7df; border-radius: 12px; background: #fff; }
        .order-items-meta-card > span, .order-item-line-total > span, .order-item-status > span { color: #85908a; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.07em; }
        .order-items-meta-card strong { overflow: hidden; color: var(--d-primary); font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
        .order-items-meta-card small { color: var(--d-text-muted); font-size: 0.72rem; }
        .order-items-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1.45rem 0 0.75rem; }
        .order-items-section-heading h3 { margin: 0; color: var(--d-primary); font-size: 0.95rem; font-weight: 800; }
        .order-items-section-heading > div > span { display: block; margin-top: 3px; color: var(--d-text-muted); font-size: 0.72rem; }
        .order-items-list { display: flex; max-height: 360px; flex-direction: column; gap: 0.55rem; overflow-y: auto; padding: 1px 3px 1px 1px; }
        .order-item-card { display: grid; grid-template-columns: 38px minmax(0, 1fr) minmax(100px, auto) minmax(112px, auto); align-items: center; gap: 0.85rem; padding: 0.8rem; border: 1px solid #e9e7df; border-radius: 13px; background: #fff; }
        .order-item-index { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; background: #f1efe7; color: #68756e; font-size: 0.7rem; font-weight: 800; }
        .order-item-details { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
        .order-item-details strong { overflow: hidden; color: var(--d-primary); font-size: 0.83rem; text-overflow: ellipsis; white-space: nowrap; }
        .order-item-details span { color: var(--d-text-muted); font-size: 0.72rem; }
        .order-item-line-total, .order-item-status { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .order-item-line-total strong { color: var(--d-primary); font-size: 0.82rem; }
        .order-item-status .d-chip { border: 0; cursor: pointer; }
        .order-item-status .form-select { min-width: 112px; }
        .order-items-empty { padding: 2rem 1rem; border: 1px dashed #d9d6cb; border-radius: 13px; color: var(--d-text-muted); text-align: center; }
        .order-items-total { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; padding: 1rem 1.1rem; border-radius: 13px; background: #112923; color: #fff; }
        .order-items-total span { color: rgba(255,255,255,0.75); font-size: 0.8rem; font-weight: 700; }
        .order-items-total strong { color: #f1d68d; font-size: 1.15rem; }
        @media (max-width: 600px) {
          .orders-history-toolbar { padding: 0.9rem 1rem; }
          .orders-history-table { min-width: 1120px; }
          .order-items-modal-header, .order-items-modal .modal-body { padding: 1rem; }
          .order-items-meta { grid-template-columns: 1fr 1fr; }
          .order-items-meta-card:last-child { grid-column: 1 / -1; }
          .order-item-card { grid-template-columns: 34px minmax(0, 1fr) auto; gap: 0.6rem; }
          .order-item-line-total { grid-column: 2; align-items: flex-start; }
          .order-item-status { grid-column: 3; grid-row: 1 / span 2; }
        }
      `}</style>
    </>
  );
}
