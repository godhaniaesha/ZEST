const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, authorizeRoles } = require('../middleware/auth');

const ADMIN_ROLES = ['manager', 'superadmin'];
const LEAVE_TYPES = ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'other'];

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);

/**
 * Keep the staff member's `leavesTaken` counter in sync when a leave
 * request is approved / un-approved (rejected, cancelled or deleted).
 */
const adjustLeavesTaken = async (staffId, delta) => {
  if (!delta) return null;

  const staff = await User.findById(staffId);
  if (!staff) return null;

  staff.leavesTaken = Math.max(0, (staff.leavesTaken || 0) + delta);
  await staff.save();
  return staff;
};

/** Recalculate remaining balance for a staff member. */
const getBalanceFor = async (staffId) => {
  const approvedLeaves = await Leave.find({ staffId, status: 'approved' });
  const totalTaken = approvedLeaves.reduce((sum, l) => sum + (l.days || 0), 0);

  const staff = await User.findById(staffId);
  const total = staff?.leavesTotal ?? 12;

  return {
    staffId: staff?._id,
    staffName: staff?.name,
    leavesTotal: total,
    leavesTaken: totalTaken,
    leavesRemaining: Math.max(0, total - totalTaken),
  };
};

/* ─────────────────────────────────────────────
   STATS SUMMARY  (declared before /:id so it matches)
 ───────────────────────────────────────────── */
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const query = isAdmin(req.user) ? {} : { staffId: req.user.id };

    const leaves = await Leave.find(query);

    const stats = {
      pending: leaves.filter((l) => l.status === 'pending').length,
      approved: leaves.filter((l) => l.status === 'approved').length,
      rejected: leaves.filter((l) => l.status === 'rejected').length,
      cancelled: leaves.filter((l) => l.status === 'cancelled').length,
      totalDays: leaves
        .filter((l) => l.status === 'approved')
        .reduce((sum, l) => sum + (l.days || 0), 0),
      pendingDays: leaves
        .filter((l) => l.status === 'pending')
        .reduce((sum, l) => sum + (l.days || 0), 0),
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching leave statistics:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   CURRENT USER'S OWN LEAVE REQUESTS + BALANCE
 ───────────────────────────────────────────── */
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ staffId: req.user.id }).sort({ createdAt: -1 });
    const balance = await getBalanceFor(req.user.id);

    res.json({ leaves, balance });
  } catch (err) {
    console.error('Error fetching own leaves:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   STAFF LEAVE BALANCE  (declared before /:id)
 ───────────────────────────────────────────── */
router.get('/staff/:staffId/balance', auth, async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!isValidObjectId(staffId)) {
      return res.status(400).json({ message: 'Invalid staff member ID' });
    }

    if (!isAdmin(req.user) && String(staffId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const balance = await getBalanceFor(staffId);

    if (!balance.staffId) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.json(balance);
  } catch (err) {
    console.error('Error fetching leave balance:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   LIST ALL LEAVE REQUESTS (with filtering)
 ───────────────────────────────────────────── */
router.get('/', auth, async (req, res) => {
  try {
    const { status, staffId, startDate, endDate } = req.query;

    const query = {};

    // Non-admins can only see their own leave requests
    if (!isAdmin(req.user)) {
      query.staffId = req.user.id;
    } else if (staffId && isValidObjectId(staffId)) {
      query.staffId = staffId;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   GET LEAVE BY ID
 ───────────────────────────────────────────── */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (!isAdmin(req.user) && String(leave.staffId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leave);
  } catch (err) {
    console.error('Error fetching leave request:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   CREATE NEW LEAVE REQUEST
 ───────────────────────────────────────────── */
router.post('/', auth, async (req, res) => {
  try {
    const {
      staffId: bodyStaffId,
      startDate,
      endDate,
      startTime,
      endTime,
      type,
      reason,
    } = req.body;

    // Staff can only create their own requests; admins can create for anyone
    const staffId = isAdmin(req.user) && bodyStaffId ? bodyStaffId : req.user.id;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    if (!type || !LEAVE_TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid leave type' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'A reason is required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role === 'customer') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Reject overlapping pending/approved requests
    const overlappingLeave = await Leave.findOne({
      staffId,
      status: { $in: ['pending', 'approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlappingLeave) {
      return res
        .status(400)
        .json({ message: 'Staff already has a leave request for this period' });
    }

    const leave = new Leave({
      staffId,
      staffName: staff.name,
      role: staff.role,
      startDate: start,
      endDate: end,
      startTime: startTime || null,
      endTime: endTime || null,
      type,
      reason: reason.trim(),
      days,
      status: 'pending',
    });

    const savedLeave = await leave.save();

    // Return the balance so the UI can warn about over-use immediately
    const balance = await getBalanceFor(staffId);

    res.status(201).json({ ...savedLeave.toObject(), balance });
  } catch (err) {
    console.error('Error creating leave request:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   APPROVE LEAVE REQUEST
 ───────────────────────────────────────────── */
router.post('/approve/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }


    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const previousStaffId = String(leave.staffId);
    const previousDays = leave.days;
    const previousStatus = leave.status;
    const wasApproved = leave.status === 'approved';
    const {
      staffId, startDate, endDate, startTime, endTime, type, reason,
      status, rejectionReason,
    } = req.body;

    if (staffId && String(staffId) !== previousStaffId) {
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      leave.staffId = staff._id;
      leave.staffName = staff.name;
      leave.role = staff.role;
    }

    if (startDate !== undefined) leave.startDate = new Date(startDate);
    if (endDate !== undefined) leave.endDate = new Date(endDate);
    if (startTime !== undefined) leave.startTime = startTime;
    if (endTime !== undefined) leave.endTime = endTime;
    if (type !== undefined) leave.type = type;
    if (reason !== undefined) leave.reason = reason;
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid leave status' });
      }
      leave.status = status;
    }

    if (leave.endDate < leave.startDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (leave.status === 'approved' && previousStatus !== 'approved') {
      leave.approvedBy = req.user._id;
      leave.approvedDate = new Date();
      leave.rejectionReason = undefined;
    } else if (leave.status === 'rejected' && previousStatus !== 'rejected') {
      leave.approvedBy = req.user._id;
      leave.approvedDate = new Date();
      leave.rejectionReason = rejectionReason || 'No reason provided';
    } else if (leave.status === 'rejected' && rejectionReason !== undefined) {
      leave.rejectionReason = rejectionReason || 'No reason provided';
    } else if (leave.status === 'pending') {
      leave.approvedBy = undefined;
      leave.approvedDate = undefined;
      leave.rejectionReason = undefined;
    }

    await leave.save();

    const currentStaffId = String(leave.staffId);
    const isApproved = leave.status === 'approved';
    if (previousStaffId === currentStaffId) {
      const daysDelta = (isApproved ? leave.days : 0) - (wasApproved ? previousDays : 0);
      if (daysDelta !== 0) {
        await User.findByIdAndUpdate(currentStaffId, { $inc: { leavesTaken: daysDelta } });
      }
    } else {
      if (wasApproved) {
        await User.findByIdAndUpdate(previousStaffId, { $inc: { leavesTaken: -previousDays } });
      }
      if (isApproved) {
        await User.findByIdAndUpdate(currentStaffId, { $inc: { leavesTaken: leave.days } });
      }
    }

    res.json(leave);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }

});



// Delete leave request

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {

  try {

    const leave = await Leave.findById(req.params.id);

    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }

    if (leave.status === 'approved') {
      await User.findByIdAndUpdate(leave.staffId, {
        $inc: { leavesTaken: -leave.days },
      });
    }
    await leave.deleteOne();

    res.json({ message: 'Leave request deleted' });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



// Approve leave request

router.post('/approve/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {

  try {

    const leave = await Leave.findById(req.params.id);

    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }



    if (leave.status !== 'pending') {
      return res
        .status(400)
        .json({ message: `Leave request is already ${leave.status}` });
    }

    // Admins should not approve their own leave
    if (String(leave.staffId) === String(req.user.id)) {
      return res
        .status(400)
        .json({ message: 'You cannot approve your own leave request' });
    }

    leave.status = 'approved';
    leave.rejectionReason = undefined;
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();

    const saved = await leave.save();

    // Count the days against the staff member's balance
    await adjustLeavesTaken(leave.staffId, leave.days);

    const balance = await getBalanceFor(leave.staffId);

    res.json({ ...saved.toObject(), balance });
  } catch (err) {
    console.error('Error approving leave request:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   REJECT LEAVE REQUEST
 ───────────────────────────────────────────── */
router.post('/reject/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const { rejectionReason } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res
        .status(400)
        .json({ message: `Leave request is already ${leave.status}` });
    }

    const wasApproved = leave.status === 'approved';

    leave.status = 'rejected';
    leave.rejectionReason = rejectionReason?.trim() || 'No reason provided';
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();

    const saved = await leave.save();

    if (wasApproved) {
      await adjustLeavesTaken(leave.staffId, -leave.days);
    }

    res.json(saved);
  } catch (err) {
    console.error('Error rejecting leave request:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   CANCEL LEAVE REQUEST (staff can cancel their own)
 ───────────────────────────────────────────── */
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (!isAdmin(req.user) && String(leave.staffId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (leave.status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Only pending leave requests can be cancelled' });
    }

    leave.status = 'cancelled';
    leave.approvedBy = req.user.id;
    leave.approvedDate = new Date();

    const saved = await leave.save();
    res.json(saved);
  } catch (err) {
    console.error('Error cancelling leave request:', err);
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   UPDATE LEAVE REQUEST
 ───────────────────────────────────────────── */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const { staffId, startDate, endDate, startTime, endTime, type, reason } = req.body;

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const admin = isAdmin(req.user);
    if (!admin && (String(leave.staffId) !== String(req.user.id) || leave.status !== 'pending')) {
      return res.status(403).json({ message: 'Only your own pending leave request can be edited' });
    }

    const updateData = {};

    // Staff assignment
    if (admin && staffId && String(staffId) !== String(leave.staffId)) {
      const staff = await User.findById(staffId);
      if (!staff || staff.role === 'customer') {
        return res.status(404).json({ message: 'Staff member not found' });
      }
      updateData.staffId = staff._id;
      updateData.staffName = staff.name;
      updateData.role = staff.role;
    }

    // Dates
    const newStart = startDate ? new Date(startDate) : leave.startDate;
    const newEnd = endDate ? new Date(endDate) : leave.endDate;

    if (Number.isNaN(newStart.getTime()) || Number.isNaN(newEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (newEnd < newStart) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    updateData.startDate = newStart;
    updateData.endDate = newEnd;
    updateData.days = Math.ceil((newEnd - newStart) / (1000 * 60 * 60 * 24)) + 1;

    if (startTime !== undefined) updateData.startTime = startTime || null;
    if (endTime !== undefined) updateData.endTime = endTime || null;
    if (type !== undefined) {
      if (!LEAVE_TYPES.includes(type)) {
        return res.status(400).json({ message: 'Invalid leave type' });
      }
      updateData.type = type;
    }
    if (reason !== undefined) updateData.reason = reason;

    if (reason !== undefined && !reason.trim()) {
      return res.status(400).json({ message: 'A reason is required' });
    }

    if (!admin) {
      const overlappingLeave = await Leave.findOne({
        _id: { $ne: leave._id },
        staffId: leave.staffId,
        status: { $in: ['pending', 'approved'] },
        startDate: { $lte: newEnd },
        endDate: { $gte: newStart },
      });
      if (overlappingLeave) {
        return res.status(400).json({ message: 'Staff already has a leave request for this period' });
      }
    }

    // Status changes are handled by the approve / reject / cancel endpoints
    delete req.body.status;
    delete updateData.status;

    const previousStatus = leave.status;
    const previousDays = leave.days;

    Object.assign(leave, updateData);
    const saved = await leave.save();

    // If an approved leave is edited, re-sync the balance with the new day count
    if (previousStatus === 'approved' && saved.days !== previousDays) {
      await adjustLeavesTaken(saved.staffId, saved.days - previousDays);
    }

    res.json(saved);
  } catch (err) {
    console.error('Error updating leave request:', err);
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────
   DELETE LEAVE REQUEST
 ───────────────────────────────────────────── */
router.delete('/:id', auth, authorizeRoles(...ADMIN_ROLES), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    await Leave.findByIdAndDelete(id);

    // Give the days back if it had already been approved
    if (leave.status === 'approved') {
      await adjustLeavesTaken(leave.staffId, -leave.days);
    }

    res.json({ message: 'Leave request deleted' });
  } catch (err) {
    console.error('Error deleting leave request:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
