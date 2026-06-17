import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAccessTime, MdCheckCircle, MdCancel, MdSearch,
  MdEdit, MdDelete, MdCalendarToday, MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { attendanceAPI } from '../../../api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaff } from '../../../store/slices/staffSlice';

export default function StaffAttendance() {
  const dispatch = useDispatch();
  const staffRedux = useSelector((state) => state.staff.list);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ staffId: '', date: selectedDate, status: 'present', checkIn: '', checkOut: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const attendanceRes = await attendanceAPI.getAll({ date: selectedDate });
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Transform staff data from Redux to match component format
  const staffList = staffRedux.filter(staff => staff.role !== 'customer').map(staff => ({
    _id: staff._id,
    name: staff.name,
    role: staff.role,
    initials: staff.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    color: '#C9A84C',
    leavesTotal: staff.leavesTotal || 12,
    leavesTaken: staff.leavesTaken || 0
  }));

  useEffect(() => {
    dispatch(fetchStaff());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = attendance.filter(a => 
    a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setCurrentItem(null);
    setFormData({ staffId: '', date: selectedDate, status: 'present', checkIn: '', checkOut: '' });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      staffId: item.staffId,
      date: item.date,
      status: item.status,
      checkIn: item.checkIn || '',
      checkOut: item.checkOut || ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentItem(item);
    setShowDelete(true);
  };

  const handleMarkPresent = async (staffId) => {
    try {
      const staff = staffList.find(s => s._id === staffId);
      await attendanceAPI.markPresent(staffId, selectedDate);
      alert(`${staff?.name || 'Staff'} marked as present`);
      loadData();
    } catch (error) {
      console.error('Error marking present:', error);
      alert('Failed to mark as present');
    }
  };

  const handleMarkAbsent = async (staffId) => {
    try {
      const staff = staffList.find(s => s._id === staffId);
      await attendanceAPI.markAbsent(staffId, selectedDate);
      alert(`${staff?.name || 'Staff'} marked as absent`);
      loadData();
    } catch (error) {
      console.error('Error marking absent:', error);
      alert('Failed to mark as absent');
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.staffId) {
        alert('Please select a staff member');
        return;
      }

      if (currentItem) {
        await attendanceAPI.update(currentItem._id, formData);
      } else {
        await attendanceAPI.create(formData);
      }

      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  const confirmDelete = async () => {
    try {
      await attendanceAPI.delete(currentItem._id);
      setShowDelete(false);
      loadData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance');
    }
  };

  const getStats = () => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;

    return { total, present, absent, late };
  };

  const stats = getStats();

  return (
    <>
      <div className="d-page-header">
        <div>
          <div className="d-page-heading d-flex align-items-center gap-2">
            <MdAccessTime /> Staff Attendance
          </div>
          <div className="d-page-sub">Manage daily attendance of staff members</div>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Group className="mb-0">
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            />
          </Form.Group>
          <button className="d-btn-gold" onClick={handleAdd}><MdEdit /> Add Attendance</button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} xl={3}>
              <div className="d-stat-card">
                <div className="d-stat-icon d-gold" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}></div>
                <div>
                  <div className="d-stat-value" style={{ fontSize: '1.4rem' }}>...</div>
                  <div className="d-stat-label">Loading...</div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          [
            { label: 'Total Staff', value: stats.total, icon: <MdPeople />, color: 'd-gold' },
            { label: 'Present', value: stats.present, icon: <MdCheckCircle />, color: 'd-green' },
            { label: 'Absent', value: stats.absent, icon: <MdCancel />, color: 'd-red' },
            { label: 'Late', value: stats.late, icon: <MdCalendarToday />, color: 'd-blue' }
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
          ))
        )}
      </Row>

      <div className="d-navbar-search-box mb-4 w-100" style={{ maxWidth: '400px', margin: '0' }}>
        <MdSearch className="d-search-icon" />
        <input
          type="text"
          placeholder="Search by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="d-card">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="text-center py-4">Loading...</td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No attendance records found</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--d-radius-md)',
                          background: `${staffList.find(s => s._id === item.staffId)?.color || '#C9A84C'}15`,
                          color: staffList.find(s => s._id === item.staffId)?.color || '#C9A84C',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {staffList.find(s => s._id === item.staffId)?.initials || item.staffName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{item.staffName}</span>
                      </div>
                    </td>
                    <td>{item.role}</td>
                    <td>{new Date(item.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <span className={`d-chip ${item.status === 'present' ? 'd-chip-green' : item.status === 'absent' ? 'd-chip-red' : 'd-chip-gold'}`} style={{ fontSize: '0.7rem' }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{item.checkIn || '-'}</td>
                    <td>{item.checkOut || '-'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="d-navbar-icon-btn" onClick={() => handleEdit(item)}>
                          <MdEdit />
                        </button>
                        <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(item)}>
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

      <h5 className="mt-5 mb-3">Quick Actions - Mark Today's Attendance</h5>
      <Row className="g-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Col key={i} xs={12} sm={6} md={4}>
              <div className="d-card">
                <div className="d-flex justify-content-between align-items-center">
                  <div>Loading...</div>
                </div>
              </div>
            </Col>
          ))
        ) : (
          staffList.map((staff) => {
            const todayAttendance = attendance.find(a => a.staffId === staff._id && a.date === selectedDate);
            return (
              <Col key={staff._id} xs={12} sm={6} md={4}>
                <div className="d-card h-100">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-3 align-items-center">
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--d-radius-md)',
                        background: `${staff.color}15`, color: staff.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.1rem', flexShrink: 0
                      }}>{staff.initials}</div>
                      <div>
                        <h6 className="mb-0">{staff.name}</h6>
                        <div className="small text-muted">{staff.role}</div>
                      </div>
                    </div>
                    {todayAttendance && (
                      <span className={`d-chip ${todayAttendance.status === 'present' ? 'd-chip-green' : todayAttendance.status === 'absent' ? 'd-chip-red' : 'd-chip-gold'}`} style={{ fontSize: '0.65rem' }}>
                        {todayAttendance.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className={`d-btn-outline flex-grow-1 ${todayAttendance?.status === 'present' ? 'd-btn-gold' : ''}`} 
                      onClick={() => handleMarkPresent(staff._id)}
                      disabled={todayAttendance?.status === 'present'}
                      style={{ padding: '6px', fontSize: '0.8rem' }}
                    >
                      <MdCheckCircle /> Present
                    </button>
                    <button 
                      className={`d-btn-outline flex-grow-1 text-danger ${todayAttendance?.status === 'absent' ? 'd-btn-gold' : ''}`} 
                      onClick={() => handleMarkAbsent(staff._id)}
                      disabled={todayAttendance?.status === 'absent'}
                      style={{ padding: '6px', fontSize: '0.8rem' }}
                    >
                      <MdCancel /> Absent
                    </button>
                  </div>
                </div>
              </Col>
            );
          })
        )}
      </Row>
        
      {/* Modals */}
      <FormModal
        show={showForm}
        onHide={() => setShowForm(false)}
        title={currentItem ? "Edit Attendance" : "Add Attendance"}
        onSubmit={handleSave}
      >
        <Row className="g-3">
          <Col xs={12}>
            <Form.Group>
              <Form.Label className="small fw-bold">Staff Member *</Form.Label>
              <Form.Select
                value={formData.staffId}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                required
              >
                <option value="">Select Staff</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
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
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Status *</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Check In</Form.Label>
              <Form.Control
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label className="small fw-bold">Check Out</Form.Label>
              <Form.Control
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>
      </FormModal>

      <DeleteModal
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={confirmDelete}
        itemName={currentItem?.staffName ? `attendance for ${currentItem.staffName}` : 'attendance record'}
      />
    </>
  );
}
