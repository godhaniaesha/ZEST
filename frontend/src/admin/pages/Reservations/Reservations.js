import React, { useEffect, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd, MdPhone, MdPeople, MdEventSeat,
  MdCheckCircle, MdPendingActions, MdCancel, MdMoreVert,
  MdEdit, MdDelete, MdCalendarToday
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { useAuth } from '../../../contexts/AuthContext';
import { reservationsAPI, tablesAPI } from '../../../api';

const TIME_SLOTS = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'];
const STATUS_CLASS = {
  Confirmed: 'd-chip-green',
  Pending: 'd-chip-gold',
  Cancelled: 'd-chip-red',
  Completed: 'd-chip-blue',
};

export default function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '7:00 PM',
    guests: 2,
    table: '',
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
      const [reservationsRes, tablesRes] = await Promise.all([
        reservationsAPI.getAll(),
        tablesAPI.getAll()
      ]);
      setReservations(reservationsRes.data || []);
      setTables(tablesRes.data || []);
      
      // Set default table to first available table
      if (tablesRes.data && tablesRes.data.length > 0) {
        setFormData(prev => ({ ...prev, table: tablesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
  const completedCount = reservations.filter(r => r.status === 'Completed').length;

  const handleAdd = () => {
    if (!canAddEditDelete) return;
    setCurrentItem(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: '7:00 PM',
      guests: 2,
      table: tables.length > 0 ? tables[0]._id : '',
      phone: '',
      email: '',
      status: 'Pending',
      notes: ''
    });
    setShowForm(true);
  };

  const handleViewFloorPlan = () => {
    navigate('/admin/tables');
  };

  const handleEdit = (item) => {
    if (!canAddEditDelete) return;
    setCurrentItem(item);
    setFormData({
      name: item.name || item.customerName,
      date: item.date,
      time: item.time,
      guests: item.guests,
      table: typeof item.table === 'object' ? item.table._id : item.table,
      phone: item.phone,
      email: item.email || '',
      status: item.status,
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    if (!canAddEditDelete) return;
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleSave = async () => {
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a valid guest name');
      return;
    }

    // Phone validation - must be exactly 10 digits
    if (!formData.phone || !formData.phone.trim()) {
      alert('Please enter a phone number');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    // Email validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email format (e.g., guest@example.com)');
        return;
      }
    }

    // Date validation
    if (!formData.date) {
      alert('Please select a date');
      return;
    }

    // Time validation
    if (!formData.time) {
      alert('Please select a time');
      return;
    }

    // Guests validation
    if (!formData.guests || formData.guests < 1) {
      alert('Please enter at least 1 guest');
      return;
    }

    if (formData.guests > 20) {
      alert('Maximum 20 guests allowed per reservation');
      return;
    }

    // Table validation
    if (!formData.table) {
      alert('Please select a table');
      return;
    }

    const payload = {
      customerName: formData.name,
      phone: cleanPhone,
      email: formData.email,
      date: formData.date,
      time: formData.time,
      guests: formData.guests,
      table: formData.table,
      status: formData.status,
      notes: formData.notes
    };

    try {
      if (currentItem) {
        await reservationsAPI.update(currentItem._id, payload);
      } else {
        await reservationsAPI.createAdmin(payload);
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
        <div className="d-flex gap-2">
          <button className="d-btn-outline d-hide-mobile" onClick={handleViewFloorPlan}>View Floor Plan</button>
          {canAddEditDelete && <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> New Booking</button>}
        </div>
      </div>

      <Row className="g-3 mb-4">
        {[
          { label: 'Confirmed', value: confirmedCount, icon: <MdCheckCircle />, color: 'd-green' },
          { label: 'Pending', value: pendingCount, icon: <MdPendingActions />, color: 'd-gold' },
          { label: 'Cancelled', value: cancelledCount, icon: <MdCancel />, color: 'd-red' },
          { label: 'Completed', value: completedCount, icon: <MdCheckCircle />, color: 'd-green' }
        ].map((s) => (
          <Col key={s.label} xs={12} sm={6} lg={3}>
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
                        <option value="Completed">Completed</option>
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
                        <button className="d-navbar-icon-btn" onClick={() => handleEdit(r)}>
                          <MdEdit />
                        </button>
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

      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Reservation" : "New Booking"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Guest Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter guest name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={2}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Phone Number *</Form.Label>
              <Form.Control
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, phone: value });
                }}
                required
                maxLength={10}
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Enter 10-digit phone number (numbers only)
              </Form.Text>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="guest@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
                Optional
              </Form.Text>
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Date *</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Time *</Form.Label>
              <Form.Select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Guests *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="20"
                value={formData.guests}
                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Table</Form.Label>
              <Form.Select
                value={formData.table}
                onChange={(e) => setFormData({ ...formData, table: e.target.value })}
              >
                {tables.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.displayId || `${t.type === 'Bar' ? 'B' : 'C'}-${String(t.number).padStart(2, '0')}`} (Capacity: {t.capacity})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Any special requests or notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
