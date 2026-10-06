const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const ItemRating = require('../models/ItemRating');
const { auth, authorizeRoles } = require('../middleware/auth');
const { syncTableReservationStatus } = require('../utils/reservationTableStatus');

router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const reservations = await Reservation.find({ userId });
    const reservationIds = reservations.map((r) => r._id);

    const orders = await Order.find({
      $or: [
        { userId },
        { reservationId: { $in: reservationIds } }
      ]
    }).sort({ createdAt: -1 });

    const ratings = await ItemRating.find({ userId });
    const ratingMap = {};
    ratings.forEach((r) => {
      ratingMap[`${r.orderId}_${r.itemId}`] = r;
    });

    const ordersWithRatings = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.map((item) => ({
        ...item,
        userRating: ratingMap[`${order._id}_${item._id}`] || null
      }));
      return orderObj;
    });

    res.json(ordersWithRatings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reservation/:reservationId', auth, async (req, res) => {
  try {
    const orders = await Order.find({ reservationId: req.params.reservationId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    let nextId = 1000;

    if (lastOrder && lastOrder.id) {
      nextId = parseInt(lastOrder.id, 10) + 1;
    }

    const initialStatus = req.body.status || 'Pending';

    const order = new Order({
      id: String(nextId),
      table: req.body.table,
      waiter: req.body.waiter,
      items: req.body.items,
      type: req.body.type,
      amount: req.body.amount,
      status: initialStatus,
      time: req.body.time,
      userId: req.body.userId,
      reservationId: req.body.reservationId
    });

    const newOrder = await order.save();

    if (req.body.reservationId) {
      await Reservation.findByIdAndUpdate(req.body.reservationId, {
        status: 'Confirmed',
      });
      const reservation = await Reservation.findById(req.body.reservationId).populate('table');
      const tableRef = reservation?.table?._id || reservation?.table;
      if (tableRef) {
        await Table.findByIdAndUpdate(tableRef, { status: 'Occupied' });
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

router.patch('/:id/payment-status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid payment status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    // If order status becomes Paid, free the table and mark reservation as fully paid
    if (status === 'Paid' && order.reservationId) {
      await Reservation.findByIdAndUpdate(
        order.reservationId,
        { fullPaymentDone: true, status: 'Completed' }
      );

      // Free the table associated with the reservation
      const reservation = await Reservation.findById(order.reservationId).populate('table');
      if (reservation && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'Free' });
        await syncTableReservationStatus(reservation.table._id);
      }
    }

    // If order status becomes Completed, free the table
    if (status === 'Completed' && order.reservationId) {
      const reservation = await Reservation.findById(order.reservationId).populate('table');
      if (reservation && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'Free' });
        await syncTableReservationStatus(reservation.table._id);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});


router.patch('/:orderId/items/:itemId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const nextStatusByCurrent = {
      Pending: 'Preparing',
      Preparing: 'Ready',
      Ready: 'Served',
    };
    if (!Object.values(nextStatusByCurrent).includes(status)) {
      return res.status(400).json({
        message: 'Item status must move from Pending to Preparing to Ready to Served.',
      });
    }

    const existingOrder = await Order.findOne(
      {
        _id: req.params.orderId,
        'items._id': req.params.itemId,
      },
    );

    if (!existingOrder) {
      return res.status(404).json({
        message: 'Order or item not found'
      });
    }

    if (existingOrder.status === 'Completed') {
      return res.status(409).json({ message: 'This order is already completed.' });
    }

    const existingItem = existingOrder.items.id(req.params.itemId);
    if (nextStatusByCurrent[existingItem.status] !== status) {
      return res.status(409).json({
        message: `This item is currently ${existingItem.status}. Refresh the kitchen display and try again.`,
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        status: { $ne: 'Completed' },
        items: {
          $elemMatch: {
            _id: req.params.itemId,
            status: existingItem.status,
          },
        },
      },
      { $set: { 'items.$.status': status } },
      { new: true }
    );

    if (!order) {
      return res.status(409).json({
        message: 'This item was updated by another user. Refresh the kitchen display and try again.',
      });
    }

    if (order.items.length > 0 && order.items.every((item) => item.status === 'Served')) {
      const completedOrder = await Order.findByIdAndUpdate(
        order._id,
        { status: 'Completed' },
        { new: true }
      );
      return res.json(completedOrder);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// Update to use _id instead of custom id
router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete to use _id instead of custom id
router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
