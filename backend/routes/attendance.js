const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorizeRoles } = require('../middleware/auth');

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
router.post('/', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;

    // Get staff details
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if attendance already exists for this staff and date
    const existingAttendance = await Attendance.findOne({
      staffId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    const attendance = new Attendance({
      staffId,
      staffName: staff.name,
      role: staff.role,
      date: new Date(date),
      status,
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
router.put('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const { staffId, date, status, checkIn, checkOut, notes } = req.body;

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

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

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
router.post('/mark-present/:staffId', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({
      staffId: req.params.staffId,
      date: attendanceDate
    });

    if (attendance) {
      attendance.status = 'present';
      attendance.checkIn = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      await attendance.save();
    } else {
      attendance = new Attendance({
        staffId: req.params.staffId,
        staffName: staff.name,
        role: staff.role,
        date: attendanceDate,
        status: 'present',
        checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      await attendance.save();
    }

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark staff as absent
router.post('/mark-absent/:staffId', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const { date } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();

    const staff = await User.findById(req.params.staffId);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
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

module.exports = router;
