const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const { auth, authorizeRoles } = require('../middleware/auth');
const { syncAllTableReservationStatuses, getReservationStart, ACTIVE_RESERVATION_FILTER } = require('../utils/reservationTableStatus');

router.get('/', auth, async (req, res) => {
  try {
    await syncAllTableReservationStatuses();
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

// Get table availability with reservations for a specific date
router.get('/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    await syncAllTableReservationStatuses();
    const tables = await Table.find();

    // Get all reservations for the specified date
    const reservations = await Reservation.find({
      date: new Date(date),
      ...ACTIVE_RESERVATION_FILTER,
    }).populate('table');

    // Group reservations by table
    const tableReservations = {};
    reservations.forEach(reservation => {
      const tableId = String(reservation.table._id);
      if (!tableReservations[tableId]) {
        tableReservations[tableId] = [];
      }
      const start = getReservationStart(reservation);
      tableReservations[tableId].push({
        id: reservation._id,
        customerName: reservation.customerName,
        time: reservation.time,
        startTime: start,
        endTime: start ? new Date(start.getTime() + 45 * 60 * 1000) : null,
        status: reservation.status,
      });
    });

    // Add reservations to table data
    const tablesWithAvailability = tables.map(table => {
      const tableId = String(table._id);
      return {
        ...table.toJSON(),
        reservations: tableReservations[tableId] || [],
      };
    });

    res.json(tablesWithAvailability);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
