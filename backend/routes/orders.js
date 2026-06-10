const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, authorizeRoles } = require('../middleware/auth');

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
  const order = new Order({
    id: req.body.id,
    table: req.body.table,
    waiter: req.body.waiter,
    items: req.body.items,
    type: req.body.type,
    amount: req.body.amount,
    status: req.body.status,
    time: req.body.time,
    userId: req.body.userId,
    reservationId: req.body.reservationId
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Order.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
