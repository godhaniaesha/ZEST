const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const { auth, authorizeRoles } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  const table = new Table({
    number: req.body.number,
    capacity: req.body.capacity,
    type: req.body.type,
    status: req.body.status,
    location: req.body.location
  });

  try {
    const newTable = await table.save();
    res.status(201).json(newTable);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'waiter'), async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
