const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, authorizeRoles } = require('../middleware/auth');

// Helper function to check if staff is on approved leave for a specific date
const isStaffOnLeave = async (staffId, date) => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const approvedLeave = await Leave.findOne({
    staffId,
    status: 'approved',
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate }
  });
  
  return !!approvedLeave;
};

// Helper function to determine if check-in time is late (after 9:30 AM)
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
      query.date = new Date(date);
    }

    if (staffId) {
      query.staffId = staffId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
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

    // Check if user is trying to create their own attendance or is a manager/superadmin
    const isOwnAttendance = req.user.id.toString() === staffId;
    const isManager = req.user.role === 'manager' || req.user.role === 'superadmin';
    
    if (!isOwnAttendance && !isManager) {
      return res.status(403).json({ message: 'Access denied. You can only create your own attendance.' });
    }

    // Get staff details
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Normalize date
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already exists for this staff and date
    const existingAttendance = await Attendance.findOne({
      staffId,
      date: attendanceDate
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    // Check if staff is on approved leave (only for present/absent status)
    if (status === 'present' || status === 'absent') {
      const onLeave = await isStaffOnLeave(staffId, attendanceDate);
      if (onLeave) {
        return res.status(400).json({ message: 'Staff is on approved leave for this date' });
      }
    }

    // Auto-detect late status if check-in time is provided and status is present
    let finalStatus = status;
    if (status === 'present' && checkIn && isLateCheckIn(checkIn)) {
      finalStatus = 'late';
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
    res.status(201).json(savedAttendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update attendance record
router.put('/:id', auth, async (req, res) => {
  try {
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;

    // Get the existing attendance record
    const existingAttendance = await Attendance.findById(req.params.id);
    if (!existingAttendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check if user is trying to update their own attendance or is a manager/superadmin
    const isOwnAttendance = req.user.id.toString() === existingAttendance.staffId.toString();
    const isManager = req.user.role === 'manager' || req.user.role === 'superadmin';
    
    if (!isOwnAttendance && !isManager) {
      return res.status(403).json({ message: 'Access denied. You can only update your own attendance.' });
    }

    // If staffId is being updated, get new staff details
    let updateData = { ...req.body };
    if (staffId) {
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      updateData.staffName = staff.name;
      updateData.role = staff.role;
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(attendance);
  } catch (err) {
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
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Normalize date to remove time component for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if user is trying to mark their own attendance or is a manager/superadmin
    const isOwnAttendance = req.user.id.toString() === req.params.staffId;
    const isManager = req.user.role === 'manager' || req.user.role === 'superadmin';
    
    if (!isOwnAttendance && !isManager) {
      return res.status(403).json({ message: 'Access denied. You can only mark your own attendance.' });
    }

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if staff is on approved leave
    const onLeave = await isStaffOnLeave(req.params.staffId, attendanceDate);
    if (onLeave) {
      return res.status(400).json({ message: 'Staff is on approved leave for this date' });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      staffId: req.params.staffId,
      date: attendanceDate
    });

    // Use provided check-in time or current time
    const checkInTime = checkIn || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Auto-detect late status
    const status = isLateCheckIn(checkInTime) ? 'late' : 'present';

    if (attendance) {
      attendance.status = status;
      attendance.checkIn = checkInTime;
      await attendance.save();
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
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark staff as absent
router.post('/mark-absent/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    
    // Normalize date to remove time component for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if user is trying to mark their own attendance or is a manager/superadmin
    const isOwnAttendance = req.user.id.toString() === req.params.staffId;
    const isManager = req.user.role === 'manager' || req.user.role === 'superadmin';
    
    if (!isOwnAttendance && !isManager) {
      return res.status(403).json({ message: 'Access denied. You can only mark your own attendance.' });
    }

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if staff is on approved leave
    const onLeave = await isStaffOnLeave(req.params.staffId, attendanceDate);
    if (onLeave) {
      return res.status(400).json({ message: 'Staff is on approved leave for this date' });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      staffId: req.params.staffId,
      date: attendanceDate
    });

    if (attendance) {
      attendance.status = 'absent';
      attendance.checkIn = null;
      attendance.checkOut = null;
      await attendance.save();
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
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = {};

    if (date) {
      query.date = new Date(date);
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query);

    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if staff is on leave for a specific date
router.get('/check-leave/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

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
        leaveType: leave.type,
        leaveReason: leave.reason,
        startDate: leave.startDate,
        endDate: leave.endDate
      });
    }

    res.json({ onLeave: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Auto-mark attendance for staff on approved leave
router.post('/auto-mark-leave/:staffId', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if user is trying to mark their own attendance or is a manager/superadmin
    const isOwnAttendance = req.user.id.toString() === req.params.staffId;
    const isManager = req.user.role === 'manager' || req.user.role === 'superadmin';
    
    if (!isOwnAttendance && !isManager) {
      return res.status(403).json({ message: 'Access denied. You can only mark your own attendance.' });
    }

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if staff is on approved leave
    const leave = await Leave.findOne({
      staffId: req.params.staffId,
      status: 'approved',
      startDate: { $lte: attendanceDate },
      endDate: { $gte: attendanceDate }
    });

    if (!leave) {
      return res.status(400).json({ message: 'Staff is not on approved leave for this date' });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      staffId: req.params.staffId,
      date: attendanceDate
    });

    if (attendance) {
      attendance.status = 'on-leave';
      attendance.notes = `On ${leave.type} leave: ${leave.reason}`;
      await attendance.save();
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
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
