import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdRefresh, MdLocalCafe, MdLocalBar,
  MdAccessTime, MdPerson, MdReceipt, MdDelete
} from 'react-icons/md';
import Pagination from '../../components/Pagination';
import DeleteModal from '../../components/DeleteModal';
import { ordersAPI } from '../../../api';

const ORDERS = [{}];

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
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
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

  const handleItemStatusUpdate = async (orderId, itemId, newStatus) => {
    try {
      await ordersAPI.updateItemStatus(orderId, itemId, {
        status: newStatus
      });

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
    setCurrentItem(item);
    setShowDelete(true);
  };

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
                <th>Qty</th>
                <th>Item Status</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Time</th>
                <th style={{ width: "100px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {(currentData.length > 0 ? currentData : filtered).flatMap((order) => {
                const items = Array.isArray(order.items) ? order.items : [];

                if (items.length === 0) {
                  return (
                    <tr key={`${order._id}-empty`}>
                      <td>
                        <strong>{order.id}</strong>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {order.type === "Cafe" ? (
                            <MdLocalCafe className="text-success" />
                          ) : (
                            <MdLocalBar className="text-primary" />
                          )}
                          <span>{order.table}</span>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <MdPerson style={{ color: "var(--d-text-light)" }} />
                          <span>{order.waiter}</span>
                        </div>
                      </td>

                      <td>-</td>
                      <td>-</td>
                      <td>-</td>

                      <td>
                        <strong>
                          ₹
                          {typeof order.amount === "number"
                            ? order.amount.toLocaleString()
                            : order.amount}
                        </strong>
                      </td>

                      {/* <td>
                        {editingStatusId === order._id ? (
                          <Form.Select
                            size="sm"
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            onBlur={() => setEditingStatusId(null)}
                            autoFocus
                            className="d-status-select"
                          >
                            {["Pending", "Preparing", "Served", "Cancelled"].map(
                              (s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              )
                            )}
                          </Form.Select>
                        ) : (
                          <span
                            className={`d-chip ${STATUS_MAP[order.status]}`}
                            onClick={() => setEditingStatusId(order._id)}
                            style={{ cursor: "pointer" }}
                          >
                            {order.status}
                          </span>
                        )}
                      </td> */}

                      <td>
                        <div
                          className="d-flex align-items-center gap-1"
                          style={{
                            color: "var(--d-text-muted)",
                            fontSize: "0.8rem",
                          }}
                        >
                          <MdAccessTime /> {order.time}
                        </div>
                      </td>

                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="d-navbar-icon-btn"
                            onClick={() => openDelete(order)}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return items.map((item, index) => {
                  const isFirstItem = index === 0;

                  return (
                    <tr key={`${order._id}-${index}`}>
                      <td>{isFirstItem ? <strong>{order.id}</strong> : ""}</td>

                      <td>
                        {isFirstItem && (
                          <div className="d-flex align-items-center gap-2">
                            {order.type === "Cafe" ? (
                              <MdLocalCafe className="text-success" />
                            ) : (
                              <MdLocalBar className="text-primary" />
                            )}
                            <span>{order.table}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        {isFirstItem && (
                          <div className="d-flex align-items-center gap-2">
                            <MdPerson style={{ color: "var(--d-text-light)" }} />
                            <span>{order.waiter}</span>
                          </div>
                        )}
                      </td>

                      {/* Item Name */}
                      <td>{item.name}</td>

                      {/* Qty */}
                      <td>{item.qty}</td>

                      {/* Item Status */}
                      <td>
                        {editingItem === item._id ? (
                          <Form.Select
                            size="sm"
                            value={item.status}
                            autoFocus
                            className="d-status-select text-nowrap"
                            onChange={async (e) => {
                              const newStatus = e.target.value;

                              // 1. instant UI update (NO flicker)
                              setOrders((prev) =>
                                prev.map((order) => ({
                                  ...order,
                                  items: order.items.map((it) =>
                                    it._id === item._id
                                      ? { ...it, status: newStatus }
                                      : it
                                  ),
                                }))
                              );

                              // 2. API call
                              await handleItemStatusUpdate(order._id, item._id, newStatus);

                              // 3. IMPORTANT: exit edit mode instantly
                              setEditingItem(null);
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Served">Served</option>
                            <option value="Cancelled">Cancelled</option>
                          </Form.Select>
                        ) : (
                          <span
                            className={`d-chip ${STATUS_MAP[item.status]}`}
                            style={{
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              padding: "3px 8px",
                            }}
                            onClick={() => setEditingItem(item._id)}
                          >
                            {item.status}
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td>
                        {isFirstItem ? (
                          <strong>
                            ₹
                            {typeof order.amount === "number"
                              ? order.amount.toLocaleString()
                              : order.amount}
                          </strong>
                        ) : (
                          ""
                        )}
                      </td>

                      {/* Order Status */}
                      <td>
                        <span className={`d-chip ${STATUS_MAP[order.status]}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Time */}
                      <td>
                        {isFirstItem && (
                          <div
                            className="d-flex align-items-center gap-1"
                            style={{
                              color: "var(--d-text-muted)",
                              fontSize: "0.8rem",
                            }}
                          >
                            <MdAccessTime /> {order.time}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td>
                        {isFirstItem && (
                          <div className="d-flex gap-1">
                            <button
                              className="d-navbar-icon-btn"
                              onClick={() => openDelete(order)}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                });
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
    </>
  );
}
