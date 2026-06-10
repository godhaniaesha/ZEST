const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { auth, authorizeRoles } = require('../middleware/auth');

// Helper to check for auth optionally
const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();
  
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};

router.get('/', auth, authorizeRoles('manager', 'superadmin', 'waiter'), async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user's reservations
router.get('/my', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user.id });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  console.log('--- NEW RESERVATION REQUEST ---');
  console.log('Body:', req.body);
  console.log('Auth User:', req.user);
  
  // Use userId from body, or from authenticated user token, or null
  const finalUserId = req.body.userId || (req.user ? req.user.id : null);
  console.log('Final User ID:', finalUserId);

  if (!finalUserId && !req.body.customerName) {
    console.log('No user ID or customer name found for reservation');
    return res.status(400).json({ message: 'User ID or Customer Name is required' });
  }
  
  const reservation = new Reservation({
    customerName: req.body.customerName,
    phone: req.body.phone,
    email: req.body.email,
    userId: finalUserId,
    date: req.body.date,
    time: req.body.time,
    guests: req.body.guests,
    tableNumber: req.body.tableNumber,
    status: req.body.status || 'Pending'
  });

  try {
    const newReservation = await reservation.save();
    console.log('Reservation saved successfully with ID:', newReservation._id);
    console.log('Final Associated UserId:', newReservation.userId);
    res.status(201).json(newReservation);
  } catch (err) {
    console.error('Reservation save error:', err);
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'waiter'), async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
