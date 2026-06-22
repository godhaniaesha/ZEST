const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { auth, authorizeRoles } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const staff = await Staff.find();

    console.log("staff", staff);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  const staffMember = new Staff({
    name: req.body.name,
    role: req.body.role,
    shift: req.body.shift,
    shiftStart: req.body.shiftStart,
    shiftEnd: req.body.shiftEnd,
    status: req.body.status,
    initials: req.body.initials,
    color: req.body.color,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
    salary: req.body.salary,
    leavesTaken: req.body.leavesTaken,
    leavesTotal: req.body.leavesTotal,
    joiningDate: req.body.joiningDate
  });

  try {
    const newStaff = await staffMember.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
