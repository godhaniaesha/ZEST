const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Payment = require('../models/Payment');
const Stripe = require('stripe');
const { auth, authorizeRoles } = require('../middleware/auth');

const stripe = Stripe(process.env.STRIPE_SECRET);
const ADVANCE_AMOUNT = Reservation.ADVANCE_AMOUNT || 200;

const optionalAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return next();

  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};

const resolveTableId = async (body) => {
  if (body.table) return body.table;

  if (body.tableNumber != null) {
    const tableDoc = await Table.findOne({
      number: Number(body.tableNumber),
      type: 'Cafe',
    });
    if (tableDoc) return tableDoc._id;
  }

  return null;
};

router.get('/', auth, authorizeRoles('manager', 'superadmin', 'waiter'),
  async (req, res) => {
    try {
      const reservations = await Reservation.find().populate('table');
      res.json(reservations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get('/my', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user.id,
    }).populate('table');

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  try {
    const tableId = await resolveTableId(req.body);

    if (!tableId) {
      return res.status(400).json({
        message: 'Table is required. Please select a valid table.',
      });
    }

    const tableDoc = await Table.findById(tableId);
    if (!tableDoc) {
      return res.status(400).json({ message: 'Selected table not found.' });
    }

    if (tableDoc.status === 'Occupied') {
      return res.status(400).json({ message: 'Selected table is not available.' });
    }

    const { stripePaymentIntentId, paymentMethod } = req.body;

    if (!stripePaymentIntentId) {
      return res.status(400).json({
        message: `Advance payment of ₹${ADVANCE_AMOUNT} is required to confirm reservation.`,
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        message: 'Advance payment has not been completed. Please try again.',
      });
    }

    if (paymentIntent.amount !== ADVANCE_AMOUNT * 100) {
      return res.status(400).json({
        message: `Invalid advance payment amount. Expected ₹${ADVANCE_AMOUNT}.`,
      });
    }

    const finalUserId = req.body.userId || (req.user ? req.user.id : null);

    const reservation = new Reservation({
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      userId: finalUserId,
      date: req.body.date,
      time: req.body.time,
      guests: req.body.guests,
      table: tableId,
      seatingArea: req.body.seatingArea,
      specialOccasion: req.body.specialOccasion || 'none',
      specialRequests: req.body.specialRequests,
      advanceAmount: ADVANCE_AMOUNT,
      advancePaid: ADVANCE_AMOUNT,
      advancePaymentStatus: 'Paid',
      advancePaymentMethod: paymentMethod,
      stripePaymentIntentId,
      status: 'Pending',
    });

    const newReservation = await reservation.save();

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId },
      {
        reservationId: newReservation._id,
        paymentType: 'Advance',
        status: 'Succeeded',
      },
      { new: true }
    );

    await Table.findByIdAndUpdate(tableId, { status: 'Reserved' });

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('table');

    res.status(201).json(populatedReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin route to create reservation without payment requirement
router.post('/admin', auth, authorizeRoles('manager', 'superadmin', 'waiter'), async (req, res) => {
  try {
    const tableId = await resolveTableId(req.body);

    if (!tableId) {
      return res.status(400).json({
        message: 'Table is required. Please select a valid table.',
      });
    }

    const tableDoc = await Table.findById(tableId);
    if (!tableDoc) {
      return res.status(400).json({ message: 'Selected table not found.' });
    }

    const reservation = new Reservation({
      customerName: req.body.customerName,
      phone: req.body.phone,
      email: req.body.email,
      userId: req.user.id,
      date: req.body.date,
      time: req.body.time,
      guests: req.body.guests,
      table: tableId,
      seatingArea: req.body.seatingArea,
      specialOccasion: req.body.specialOccasion || 'none',
      specialRequests: req.body.specialRequests || req.body.notes,
      advanceAmount: ADVANCE_AMOUNT,
      advancePaid: 0,
      advancePaymentStatus: 'None',
      status: req.body.status || 'Pending',
    });

    const newReservation = await reservation.save();

    // Update table status if reservation is confirmed
    if (req.body.status === 'Confirmed') {
      await Table.findByIdAndUpdate(tableId, { status: 'Reserved' });
    }

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('table');

    res.status(201).json(populatedReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'waiter'),
  async (req, res) => {
    try {
      const tableId = req.body.table
        ? req.body.table
        : await resolveTableId(req.body);

      const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        {
          customerName: req.body.customerName,
          phone: req.body.phone,
          email: req.body.email,
          date: req.body.date,
          time: req.body.time,
          guests: req.body.guests,
          ...(tableId ? { table: tableId } : {}),
          status: req.body.status,
        },
        { new: true }
      ).populate('table');

      res.json(reservation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.patch('/:id/status', auth, authorizeRoles('manager', 'superadmin', 'waiter', 'cashier'),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid reservation status' });
      }

      const reservation = await Reservation.findByIdAndUpdate(
        req.params.id,
        {
          status,
          ...(status === 'Completed' ? { fullPaymentDone: true } : {}),
        },
        { new: true }
      ).populate('table');

      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (status === 'Confirmed' && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, { status: 'Reserved' });
      }

      if (status === 'Reserved' && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, { status: 'Reserved' });
      }

      if ((status === 'Cancelled' || status === 'Completed') && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, { status: 'Free' });
      }

      res.json(reservation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (reservation?.table) {
      await Table.findByIdAndUpdate(reservation.table, { status: 'Free' });
    }
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
