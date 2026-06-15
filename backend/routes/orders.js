const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
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
    const order = new Order({
      id: req.body.id,
      table: req.body.table,
      waiter: req.body.waiter,
      items: req.body.items,
      type: req.body.type,
      amount: req.body.amount,
      status: req.body.status || 'Pending',
      time: req.body.time,
      userId: req.body.userId,
      reservationId: req.body.reservationId
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/payment-status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Paid', 'Cancelled'];

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
