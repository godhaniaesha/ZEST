import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAdd, MdPhone, MdPeople, MdEventSeat,
  MdCheckCircle, MdPendingActions, MdCancel, MdMoreVert,
  MdEdit, MdDelete, MdCalendarToday
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { useAuth } from '../../../contexts/AuthContext';
import { reservationsAPI } from '../../../api';

const TABLES = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Tables 1+2', 'Tables 3+4', 'Bar Counter'];
const TIME_SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'];
const STATUS_CLASS = {
  Confirmed: 'd-chip-green',
  Pending: 'd-chip-gold',
  Cancelled: 'd-chip-red',
};

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '7:00 PM',
    guests: 2,
    table: 'Table 1',
    phone: '',
    email: '',
    status: 'Pending',
    notes: ''
  });
  const [editingReservation, setEditingReservation] = useState(null);
  const [tempStatus, setTempStatus] = useState({});
  const { user } = useAuth();
  const userRole = user?.role || 'waiter';

  const canAddEditDelete = userRole === 'waiter' || userRole === 'manager' || userRole === 'superadmin';

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAll();
      setReservations(response.data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmedCount = reservations.filter(r => r.status === 'Confirmed').length;
  const pendingCount = reservations.filter(r => r.status === 'Pending').length;
  const cancelledCount = reservations.filter(r => r.status === 'Cancelled').length;

  const handleAdd = () => {
    if (!canAddEditDelete) return;
    setCurrentItem(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: '7:00 PM',
      guests: 2,
      table: 'Table 1',
      phone: '',
      email: '',
      status: 'Pending',
      notes: ''
    });
    setShowForm(true);
  };

  // const handleEdit = (item) => {
  //   if (!canAddEditDelete) return;
  //   setCurrentItem(item);
  //   setFormData({
  //     name: item.name || item.customerName,
  //     date: item.date,
  //     time: item.time,
  //     guests: item.guests,
  //     table: item.table || `Table ${item.tableNumber}`,
  //     phone: item.phone,
  //     email: item.email || '',
  //     status: item.status,
  //     notes: item.notes || ''
  //   });
  //   setShowForm(true);
  // };

  const handleDeleteClick = (item) => {
    if (!canAddEditDelete) return;
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.date || !formData.time || formData.guests < 1) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      customerName: formData.name,
      phone: formData.phone,
      email: formData.email,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      table: formData.table,
      // tableNumber: parseInt(formData.table.replace(/[^0-9]/g, '')) || 0,
      status: formData.status,
      notes: formData.notes
    };

    try {
      if (currentItem) {
        await reservationsAPI.update(currentItem._id, payload);
      } else {
        await reservationsAPI.create(payload);
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('Failed to save reservation');
    }
  };

  const confirmDelete = async () => {
    try {
      await reservationsAPI.delete(currentItem._id);
      await loadData();
      setShowDelete(false);
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('Failed to delete reservation');
    }
  };

  const handleStatusUpdate = async (reservationId, status) => {
    try {
      await reservationsAPI.updateStatus(reservationId, status);

      setReservations((prev) =>
        prev.map((r) =>
          r._id === reservationId
            ? { ...r, status }
            : r
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdEventSeat /> Reservations
          </div>
          <div className="d-page-sub">Manage guest bookings and table assignments</div>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Confirmed', value: confirmedCount, icon: <MdCheckCircle />, color: 'd-green' },
          { label: 'Pending', value: pendingCount, icon: <MdPendingActions />, color: 'd-gold' },
          { label: 'Cancelled', value: cancelledCount, icon: <MdCancel />, color: 'd-red' }
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
                <th>Date & Time</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Contact</th>
                <th>Status</th>
                {canAddEditDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id}>
                  <td style={{ fontWeight: 700 }} title={r._id}>RES-{r._id?.slice(-6)}</td>
                  <td title={r.customerName}>
                    <div>{r.customerName}</div>
                  </td>
                  <td title={`${r.date} ${r.time}`}>
                    <div className="d-flex align-items-center gap-2">
                      <MdCalendarToday />
                      <span>
                        {new Date(r.date).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
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
                        {typeof r.table === 'object' && r.table !== null 
                          ? `Table ${r.table.number}` 
                          : r.table}
                      </span>
                    </div>
                  </td>
                  <td title={r.phone}>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>
                      <div><MdPhone className="me-1" /> {r.phone}</div>
                      {r.email && <div className="small">{r.email}</div>}
                    </div>
                  </td>
                  <td>
                    {editingReservation === r._id ? (
                      <Form.Select
                        size="sm"
                        value={r.status}
                        autoFocus
                        className="d-status-select text-nowrap"
                        onChange={async (e) => {
                          const newStatus = e.target.value;

                          // 1. instant UI update (optimistic)
                          setReservations((prev) =>
                            prev.map((item) =>
                              item._id === r._id
                                ? { ...item, status: newStatus }
                                : item
                            )
                          );

                          // 2. API call
                          await handleStatusUpdate(r._id, newStatus);

                          // 3. EXIT edit mode immediately (IMPORTANT)
                          setEditingReservation(null);
                        }}
                        onBlur={() => setEditingReservation(null)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                    ) : (
                      <span
                        className={`d-chip ${STATUS_CLASS[r.status] || "d-chip-gray"}`}
                        style={{
                          cursor: "pointer",
                          fontSize: "0.75rem",
                          padding: "3px 8px",
                        }}
                        onClick={() => setEditingReservation(r._id)}
                      >
                        {r.status}
                      </span>
                    )}
                  </td>
                  {canAddEditDelete && (
                    <td>
                      <div className="d-flex gap-1">
                        {/* <button className="d-navbar-icon-btn" onClick={() => handleEdit(r)}>
                          <MdEdit />
                        </button> */}
                        <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(r)}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={currentItem?.name}
      />
    </>
  );
}
