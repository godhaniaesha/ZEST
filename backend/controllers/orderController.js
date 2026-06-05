const Order = require('../models/Order');
const User = require('../models/User');
const Reservation = require('../models/Reservation');

const formatItemsSummary = (orderItems = []) =>
  orderItems
    .map((i) => `${i.name || 'Item'}${Number(i.qty) > 1 ? ` x${i.qty}` : ''}`)
    .join(', ');

const parseOrderItems = (body) => {
  let orderItems = body.orderItems;
  if (typeof orderItems === 'string') {
    try {
      orderItems = JSON.parse(orderItems);
    } catch {
      orderItems = [];
    }
  }
  return Array.isArray(orderItems) ? orderItems : [];
};

const nextOrderCode = async () => {
  const count = await Order.countDocuments();
  return `#T-${1020 + count + 1}`;
};

const resolveUserId = async (userId, reservationId) => {
  if (userId) return userId;
  if (!reservationId) return null;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) return null;
  if (reservation.userId) return reservation.userId;

  if (reservation.email) {
    const em = String(reservation.email).trim();
    const guest = await User.findOne({
      email: {
        $regex: new RegExp(`^${em.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      },
    });
    if (guest) return guest._id;
  }
  return null;
};

const toOrderResponse = (doc) => {
  const o = doc && doc.toObject ? doc.toObject() : doc;
  return { ...o, id: o.orderCode || o.id };
};

exports.getAll = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders.map(toOrderResponse));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    const orderItems = parseOrderItems(body);

    const table =
      body.table ||
      (body.tableNumber != null ? `Table ${body.tableNumber}` : null);

    const itemsText =
      (typeof body.items === 'string' && body.items.trim()) ||
      formatItemsSummary(orderItems);

    if (!table || !itemsText) {
      return res.status(400).json({
        message: 'Table and order items are required',
      });
    }

    const total =
      orderItems.length > 0
        ? orderItems.reduce(
            (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 1),
            0
          )
        : Number(body.total) || 0;

    const orderCode =
      (typeof body.orderCode === 'string' && body.orderCode.trim()) ||
      (await nextOrderCode());

    const amount =
      (typeof body.amount === 'string' && body.amount.trim()) ||
      `₹${total.toLocaleString('en-IN')}`;

    const resolvedUserId = await resolveUserId(body.userId, body.reservationId);

    const payload = {
      orderCode,
      table: String(table),
      tableNumber:
        body.tableNumber != null ? Number(body.tableNumber) : undefined,
      waiter: body.waiter || 'Staff',
      items: itemsText,
      orderItems: orderItems.map((i) => ({
        menuItemId: String(i.menuItemId || i._id || ''),
        name: String(i.name || 'Item'),
        price: Number(i.price) || 0,
        qty: Number(i.qty) || 1,
      })),
      type: body.type === 'Bar' ? 'Bar' : 'Cafe',
      amount,
      total,
      status: body.status || 'Pending',
      time: body.time || 'Just now',
      userId: resolvedUserId || undefined,
      reservationId: body.reservationId || undefined,
    };

    const saved = await Order.create(payload);
    console.log('[Order API] Created:', saved.orderCode);
    res.status(201).json(toOrderResponse(saved));
  } catch (err) {
    console.error('[Order API] Create failed:', err);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id;
    delete updates.orderCode;

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderCode: req.params.id }] },
      updates,
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(toOrderResponse(order));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      $or: [{ _id: req.params.id }, { orderCode: req.params.id }],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
