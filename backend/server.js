const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const crypto = require("crypto");

if (!global.crypto) {
  global.crypto = crypto;
}

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const tableRoutes = require('./routes/tables');
const staffRoutes = require('./routes/staff');
const inventoryRoutes = require('./routes/inventory');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const Menu = require('./models/Menu');
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
// Temporarily make /api/menu public for testing!
app.use('/api/menu', menuRoutes);
app.use('/api/orders', auth, orderRoutes);
app.use('/api/tables', auth, tableRoutes);
app.use('/api/staff', auth, staffRoutes);
app.use('/api/inventory', auth, inventoryRoutes);
app.use('/api/reservations', auth, reservationRoutes);
app.use('/api/users', auth, userRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zest-restaurant')
.then(async () => {
  console.log('MongoDB connected');
try {
  const items = await Menu.find({});
  let migrated = 0;
  for (const item of items) {
    const nextType = toMenuTypeArray(item.type, item.category);
    const current = JSON.stringify(Array.isArray(item.type) ? item.type : []);
    if (current !== JSON.stringify(nextType)) {
      item.type = nextType;
      await item.save();
      migrated += 1;
    }
  }
  console.log(`Menu type migration completed (${migrated} updated)`);
} catch (err) {
  console.error('Error migrating missing menu types:', err);
}
})
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Zest Restaurant API is running!');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error: ", err);
  res.status(500).json({ 
    message: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
