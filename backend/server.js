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
  'cashier'
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
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');

const Menu = require('./models/Menu');
const Table = require('./models/Table');
const User = require('./models/User');

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
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
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

    try {
      const STAFF_SEED_FIELDS = {
        'admin@zest.com': { shift: 'Morning', salary: '80000', leavesTaken: 1, leavesTotal: 12, joiningDate: new Date('2023-01-01') },
        'john@zest.com': { shift: 'Both', salary: '70000', leavesTaken: 2, leavesTotal: 12, joiningDate: new Date('2023-06-15') },
        'marco@zest.com': { shift: 'Morning', salary: '55000', leavesTaken: 0, leavesTotal: 12, joiningDate: new Date('2024-02-01') },
        'sam@zest.com': { shift: 'Evening', salary: '25000', leavesTaken: 1, leavesTotal: 12, joiningDate: new Date('2024-04-10') },
        'sarah@zest.com': { shift: 'Morning', salary: '22000', leavesTaken: 3, leavesTotal: 12, joiningDate: new Date('2024-01-20') },
        'mike@zest.com': { shift: 'Evening', salary: '30000', leavesTaken: 0, leavesTotal: 12, joiningDate: new Date('2024-03-01') },
      };

      const staffUsers = await User.find({ role: { $ne: 'customer' } });
      let staffMigrated = 0;

      for (const user of staffUsers) {
        const seed = STAFF_SEED_FIELDS[user.email];
        let changed = false;

        if (!user.shift) {
          user.shift = seed?.shift || 'Morning';
          changed = true;
        }
        if ((user.salary == null || user.salary === '') && seed?.salary) {
          user.salary = seed.salary;
          changed = true;
        }
        if (user.leavesTaken == null) {
          user.leavesTaken = seed?.leavesTaken ?? 0;
          changed = true;
        }
        if (user.leavesTotal == null) {
          user.leavesTotal = seed?.leavesTotal ?? 12;
          changed = true;
        }
        if (!user.joiningDate && seed?.joiningDate) {
          user.joiningDate = seed.joiningDate;
          changed = true;
        }

        if (changed) {
          await user.save();
          staffMigrated++;
        }
      }

      console.log(`Staff fields migration completed (${staffMigrated} updated)`);
    } catch (err) {
      console.error('Error migrating staff fields:', err);
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
