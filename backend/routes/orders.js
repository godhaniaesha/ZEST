const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const ItemRating = require('../models/ItemRating');
const { auth, authorizeRoles } = require('../middleware/auth');

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

    // Check if reservation has advance payment paid
    let initialStatus = req.body.status || 'Pending';
    if (req.body.reservationId) {
      const reservation = await Reservation.findById(req.body.reservationId);
      if (reservation && reservation.advancePaymentStatus === 'Paid') {
        initialStatus = 'Paid';
      }
    }

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
        { fullPaymentDone: true }
      );

      // Free the table associated with the reservation
      const reservation = await Reservation.findById(order.reservationId).populate('table');
      if (reservation && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'Free' });
      }
    }

    // If order status becomes Completed, free the table
    if (status === 'Completed' && order.reservationId) {
      const reservation = await Reservation.findById(order.reservationId).populate('table');
      if (reservation && reservation.table) {
        await Table.findByIdAndUpdate(reservation.table._id, { status: 'Free' });
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

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Served'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid item status'
      });
    }

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        'items._id': req.params.itemId
      },
      {
        $set: {
          'items.$.status': status
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order or item not found'
      });
    }

    // Check if all items are now 'Served', if so mark order as 'Completed'
    const allItemsServed = order.items.every(item => item.status === 'Served');
    if (allItemsServed) {
      await Order.findByIdAndUpdate(req.params.orderId, { status: 'Completed' });
      order.status = 'Completed';

      // Free the table associated with the reservation
      if (order.reservationId) {
        const reservation = await Reservation.findById(order.reservationId).populate('table');
        if (reservation && reservation.table) {
          await Table.findByIdAndUpdate(reservation.table._id, { status: 'Free' });
        }
      }
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
