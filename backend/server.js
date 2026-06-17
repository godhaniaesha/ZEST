require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const stripe = require('stripe')(process.env.STRIPE_SECRET);

console.log("Stripe PK:", process.env.STRIPE_PUBLISHABLE_KEY);

const crypto = require('crypto');

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const STAFF_ROLES = [
  'superadmin',
  'manager',
  'chef',
  'waiter',
  'cashier',
  'bartender'
];
if (!global.crypto) {
  global.crypto = crypto;
}

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const ratingRoutes = require('./routes/ratings');
const tableRoutes = require('./routes/tables');
const staffRoutes = require('./routes/staff');
const inventoryRoutes = require('./routes/inventory');
const reservationRoutes = require('./routes/reservations');
const categoryRoutes = require('./routes/categories');
const cuisineRoutes = require('./routes/cuisines');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const blogRoutes = require('./routes/blog');
const galleryRoutes = require('./routes/gallery');
const paymentRoutes = require("./routes/payment");

const Menu = require('./models/Menu');
const Table = require('./models/Table');

const { auth, authorizeRoles } = require('./middleware/auth');
const { toMenuTypeArray } = require('./utils/menuType');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/gallery', galleryRoutes);

// Public tables endpoint
app.get('/api/tables/public', async (req, res) => {
  try {
    const tables = await Table.find({ type: 'Cafe' }).sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.use('/api/orders', orderRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cuisines', cuisineRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/blog', blogRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contacts', contactRoutes);
app.use("/api/payment", paymentRoutes);
// MongoDB connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
    'mongodb://localhost:27017/zest-restaurant'
  )
  .then(async () => {
    console.log('MongoDB connected');

    try {
      const items = await Menu.find({});
      let migrated = 0;

      for (const item of items) {
        const nextType = toMenuTypeArray(
          item.type,
          item.category
        );

        const current = JSON.stringify(
          Array.isArray(item.type) ? item.type : []
        );

        if (current !== JSON.stringify(nextType)) {
          item.type = nextType;
          await item.save();
          migrated++;
        }
      }

      console.log(
        `Menu type migration completed (${migrated} updated)`
      );
    } catch (err) {
      console.error(
        'Error migrating missing menu types:',
        err
      );
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/', (req, res) => {
  res.send('Zest Restaurant API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  res.status(500).json({
    message: err.message,
    stack:
      process.env.NODE_ENV === 'development'
        ? err.stack
        : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
