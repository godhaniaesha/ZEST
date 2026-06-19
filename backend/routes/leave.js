const express = require('express');

const router = express.Router();

const Leave = require('../models/Leave');

const User = require('../models/User');

const { auth, authorizeRoles } = require('../middleware/auth');



// Get all leave requests with optional filtering

router.get('/', auth, async (req, res) => {

  try {

    const { status, staffId, startDate, endDate } = req.query;

    let query = {};

    // Non-admin users can only see their own leave requests
    const isAdmin = req.user.role === 'superadmin' || req.user.role === 'manager';
    if (!isAdmin) {
      query.staffId = req.user.id.toString(); // Ensure string comparison
      console.log('Filtering for non-admin user, staffId:', req.user.id.toString());
    } else {
      console.log('Admin user, showing all leaves');
    }

    if (status) {

      query.status = status;

    }

    // Only allow staffId filter for admins
    if (staffId && isAdmin) {

      query.staffId = staffId;

    }

    if (startDate && endDate) {

      query.startDate = {

        $gte: new Date(startDate),

        $lte: new Date(endDate)

      };

    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    console.log('Found leaves for user:', req.user.id, 'role:', req.user.role, 'count:', leaves.length);
    res.json(leaves);

  } catch (err) {

    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: err.message });

  }

});



// Get leave by ID

router.get('/:id', auth, async (req, res) => {

  try {

    const leave = await Leave.findById(req.params.id);

    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }

    res.json(leave);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



// Create new leave request

router.post('/', auth, async (req, res) => {

  try {

    const { staffId, startDate, endDate, startTime, endTime, type, reason } = req.body;

    console.log('Creating leave request for staffId:', staffId, 'by user:', req.user.id, 'role:', req.user.role);

    // Check if user is trying to create leave for themselves or is admin/manager
    const isAdmin = req.user.role === 'superadmin' || req.user.role === 'manager';
    if (!isAdmin && staffId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only create leave requests for yourself.' });
    }

    // Get staff details

    const staff = await User.findById(staffId);

    if (!staff) {

      return res.status(404).json({ message: 'Staff member not found' });

    }



    // Calculate days

    const start = new Date(startDate);

    const end = new Date(endDate);

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;



    // Check for overlapping leave requests

    const overlappingLeave = await Leave.findOne({

      staffId,

      status: { $in: ['pending', 'approved'] },

      $or: [

        { startDate: { $lte: end }, endDate: { $gte: start } }

      ]

    });



    if (overlappingLeave) {

      return res.status(400).json({ message: 'Staff already has a leave request for this period' });

    }



    const leave = new Leave({

      staffId,

      staffName: staff.name,

      role: staff.role,

      startDate: new Date(startDate),

      endDate: new Date(endDate),

      startTime: startTime || null,
      endTime: endTime || null,
      type,

      reason,

      days,

      status: 'pending'

    });



    const savedLeave = await leave.save();
    console.log('Leave request created successfully:', savedLeave);
    res.status(201).json(savedLeave);

  } catch (err) {

    console.error('Error creating leave request:', err);
    res.status(400).json({ message: err.message });

  }

});



// Update leave request

router.put('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {

  try {

    const { staffId, startDate, endDate, startTime, endTime, type, reason } = req.body;



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

    // Ensure time fields are included
    if (startTime !== undefined) {
      updateData.startTime = startTime;
    }
    if (endTime !== undefined) {
      updateData.endTime = endTime;
    }



    // Recalculate days if dates changed

    if (startDate && endDate) {

      const start = new Date(startDate);

      const end = new Date(endDate);

      updateData.days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    }



    const leave = await Leave.findByIdAndUpdate(

      req.params.id,

      updateData,

      { new: true, runValidators: true }

    );



    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }



    res.json(leave);

  } catch (err) {

    res.status(400).json({ message: err.message });

  }

});



// Delete leave request

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {

  try {

    const leave = await Leave.findByIdAndDelete(req.params.id);

    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }

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

      return res.status(400).json({ message: 'Leave request is not pending' });

    }



    leave.status = 'approved';

    leave.approvedBy = req.user._id;

    leave.approvedDate = new Date();



    // Update staff's leave count

    const staff = await User.findById(leave.staffId);

    if (staff) {

      staff.leavesTaken = (staff.leavesTaken || 0) + leave.days;

      await staff.save();

    }



    await leave.save();

    res.json(leave);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



// Reject leave request

router.post('/reject/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {

  try {

    const { rejectionReason } = req.body;



    const leave = await Leave.findById(req.params.id);

    if (!leave) {

      return res.status(404).json({ message: 'Leave request not found' });

    }



    if (leave.status !== 'pending') {

      return res.status(400).json({ message: 'Leave request is not pending' });

    }



    leave.status = 'rejected';

    leave.rejectionReason = rejectionReason || 'No reason provided';

    leave.approvedBy = req.user._id;

    leave.approvedDate = new Date();



    await leave.save();

    res.json(leave);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



// Get leave statistics

router.get('/stats/summary', auth, async (req, res) => {

  try {

    const leaves = await Leave.find();



    const stats = {

      pending: leaves.filter(l => l.status === 'pending').length,

      approved: leaves.filter(l => l.status === 'approved').length,

      rejected: leaves.filter(l => l.status === 'rejected').length,

      totalDays: leaves.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0)

    };



    res.json(stats);

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



// Get staff leave balance

router.get('/staff/:staffId/balance', auth, async (req, res) => {

  try {

    const staff = await User.findById(req.params.staffId);

    if (!staff) {

      return res.status(404).json({ message: 'Staff member not found' });

    }



    const approvedLeaves = await Leave.find({

      staffId: req.params.staffId,

      status: 'approved'

    });



    const totalTaken = approvedLeaves.reduce((sum, l) => sum + l.days, 0);



    res.json({

      staffId: staff._id,

      staffName: staff.name,

      leavesTotal: staff.leavesTotal || 12,

      leavesTaken: totalTaken,

      leavesRemaining: (staff.leavesTotal || 12) - totalTaken

    });

  } catch (err) {

    res.status(500).json({ message: err.message });

  }

});



module.exports = router;

