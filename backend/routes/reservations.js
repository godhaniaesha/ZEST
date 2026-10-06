const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Payment = require('../models/Payment');
const Stripe = require('stripe');
const { auth, authorizeRoles } = require('../middleware/auth');
const {
  findReservationConflict,
  isReservationStartingSoon,
  syncTableReservationStatus,
  withTableBookingLock,
} = require('../utils/reservationTableStatus');

const stripe = Stripe(process.env.STRIPE_SECRET);
const ADVANCE_AMOUNT = Reservation.ADVANCE_AMOUNT || 200;
const getReservationConflictMessage = (table) => {
  const displayId = table.displayId
    || `${table.type === 'Bar' ? 'B' : 'C'}-${String(table.number).padStart(2, '0')}`;
  return `${displayId} is already booked for that time. Choose another table or select a time at least 45 minutes apart.`;
};

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
      res.json(reservations.map((reservation) => ({
        ...reservation.toJSON(),
        reservationAlertDue: Boolean(
          reservation.stripePaymentIntentId &&
          isReservationStartingSoon(reservation)
        ),
      })));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get('/availability', async (req, res) => {
  try {
    const { table, date, time } = req.query;
    if (!table || !date || !time) {
      return res.status(400).json({
        available: false,
        message: 'Table, date, and time are required.',
      });
    }

    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      return res.status(404).json({ available: false, message: 'Selected table not found.' });
    }

    const conflict = await findReservationConflict(table, date, time);
    res.json({
      available: !conflict,
      message: conflict
        ? getReservationConflictMessage(tableDoc)
        : 'Table is available.',
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ available: false, message: err.message });
  }
});

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
  let paymentCompleted = false;
  let reservationSaved = false;
  try {
    const tableId = await resolveTableId(req.body);

    if (!tableId) {
      return res.status(400).json({
        message: 'Table is required. Please select a valid table.',
      });
    }
    if (!(await Table.exists({ _id: tableId }))) {
      return res.status(400).json({ message: 'Selected table not found.' });
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
    paymentCompleted = true;

    const finalUserId = req.body.userId || (req.user ? req.user.id : null);
    const newReservation = await withTableBookingLock(tableId, async (tableDoc) => {
      const conflict = await findReservationConflict(tableId, req.body.date, req.body.time);
      if (conflict) {
        const error = new Error(getReservationConflictMessage(tableDoc));
        error.statusCode = 409;
        error.bookingConflict = true;
        throw error;
      }

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
      return reservation.save();
    });
    reservationSaved = true;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId },
      {
        reservationId: newReservation._id,
        paymentType: 'Advance',
        status: 'Succeeded',
      },
      { new: true }
    );

    await syncTableReservationStatus(tableId);

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('table');

    res.status(201).json(populatedReservation);
  } catch (err) {
    if (paymentCompleted && !reservationSaved && req.body.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: req.body.stripePaymentIntentId,
        });
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: req.body.stripePaymentIntentId },
          { status: 'Cancelled' }
        );
      } catch (refundError) {
        console.error('Failed to refund advance payment after table conflict:', refundError);
        return res.status(502).json({
          message: `${err.message} Your advance payment refund could not be confirmed. Please contact the restaurant with your payment reference.`,
          refundPending: true,
        });
      }
    }
    res.status(err.statusCode || 400).json({
      message: err.message,
      refunded: paymentCompleted && !reservationSaved,
    });
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
    if (!(await Table.exists({ _id: tableId }))) {
      return res.status(400).json({ message: 'Selected table not found.' });
    }

    const newReservation = await withTableBookingLock(tableId, async (tableDoc) => {
      const conflict = req.body.status === 'Cancelled'
        ? null
        : await findReservationConflict(tableId, req.body.date, req.body.time);
      if (conflict) {
        const error = new Error(getReservationConflictMessage(tableDoc));
        error.statusCode = 409;
        throw error;
      }

      return new Reservation({
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
      }).save();
    });

    await syncTableReservationStatus(tableId);

    const populatedReservation = await Reservation.findById(newReservation._id)
      .populate('table');

    res.status(201).json(populatedReservation);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'waiter'),
  async (req, res) => {
    try {
      const existingReservation = await Reservation.findById(req.params.id);
      if (!existingReservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const tableId = req.body.table
        ? req.body.table
        : await resolveTableId(req.body);
      const previousTableId = existingReservation.table?._id || existingReservation.table;
      const targetTableId = tableId || previousTableId;
      if (!targetTableId) {
        return res.status(400).json({ message: 'Table is required. Please select a valid table.' });
      }
      const targetDate = req.body.date || existingReservation.date;
      const targetTime = req.body.time || existingReservation.time;
      const targetStatus = req.body.status || existingReservation.status;

      const reservation = await withTableBookingLock(targetTableId, async (tableDoc) => {
        if (targetStatus !== 'Cancelled') {
          const conflict = await findReservationConflict(
            targetTableId,
            targetDate,
            targetTime,
            existingReservation._id
          );
          if (conflict) {
            const error = new Error(getReservationConflictMessage(tableDoc));
            error.statusCode = 409;
            throw error;
          }
        }

        return Reservation.findByIdAndUpdate(
          req.params.id,
          {
            customerName: req.body.customerName,
            phone: req.body.phone,
            email: req.body.email,
            date: targetDate,
            time: targetTime,
            guests: req.body.guests,
            table: targetTableId,
            status: targetStatus,
          },
          { new: true }
        ).populate('table');
      });

      if (String(previousTableId) !== String(targetTableId)) {
        await syncTableReservationStatus(previousTableId);
      }
      await syncTableReservationStatus(targetTableId);

      res.json(reservation);
    } catch (err) {
      res.status(err.statusCode || 400).json({ message: err.message });
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

      const currentReservation = await Reservation.findById(req.params.id);
      if (!currentReservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      const tableRef = currentReservation.table?._id || currentReservation.table;
      const reservation = await withTableBookingLock(tableRef, async () => {
        if (status !== 'Cancelled') {
          const conflict = await findReservationConflict(
            tableRef,
            currentReservation.date,
            currentReservation.time,
            currentReservation._id
          );
          if (conflict) {
            const error = new Error(
              'This table is already booked at that time. The reservation cannot be reactivated.'
            );
            error.statusCode = 409;
            throw error;
          }
        }

        return Reservation.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        ).populate('table');
      });

      await syncTableReservationStatus(tableRef);

      res.json(reservation);
    } catch (err) {
      res.status(err.statusCode || 400).json({ message: err.message });
    }
  }
);

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const tableId = reservation.table?._id || reservation.table;
    await Reservation.findByIdAndDelete(req.params.id);
    await syncTableReservationStatus(tableId);
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
