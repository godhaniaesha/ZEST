const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, authorizeRoles } = require('../middleware/auth');

const parseDateStr = (input) => {
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    const d = new Date(input.getFullYear(), input.getMonth(), input.getDate());
    return d;
  }
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.trim())) {
    const [y, m, d] = input.trim().split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const isStaffOnLeave = async (staffId, date) => {
  const targetDate = parseDateStr(date);
  if (!targetDate) return false;
  const approvedLeave = await Leave.findOne({
    staffId,
    status: 'approved',
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate }
  });
  return !!approvedLeave;
};

const isLateCheckIn = (checkInTime) => {
  if (!checkInTime) return false;
  const [hours, minutes] = checkInTime.split(':').map(Number);
  return hours > 9 || (hours === 9 && minutes > 30);
};

// Get all attendance records with optional filtering
router.get('/', auth, async (req, res) => {
  try {
    const { date, staffId, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      const normalizedDate = parseDateStr(date);
      if (normalizedDate) {
        const startOfDay = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate());
        const endOfDay = new Date(normalizedDate.getFullYear(), normalizedDate.getMonth(), normalizedDate.getDate() + 1);
        query.date = { $gte: startOfDay, $lt: endOfDay };
        console.log('Querying attendance for date range:', { startOfDay, endOfDay });
      }
    }

    if (staffId) {
      query.staffId = staffId;
    }

    if (startDate && endDate) {
      const s = parseDateStr(startDate);
      const e = parseDateStr(endDate);
      if (s && e) {
        const start = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const end = new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1);
        query.date = { $gte: start, $lt: end };
      }
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    console.log('Found attendance records:', attendance.length, 'for query:', JSON.stringify(query));
    res.json(attendance);
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get attendance by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new attendance record
router.post('/', auth, async (req, res) => {
  try {
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;
    console.log('Creating attendance - staffId:', staffId, 'date:', date, 'checkIn:', checkIn, 'checkOut:', checkOut);

    const canManageStatus = ['superadmin', 'manager'].includes(req.user.role);
    let finalStatus = status;
    if (!canManageStatus) finalStatus = 'present';

    const staff = await User.findById(staffId);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const attendanceDate = parseDateStr(date);
    if (!attendanceDate) return res.status(400).json({ message: 'Invalid date provided' });

    const existingAttendance = await Attendance.findOne({ staffId, date: attendanceDate });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    if (finalStatus === 'present' || finalStatus === 'absent') {
      const onLeave = await isStaffOnLeave(staffId, attendanceDate);
      if (onLeave) return res.status(400).json({ message: 'Staff is on approved leave for this date' });
    }

    const attendance = new Attendance({
      staffId,
      staffName: staff.name,
      role: staff.role,
      date: attendanceDate,
      status: finalStatus,
      checkIn,
      checkOut,
      notes
    });

    const savedAttendance = await attendance.save();
    console.log('Saved attendance - ID:', savedAttendance._id, 'status:', savedAttendance.status);
    res.status(201).json(savedAttendance);
  } catch (err) {
    console.error('Create attendance error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;
    console.log('Updating attendance ID:', req.params.id, 'checkIn:', checkIn, 'checkOut:', checkOut);

    const existingAttendance = await Attendance.findById(req.params.id);
    if (!existingAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const canManageStatus = ['superadmin', 'manager'].includes(req.user.role);
    let updateData = { ...req.body };

    if (!canManageStatus) updateData.status = existingAttendance.status;

    if (staffId) {
      const staff = await User.findById(staffId);
      if (!staff) return res.status(404).json({ message: 'Staff member not found' });
      updateData.staffName = staff.name;
      updateData.role = staff.role;
    }

    if (date) {
      const normalizedDate = parseDateStr(date);
      if (normalizedDate) updateData.date = normalizedDate;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated attendance - ID:', attendance._id, 'status:', attendance.status);
    res.json(attendance);
  } catch (err) {
    console.error('Update attendance error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete attendance record
router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark staff as present
router.post('/mark-present/:staffId', auth, async (req, res) => {
  try {
    const { date, checkIn } = req.body;
    const attendanceDate = date ? parseDateStr(date) : (() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    })();
    if (!attendanceDate) return res.status(400).json({ message: 'Invalid date provided' });

    console.log('Marking present staffId:', req.params.staffId, 'date:', attendanceDate);

    const staff = await User.findById(req.params.staffId);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const onLeave = await isStaffOnLeave(req.params.staffId, attendanceDate);
    if (onLeave) return res.status(400).json({ message: 'Staff is on approved leave for this date' });

    let attendance = await Attendance.findOne({ staffId: req.params.staffId, date: attendanceDate });
    const checkInTime = checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const status = 'present';

    if (attendance) {
      attendance.status = status;
      attendance.checkIn = checkInTime;
      await attendance.save();
      console.log('Updated existing attendance to present:', attendance._id);
    } else {
      attendance = new Attendance({
        staffId: req.params.staffId,
        staffName: staff.name,
        role: staff.role,
        date: attendanceDate,
        status,
        checkIn: checkInTime
      });
      await attendance.save();
      console.log('Created new attendance (present):', attendance._id);
    }

    res.json(attendance);
  } catch (err) {
    console.error('Error marking present:', err);
    res.status(500).json({ message: err.message });
  }
});

// Mark staff as absent
router.post('/mark-absent/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? parseDateStr(date) : (() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    })();
    if (!attendanceDate) return res.status(400).json({ message: 'Invalid date provided' });

    console.log('Marking absent staffId:', req.params.staffId, 'date:', attendanceDate);

    const staff = await User.findById(req.params.staffId);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const onLeave = await isStaffOnLeave(req.params.staffId, attendanceDate);
    if (onLeave) return res.status(400).json({ message: 'Staff is on approved leave for this date' });

    let attendance = await Attendance.findOne({ staffId: req.params.staffId, date: attendanceDate });

    if (attendance) {
      attendance.status = 'absent';
      attendance.checkIn = null;
      attendance.checkOut = null;
      await attendance.save();
      console.log('Updated existing attendance to absent:', attendance._id);
    } else {
      attendance = new Attendance({
        staffId: req.params.staffId,
        staffName: staff.name,
        role: staff.role,
        date: attendanceDate,
        status: 'absent',
        checkIn: null,
        checkOut: null
      });
      await attendance.save();
      console.log('Created new attendance (absent):', attendance._id);
    }

    res.json(attendance);
  } catch (err) {
    console.error('Error marking absent:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get attendance statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      const nd = parseDateStr(date);
      if (nd) {
        query.date = {
          $gte: new Date(nd.getFullYear(), nd.getMonth(), nd.getDate()),
          $lt: new Date(nd.getFullYear(), nd.getMonth(), nd.getDate() + 1)
        };
      }
    }

    if (startDate && endDate) {
      const s = parseDateStr(startDate);
      const e = parseDateStr(endDate);
      if (s && e) {
        query.date = {
          $gte: new Date(s.getFullYear(), s.getMonth(), s.getDate()),
          $lt: new Date(e.getFullYear(), e.getMonth(), e.getDate() + 1)
        };
      }
    }

    const attendance = await Attendance.find(query);

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      onLeave: attendance.filter(a => a.status === 'on-leave').length
    };

    res.json(stats);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Check if staff is on leave for a specific date
router.get('/check-leave/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? parseDateStr(date) : (() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    })();
    if (!targetDate) return res.status(400).json({ message: 'Invalid date provided' });

    const onLeave = await isStaffOnLeave(req.params.staffId, targetDate);

    if (onLeave) {
      const leave = await Leave.findOne({
        staffId: req.params.staffId,
        status: 'approved',
        startDate: { $lte: targetDate },
        endDate: { $gte: targetDate }
      });

      return res.json({
        onLeave: true,
        leaveType: leave?.type || 'leave',
        leaveReason: leave?.reason || '',
        startDate: leave?.startDate,
        endDate: leave?.endDate
      });
    }

    res.json({ onLeave: false });
  } catch (err) {
    console.error('Check leave error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update all late records to present (admin only)
router.post('/update-late-to-present', auth, authorizeRoles('superadmin', 'manager'), async (req, res) => {
  try {
    const result = await Attendance.updateMany(
      { status: 'late' },
      { status: 'present' }
    );
    
    console.log(`Updated ${result.modifiedCount} late records to present`);
    res.json({ 
      message: `Updated ${result.modifiedCount} late records to present`,
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error('Error updating late records:', err);
    res.status(500).json({ message: err.message });
  }
});

// Auto-mark attendance for staff on approved leave
router.post('/auto-mark-leave/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? parseDateStr(date) : (() => {
      const d = new Date();
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    })();
    if (!attendanceDate) return res.status(400).json({ message: 'Invalid date provided' });

    console.log('Auto-marking leave staffId:', req.params.staffId, 'date:', attendanceDate);

    const staff = await User.findById(req.params.staffId);
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    const leave = await Leave.findOne({
      staffId: req.params.staffId,
      status: 'approved',
      startDate: { $lte: attendanceDate },
      endDate: { $gte: attendanceDate }
    });

    if (!leave) {
      return res.status(400).json({ message: 'Staff is not on approved leave for this date' });
    }

    let attendance = await Attendance.findOne({ staffId: req.params.staffId, date: attendanceDate });

    if (attendance) {
      attendance.status = 'on-leave';
      attendance.notes = `On ${leave.type} leave: ${leave.reason}`;
      await attendance.save();
      console.log('Updated existing attendance to on-leave:', attendance._id);
    } else {
      attendance = new Attendance({
        staffId: req.params.staffId,
        staffName: staff.name,
        role: staff.role,
        date: attendanceDate,
        status: 'on-leave',
        notes: `On ${leave.type} leave: ${leave.reason}`
      });
      await attendance.save();
      console.log('Created new on-leave attendance:', attendance._id);
    }

    res.json(attendance);
  } catch (err) {
    console.error('Error auto-marking leave:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
