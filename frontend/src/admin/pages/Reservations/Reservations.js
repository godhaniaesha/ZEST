import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  MdAdd, MdPhone, MdPeople, MdEventSeat,
  MdCheckCircle, MdPendingActions, MdCancel, MdEdit, MdDelete
} from 'react-icons/md';
import { reservationsAPI, tablesAPI } from '../../../api';
import FormModal from '../../components/FormModal';
import DeleteModal from '../../components/DeleteModal';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resRes, tablesRes] = await Promise.all([
        reservationsAPI.getAll(),
        tablesAPI.getAll()
      ]);
      setReservations(resRes.data);
      setTables(tablesRes.data);
    } catch (err) {
      console.error(err);
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
        await reservationsAPI.update(currentItem._id, formData);
      } else {
        await reservationsAPI.create(formData);
      }
      loadData();
      setShowForm(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await reservationsAPI.delete(currentItem._id);
      loadData();
      setShowDelete(false);
    } catch (error) {
      console.error(error);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'd-chip-green';
      case 'Pending': return 'd-chip-gold';
      case 'Cancelled': return 'd-chip-red';
      default: return '';
    }
  };

  const stats = {
    Confirmed: reservations.filter(r => r.status === 'Confirmed').length,
    Pending: reservations.filter(r => r.status === 'Pending').length,
    Cancelled: reservations.filter(r => r.status === 'Cancelled').length
  };

  const formFields = [
    { name: 'customerName', label: 'Guest Name', type: 'text', required: true, col: 12 },
    { name: 'phone', label: 'Phone', type: 'text', required: true, col: 6 },
    { name: 'email', label: 'Email', type: 'email', col: 6 },
    { name: 'date', label: 'Date', type: 'date', required: true, col: 6 },
    { name: 'time', label: 'Time', type: 'time', required: true, col: 6 },
    { name: 'guests', label: 'Guests', type: 'number', required: true, col: 6 },
    { name: 'tableNumber', label: 'Table', type: 'select', required: true, col: 6, options: tables.filter(t => t.status === 'Free').map(t => ({ label: t.displayId || (t.type === 'Bar' ? 'B-' : 'C-') + String(t.number).padStart(2, '0'), value: t.number })) },
    { name: 'status', label: 'Status', type: 'select', required: true, col: 12, options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Confirmed', value: 'Confirmed' },
      { label: 'Cancelled', value: 'Cancelled' }
    ] },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdEventSeat /> Reservations
          </div>
          <div className="d-page-sub">Manage guest bookings and table assignments</div>
        </div>
        <div className="d-flex gap-2">
          <button className="d-btn-gold" onClick={() => { setCurrentItem(null); setShowForm(true); }}>
            <MdAdd /> New Booking
          </button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Confirmed', value: stats.Confirmed, icon: <MdCheckCircle />, color: 'd-green' },
          { label: 'Pending', value: stats.Pending, icon: <MdPendingActions />, color: 'd-gold' },
          { label: 'Cancelled', value: stats.Cancelled, icon: <MdCancel />, color: 'd-red' }
        ].map((s) => (
          <Col key={s.label} xs={12} sm={4}>
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

      <div className="d-card p-0 overflow-hidden">
        <div className="d-table-wrap">
          <table className="d-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest Name</th>
                <th>Schedule</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, index) => (
                <tr key={r._id}>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }} title={r._id}>
                    R-{String(index + 1).padStart(3, '0')}
                  </td>
                  <td title={r.customerName}>
                    <div style={{ fontWeight: 700, color: 'var(--d-primary)' }}>{r.customerName}</div>
                  </td>
                  <td title={`${new Date(r.date).toLocaleDateString()} ${r.time}`}>
                    <div className="d-flex align-items-center gap-2">
                      <MdPendingActions className="text-muted" />
                      <span style={{ fontWeight: 600 }}>
                        {new Date(r.date).toLocaleDateString()} {r.time}
                      </span>
                    </div>
                  </td>
                  <td title={`${r.guests} Guests`}>
                    <div className="d-flex align-items-center gap-1">
                      <MdPeople style={{ color: 'var(--d-text-light)' }} />
                      <span>{r.guests} Guests</span>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <MdEventSeat style={{ color: 'var(--d-gold)' }} />
                      <span>
                        {(() => {
                          const table = tables.find(t => t.number === r.tableNumber);
                          return table ? (table.displayId || (table.type === 'Bar' ? 'B-' : 'C-') + String(table.number).padStart(2, '0')) : `Table ${r.tableNumber}`;
                        })()}
                      </span>
                    </div>
                  </td>
                  <td title={r.phone}>
                    <div className="d-flex align-items-center gap-1" style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>
                      <MdPhone /> {r.phone}
                    </div>
                  </td>
                  <td title={r.status}>
                    <span className={`d-chip ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="d-navbar-icon-btn" onClick={() => openEdit(r)}>
                        <MdEdit />
                      </button>
                      <button className="d-navbar-icon-btn" onClick={() => openDelete(r)}>
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        onSave={handleSave}
        title={currentItem ? "Edit Booking" : "New Booking"}
        initialData={currentItem || {}}
        fields={formFields}
      />

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onDelete={handleDelete}
        itemName={`Booking for ${currentItem?.customerName}`}
      />
    </>
  );
}
