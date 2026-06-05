import React, { useState, useEffect } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { 
  MdAdd, MdPhone, MdPeople, MdEventSeat, 
  MdCheckCircle, MdPendingActions, MdCancel, MdMoreVert,
  MdEdit, MdDelete, MdCalendarToday
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { reservationsAPI } from '../../../api';

const TABLE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);
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
    table: 1, 
    phone: '', 
    email: '', 
    status: 'Pending', 
  });

  const mapFromApi = (item) => ({
    _id: item._id,
    name: item.customerName,
    date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
    time: item.time,
    guests: item.guests,
    table: item.tableNumber,
    phone: item.phone,
    email: item.email || '',
    status: item.status,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAll();
      setReservations((response.data || []).map(mapFromApi));
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
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
    setCurrentItem(null);
    setFormData({ 
      name: '', 
      date: new Date().toISOString().split('T')[0], 
      time: '7:00 PM', 
      guests: 2, 
      table: 1, 
      phone: '', 
      email: '', 
      status: 'Pending', 
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
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
      tableNumber: parseInt(formData.table, 10),
      status: formData.status,
    };

    try {
      if (currentItem?._id) {
        await reservationsAPI.update(currentItem._id, payload);
      } else {
        await reservationsAPI.create(payload);
      }
      await loadData();
      setShowForm(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not save reservation.');
    }
  };

  const handleStatusChange = async (reservation, newStatus) => {
    if (reservation.status === newStatus) return;
    try {
      await reservationsAPI.updateStatus(reservation._id, newStatus);
      await loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update status.');
    }
  };

  const confirmDelete = async () => {
    try {
      await reservationsAPI.delete(currentItem._id);
      await loadData();
      setShowDelete(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not delete reservation.');
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
          <button className="d-btn-outline d-hide-mobile">View Floor Plan</button>
          <button className="d-btn-gold" onClick={handleAdd}><MdAdd /> New Booking</button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id}>
                  <td style={{ color: 'var(--d-text-muted)', fontSize: '0.8rem' }} title={r._id}>{r._id.slice(-6)}</td>
                  <td title={r.name}>
                    <div style={{ fontWeight: 700, color: 'var(--d-primary)' }}>{r.name}</div>
                  </td>
                  <td title={`${r.date} ${r.time}`}>
                    <div className="d-flex align-items-center gap-2">
                      <MdCalendarToday className="text-muted" />
                      <span style={{ fontWeight: 600 }}>{r.date} {r.time}</span>
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
                      <span>Table {r.table}</span>
                    </div>
                  </td>
                  <td title={r.phone}>
                    <div style={{ color: 'var(--d-text-muted)', fontSize: '0.85rem' }}>
                      <div><MdPhone className="me-1" /> {r.phone}</div>
                      {r.email && <div className="small">{r.email}</div>}
                    </div>
                  </td>
                  <td title={r.status}>
                    <Form.Select
                      size="sm"
                      value={r.status}
                      onChange={(e) => handleStatusChange(r, e.target.value)}
                      style={{ maxWidth: 140, fontWeight: 600 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </Form.Select>
                  </td>
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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Phone Number *</Form.Label>
              <Form.Control 
                type="tel" 
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="guest@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Date *</Form.Label>
              <Form.Control 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={4}>
            <Form.Group>
              <Form.Label className="small fw-bold">Time *</Form.Label>
              <Form.Select 
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
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
                onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value)})}
                required
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Table</Form.Label>
              <Form.Select 
                value={formData.table}
                onChange={(e) => setFormData({...formData, table: e.target.value})}
              >
                {TABLE_NUMBERS.map((t) => (
                  <option key={t} value={t}>Table {t}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status</Form.Label>
              <Form.Select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
