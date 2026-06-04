const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const staffMember = new Staff({
    name: req.body.name,
    role: req.body.role,
    shift: req.body.shift,
    status: req.body.status,
    initials: req.body.initials,
    color: req.body.color
  });

  try {
    const newStaff = await staffMember.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(staff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
