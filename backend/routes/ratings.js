const express = require('express');
const router = express.Router();
const ItemRating = require('../models/ItemRating');
const ReservationRating = require('../models/ReservationRating');
const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Menu = require('../models/Menu');
const { auth, authorizeRoles } = require('../middleware/auth');

const userOwnsOrder = async (userId, order) => {
  if (order.userId && order.userId.toString() === userId) return true;
  if (!order.reservationId) return false;
  const reservation = await Reservation.findById(order.reservationId);
  return reservation?.userId?.toString() === userId;
};

const updateMenuAverage = async (menuItemId) => {
  if (!menuItemId) return;
  const ratings = await ItemRating.find({ menuItemId });
  if (ratings.length === 0) {
    await Menu.findByIdAndUpdate(menuItemId, {
      rating: null,
      reviews: 0
    });
    return;
  }
  const avg = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  await Menu.findByIdAndUpdate(menuItemId, {
    rating: Math.round(avg * 10) / 10,
    reviews: ratings.length
  });
};

router.get('/my', auth, async (req, res) => {
  try {
    const ratings = await ItemRating.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reservation/pending', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      userId: req.user.id,
      status: 'Completed',
      rated: { $ne: true },
    })
      .populate('table')
      .sort({ updatedAt: 1 });

    res.json({ reservation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    const ratings = await ItemRating.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reservation', auth, async (req, res) => {
  try {
    const { reservationId, rating, review, comment } = req.body;

    if (!reservationId || !rating) {
      return res.status(400).json({ message: 'reservationId and rating are required' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.userId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only rate your own reservations' });
    }

    if (reservation.status !== 'Completed') {
      return res.status(400).json({ message: 'Reservation must be completed before rating' });
    }

    if (reservation.rated) {
      return res.status(409).json({ message: 'This reservation has already been rated' });
    }

    const existingRating = await ReservationRating.findOne({ reservationId });
    if (existingRating) {
      await Reservation.findByIdAndUpdate(reservationId, {
        rated: true,
        ratedAt: existingRating.createdAt || new Date(),
      });
      return res.status(409).json({ message: 'This reservation has already been rated' });
    }

    const reservationRating = await ReservationRating.create({
      userId: req.user.id,
      reservationId,
      rating: numericRating,
      review: (review ?? comment ?? '').trim(),
    });

    await Reservation.findByIdAndUpdate(reservationId, {
      rated: true,
      ratedAt: new Date(),
    });

    res.status(201).json(reservationRating);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'This reservation has already been rated' });
    }
    res.status(400).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { orderId, itemId, rating, comment, menuItemId } = req.body;

    if (!orderId || !itemId || !rating) {
      return res.status(400).json({ message: 'orderId, itemId, and rating are required' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const ownsOrder = await userOwnsOrder(req.user.id, order);
    if (!ownsOrder) return res.status(403).json({ message: 'You can only rate your own orders' });

    const orderItem = order.items.id(itemId);
    if (!orderItem) return res.status(404).json({ message: 'Item not found in order' });

    if (orderItem.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot rate a cancelled item' });
    }

    const resolvedMenuItemId = menuItemId || orderItem.menuItemId;

    const itemRating = await ItemRating.findOneAndUpdate(
      { userId: req.user.id, orderId, itemId },
      {
        userId: req.user.id,
        orderId,
        itemId,
        menuItemId: resolvedMenuItemId || undefined,
        itemName: orderItem.name,
        rating: numericRating,
        comment: comment || ''
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await updateMenuAverage(resolvedMenuItemId);

    res.status(201).json(itemRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
