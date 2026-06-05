const Reservation = require('../models/Reservation');
const User = require('../models/User');

const mapReservationBody = (body) => {
  const payload = {
    customerName: body.customerName || body.name,
    phone: body.phone,
    email: body.email,
    date: body.date,
    time: body.time,
    guests: parseInt(body.guests, 10) || 1,
    tableNumber: parseInt(body.tableNumber || body.table, 10),
    status: body.status || 'Pending',
  };
  if (body.userId) payload.userId = body.userId;
  return payload;
};

const attachUserIdByEmail = async (data) => {
  if (data.userId || !data.email) return data;
  const email = String(data.email).trim();
  const user = await User.findOne({ email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
  if (user) data.userId = user._id;
  return data;
};

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reservations = await Reservation.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConfirmedForOrders = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const filter = { status: 'Confirmed' };

    // Optional: ?today=1 limits to today's bookings only
    if (req.query.today === '1' || req.query.today === 'true') {
      filter.date = { $gte: startOfToday, $lt: endOfToday };
    }

    const reservations = await Reservation.find(filter).sort({ date: 1, tableNumber: 1 });

    const enriched = await Promise.all(
      reservations.map(async (r) => {
        const doc = r.toObject();
        const bookingDate = new Date(doc.date);
        doc.isToday =
          bookingDate >= startOfToday && bookingDate < endOfToday;
        if (!doc.userId && doc.email) {
          const em = String(doc.email).trim();
          const user = await User.findOne({
            email: {
              $regex: new RegExp(`^${em.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
            },
          });
          if (user) doc.userId = user._id;
        }
        return doc;
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyReservations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reservations = await Reservation.find({ email: user.email }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPublic = async (req, res) => {
  try {
    const data = await attachUserIdByEmail(mapReservationBody(req.body));
    const reservation = new Reservation(data);
    const newReservation = await reservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await attachUserIdByEmail(mapReservationBody(req.body));
    const reservation = new Reservation(data);
    const newReservation = await reservation.save();
    res.status(201).json(newReservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await attachUserIdByEmail(mapReservationBody(req.body));
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Confirmed', 'Pending', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.cancelMyReservation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      email: user.email,
    });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    reservation.status = 'Cancelled';
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    res.json({ message: 'Reservation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
