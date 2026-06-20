import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {
  MdAccessTime, MdCheckCircle, MdCancel, MdSearch,
  MdEdit, MdDelete, MdCalendarToday, MdPeople
} from 'react-icons/md';
import DeleteModal from '../../components/DeleteModal';
import FormModal from '../../components/FormModal';
import { attendanceAPI } from '../../../api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStaffUsers } from '../../../store/slices/usersSlice';
import { useAuth } from '../../../contexts/AuthContext';

export default function StaffAttendance() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const currentUserRole = user?.role || 'customer';
  const staffRedux = useSelector((state) => state.users.staffList);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [leaveStatus, setLeaveStatus] = useState({}); // Track leave status for each staff

  // Role-based permissions
  const canManageAttendance = ['superadmin', 'manager', 'chef', 'waiter', 'cashier'].includes(currentUserRole);
  const canFullManage = ['superadmin', 'manager'].includes(currentUserRole);

  // Modal States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ staffId: '', date: selectedDate, status: 'present', checkIn: '', checkOut: '' });

  // Transform staff data from Redux to match component format
  const staffList = useMemo(() =>
    staffRedux.filter(staff => staff.role !== 'customer' && staff.role !== 'superadmin').map(staff => ({
      _id: staff._id,
      name: staff.name,
      role: staff.role,
      shift: staff.shift || 'Morning',
      initials: staff.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      color: '#C9A84C',
      leavesTotal: staff.leavesTotal || 12,
      leavesTaken: staff.leavesTaken || 0
    }))
    , [staffRedux]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading attendance for date:', selectedDate);
      const attendanceRes = await attendanceAPI.getAll({ date: selectedDate });
      console.log('Attendance response:', attendanceRes.data);
      setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    dispatch(fetchStaffUsers());
  }, [dispatch]);

  // Load attendance when date changes
  useEffect(() => {
    loadData();
  }, [selectedDate, loadData]);

  // Load leave status when date changes (not on staff list changes to prevent infinite loop)
  useEffect(() => {
    const loadLeaveStatus = async () => {
      if (staffList.length === 0) return;

      try {
        const leavePromises = staffList.map(staff =>
          attendanceAPI.checkLeave(staff._id, selectedDate)
            .then(res => ({ staffId: staff._id, leaveData: res.data }))
            .catch(() => ({ staffId: staff._id, leaveData: { onLeave: false } }))
        );

        const leaveResults = await Promise.all(leavePromises);
        const leaveStatusMap = {};
        leaveResults.forEach(({ staffId, leaveData }) => {
          leaveStatusMap[staffId] = leaveData;
        });
        setLeaveStatus(leaveStatusMap);
      } catch (error) {
        console.error('Error loading leave status:', error);
      }
    };

    loadLeaveStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]); // Only depend on selectedDate to prevent infinite loop

  const filtered = attendance.filter(a =>
    a.role !== 'superadmin' &&
    (a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getShiftTime = (shift) => {
    switch (shift) {
      case 'Morning':
        return '09:00';
      case 'Evening':
        return '17:00';
      case 'Both':
        return '09:00';
      default:
        return '09:00';
    }
  };

  const handleAdd = () => {
    setCurrentItem(null);
    // Pre-select current user for non-managers
    const initialStaffId = canFullManage ? '' : user._id;
    const initialCheckIn = canFullManage ? '' : getShiftTime(user?.shift || 'Morning');

    setFormData({
      staffId: initialStaffId,
      date: selectedDate,
      status: 'present',
      checkIn: initialCheckIn,
      checkOut: ''
    });
    setShowForm(true);
  };

  const handleStaffChange = (staffId) => {
    const selectedStaff = staffList.find(staff => staff._id === staffId);
    if (selectedStaff) {
      const defaultCheckIn = getShiftTime(selectedStaff.shift);
      setFormData({
        ...formData,
        staffId,
        checkIn: defaultCheckIn
      });
    } else {
      setFormData({ ...formData, staffId, checkIn: '' });
    }
  };

  const handleEdit = (item) => {
    // Non-managers can only edit their own attendance
    if (!canFullManage && item.staffId !== user._id) {
      alert('You can only edit your own attendance');
      return;
    }

    setCurrentItem(item);
    const staff = staffList.find(s => s._id === item.staffId);
    const defaultCheckIn = item.checkIn || (staff ? getShiftTime(staff.shift) : '');
    setFormData({
      staffId: item.staffId,
      date: item.date,
      status: item.status,
      checkIn: defaultCheckIn,
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
      alert(error.response?.data?.message || 'Failed to mark as present');
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
      alert(error.response?.data?.message || 'Failed to mark as absent');
    }
  };

  const handleAutoMarkLeave = async (staffId) => {
    try {
      const staff = staffList.find(s => s._id === staffId);
      await attendanceAPI.autoMarkLeave(staffId, selectedDate);
      alert(`${staff?.name || 'Staff'} marked as on-leave`);
      loadData();
    } catch (error) {
      console.error('Error marking leave:', error);
      alert(error.response?.data?.message || 'Failed to mark as on-leave');
    }
  };

  // Reload leave status when staff list is initially loaded
  useEffect(() => {
    if (staffList.length > 0 && Object.keys(leaveStatus).length === 0) {
      const loadLeaveStatus = async () => {
        try {
          const leavePromises = staffList.map(staff =>
            attendanceAPI.checkLeave(staff._id, selectedDate)
              .then(res => ({ staffId: staff._id, leaveData: res.data }))
              .catch(() => ({ staffId: staff._id, leaveData: { onLeave: false } }))
          );

          const leaveResults = await Promise.all(leavePromises);
          const leaveStatusMap = {};
          leaveResults.forEach(({ staffId, leaveData }) => {
            leaveStatusMap[staffId] = leaveData;
          });
          setLeaveStatus(leaveStatusMap);
        } catch (error) {
          console.error('Error loading leave status:', error);
        }
      };
      loadLeaveStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffList.length]); // Only run when staff list length changes (initial load)

  const handleSave = async () => {
    try {
      if (!formData.staffId) {
        alert('Please select a staff member');
        return;
      }

      // Non-managers can only edit their own attendance
      if (!canFullManage && currentItem && currentItem.staffId !== user._id) {
        alert('You can only edit your own attendance');
        return;
      }

      // Non-managers can only create attendance for themselves
      if (!canFullManage && !currentItem && formData.staffId !== user._id) {
        alert('You can only mark your own attendance');
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
      // Double-check permission before delete
      if (!canFullManage) {
        alert('You do not have permission to delete attendance records');
        return;
      }

      await attendanceAPI.delete(currentItem._id);
      setShowDelete(false);
      loadData();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance');
    }
  };

  const handleUpdateLateToPresent = async () => {
    if (!canFullManage) {
      alert('You do not have permission to update attendance records');
      return;
    }

    if (!window.confirm('Are you sure you want to update all "late" records to "present"?')) {
      return;
    }

    try {
      const response = await attendanceAPI.updateLateToPresent();
      alert(response.data.message || `Updated ${response.data.modifiedCount} records`);
      loadData();
    } catch (error) {
      console.error('Error updating late records:', error);
      alert('Failed to update records');
    }
  };

  const getStats = () => {
    const filteredAttendance = attendance.filter(a => a.role !== 'superadmin');
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(a => a.status === 'present').length;
    const absent = filteredAttendance.filter(a => a.status === 'absent').length;
    const late = filteredAttendance.filter(a => a.status === 'late').length;
    const onLeave = filteredAttendance.filter(a => a.status === 'on-leave').length;

    return { total, present, absent, late, onLeave };
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
        <div className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
          {canManageAttendance && (
            <button
              className="d-btn-gold w-100 w-sm-auto"
              onClick={handleAdd}
            >
              <MdEdit /> Add Attendance
            </button>
          )}

          {canFullManage && (
            <button
              className="d-btn-outline w-100 w-sm-auto"
              onClick={handleUpdateLateToPresent}
            >
              Update Late to Present
            </button>
          )}
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
            { label: 'Late', value: stats.late, icon: <MdCalendarToday />, color: 'd-blue' },
            { label: 'On Leave', value: stats.onLeave, icon: <MdCalendarToday />, color: 'd-purple' }
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

      <div className="d-flex gap-3 flex-wrap mb-3">
        <div
          className="d-navbar-search-box m-0"
          style={{ width: "250px" }}
        >
          <MdSearch className="d-search-icon" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="d-d-navbar-search-box p-0">
          <Form.Group className="mb-0">
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', height: '44px' }}
            />
          </Form.Group>
        </div>
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
                {canManageAttendance && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={canManageAttendance ? 7 : 6} className="text-center py-4">Loading...</td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManageAttendance ? 7 : 6} className="text-center py-4 text-muted">No attendance records found</td>
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
                      <span className={`d-chip ${item.status === 'present' ? 'd-chip-green' : item.status === 'absent' ? 'd-chip-red' : item.status === 'late' ? 'd-chip-gold' : 'd-chip-blue'}`} style={{ fontSize: '0.7rem' }}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>{item.checkIn || '-'}</td>
                    <td>{item.checkOut || '-'}</td>
                    {canManageAttendance ? (
                      <td>
                        <div className="d-flex gap-1">
                          <button className="d-navbar-icon-btn" onClick={() => handleEdit(item)}>
                            <MdEdit />
                          </button>
                          {canFullManage && (
                            <button className="d-navbar-icon-btn text-danger" onClick={() => handleDeleteClick(item)}>
                              <MdDelete />
                            </button>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td className="text-muted small">View Only</td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canManageAttendance && (
        <>
          <h5 className="mt-5 mb-3">
            {canFullManage ? 'Quick Actions - Mark Today\'s Attendance' : 'Mark Your Attendance'}
          </h5>
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
              staffList
                .filter(staff => canFullManage || staff._id === user._id)
                .map((staff) => {
                  const todayAttendance = attendance.find(a => a.staffId === staff._id && a.date === selectedDate);
                  const staffLeaveStatus = leaveStatus[staff._id] || { onLeave: false };
                  const isOnLeave = staffLeaveStatus.onLeave;

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
                              <div className="small text-muted">{staff.role} • {staff.shift}</div>
                            </div>
                          </div>
                          {todayAttendance ? (
                            <span className={`d-chip ${todayAttendance.status === 'present' ? 'd-chip-green' : todayAttendance.status === 'absent' ? 'd-chip-red' : todayAttendance.status === 'late' ? 'd-chip-gold' : 'd-chip-blue'}`} style={{ fontSize: '0.65rem' }}>
                              {todayAttendance.status.toUpperCase()}
                            </span>
                          ) : isOnLeave ? (
                            <span className="d-chip d-chip-blue" style={{ fontSize: '0.65rem' }}>
                              ON LEAVE
                            </span>
                          ) : null}
                        </div>

                        {isOnLeave && !todayAttendance && (
                          <div className="small text-muted mb-2">
                            <em>{staffLeaveStatus.leaveType?.toUpperCase()} - {staffLeaveStatus.leaveReason}</em>
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button
                            className={`d-btn-outline flex-grow-1 ${todayAttendance?.status === 'present' ? 'd-btn-gold' : ''}`}
                            onClick={() => handleMarkPresent(staff._id)}
                            disabled={todayAttendance?.status === 'present' || isOnLeave}
                            style={{ padding: '6px', fontSize: '0.8rem' }}
                          >
                            <MdCheckCircle /> Present
                          </button>
                          <button
                            className={`d-btn-outline flex-grow-1 text-danger ${todayAttendance?.status === 'absent' ? 'd-btn-gold' : ''}`}
                            onClick={() => handleMarkAbsent(staff._id)}
                            disabled={todayAttendance?.status === 'absent' || isOnLeave}
                            style={{ padding: '6px', fontSize: '0.8rem' }}
                          >
                            <MdCancel /> Absent
                          </button>
                          {isOnLeave && !todayAttendance && (
                            <button
                              className="d-btn-outline flex-grow-1 text-primary"
                              onClick={() => handleAutoMarkLeave(staff._id)}
                              style={{ padding: '6px', fontSize: '0.8rem' }}
                            >
                              Mark Leave
                            </button>
                          )}
                        </div>
                      </div>
                    </Col>
                  );
                })
            )}
          </Row>
        </>
      )}

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
                onChange={(e) => handleStaffChange(e.target.value)}
                required
                disabled={!canFullManage}
              >
                <option value="">Select Staff</option>
                {staffList.map(staff => (
                  <option key={staff._id} value={staff._id}>{staff.name} ({staff.shift})</option>
                ))}
              </Form.Select>
              {!canFullManage && (
                <Form.Text className="text-muted">
                  You can only mark your own attendance
                </Form.Text>
              )}
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
                <option value="on-leave">On Leave</option>
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
