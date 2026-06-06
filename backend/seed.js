const mongoose = require('mongoose');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const Table = require('./models/Table');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zest-restaurant')
.then(async () => {
  console.log('MongoDB connected for seeding at', mongoose.connection.host);

  // Drop all collections
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    console.log('Dropping collection', collection.collectionName);
    await collection.drop().catch(err => console.log('Collection might not exist, skipping'));
  }

  console.log('All collections cleared!');

  const menuItems = await Menu.insertMany([
    { name: 'Truffle Risotto', category: 'Mains', price: 680, status: 'Available', type: ['Cafe'], cuisine: 'Italian', color: '#2ecc71' },
    { name: 'Mojito Classic', category: 'Cocktails', price: 320, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#3498db' },
    { name: 'Beef Tenderloin', category: 'Mains', price: 1200, status: 'Available', type: ['Cafe'], cuisine: 'Continental', color: '#2ecc71' },
    { name: 'Tiramisu', category: 'Desserts', price: 280, status: 'Sold Out', type: ['Cafe'], cuisine: 'Italian', color: '#e74c3c' },
    { name: 'Espresso Martini', category: 'Cocktails', price: 380, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#3498db' },
    { name: 'Caesar Salad', category: 'Starters', price: 320, status: 'Available', type: ['Cafe'], cuisine: 'Continental', color: '#f39c12' }
  ]);
  console.log('Inserted menu items:', menuItems.length);

  const orders = await Order.insertMany([
    { id: '#T-1021', table: 'Table 4', waiter: 'Raj', items: 'Truffle Risotto, Mojito x2', type: 'Cafe', amount: '₹1,320', status: 'Served', time: '2 min ago' },
    { id: '#T-1020', table: 'Table 7', waiter: 'Priya', items: 'Beef Tenderloin, Beer', type: 'Cafe', amount: '₹1,520', status: 'Preparing', time: '8 min ago' }
  ]);
  console.log('Inserted orders:', orders.length);

  const tables = await Table.insertMany([
    { number: 1, capacity: 2, type: 'Cafe', status: 'Free', location: 'Indoor' },
    { number: 2, capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
    { number: 3, capacity: 2, type: 'Cafe', status: 'Reserved', location: 'Outdoor' },
    { number: 4, capacity: 6, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
    { number: 5, capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
    { number: 6, capacity: 2, type: 'Cafe', status: 'Free', location: 'Outdoor' },
    { number: 7, capacity: 4, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
    { number: 8, capacity: 4, type: 'Cafe', status: 'Free', location: 'Outdoor' },
    { number: 101, capacity: 1, type: 'Bar', status: 'Occupied', location: 'Bar Counter' },
    { number: 102, capacity: 1, type: 'Bar', status: 'Free', location: 'Bar Counter' }
  ]);
  console.log('Inserted tables:', tables.length);

  const staff = await Staff.insertMany([
    { name: 'Rajesh Kumar', role: 'Head Chef', shift: 'Morning', status: 'On Duty', initials: 'RK', color: '#C9A84C' },
    { name: 'Priya Sharma', role: 'Waiter', shift: 'Evening', status: 'On Duty', initials: 'PS', color: '#3498db' },
    { name: 'Sam D\'Souza', role: 'Bartender', shift: 'Evening', status: 'On Duty', initials: 'SD', color: '#2ecc71' },
    { name: 'Anita Verma', role: 'Cashier', shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#9b59b6' }
  ]);
  console.log('Inserted staff:', staff.length);

  const inventoryItems = await Inventory.insertMany([
    { name: 'Rice', quantity: 50, unit: 'kg', category: 'Grains' },
    { name: 'Chicken', quantity: 25, unit: 'kg', category: 'Meat' },
    { name: 'Tomatoes', quantity: 30, unit: 'kg', category: 'Vegetables' }
  ]);
  console.log('Inserted inventory items:', inventoryItems.length);

  const reservations = await Reservation.insertMany([
    { customerName: 'Amit Patel', email: 'amit@example.com', phone: '9876543210', date: new Date(Date.now() + 86400000), time: '19:00', guests: 4, tableNumber: 3, status: 'Confirmed' },
    { customerName: 'Riya Singh', email: 'riya@example.com', phone: '9812345678', date: new Date(Date.now() + 172800000), time: '20:00', guests: 2, tableNumber: 6, status: 'Pending' }
  ]);
  console.log('Inserted reservations:', reservations.length);

  const users = await User.create([
    { name: 'Admin User', email: 'admin@zest.com', password: 'admin123', role: 'superadmin', status: 'Active' },
    { name: 'John Manager', email: 'john@zest.com', password: 'password123', role: 'manager', status: 'On Duty' },
    { name: 'Marco Chef', email: 'marco@zest.com', password: 'password123', role: 'chef', status: 'On Duty' },
    { name: 'Sam Waiter', email: 'sam@zest.com', password: 'password123', role: 'waiter', status: 'Active' },
    { name: 'Sarah Cashier', email: 'sarah@zest.com', password: 'password123', role: 'cashier', status: 'Active' },
    { name: 'Mike Bartender', email: 'mike@zest.com', password: 'password123', role: 'bartender', status: 'On Duty' },
    { name: 'Guest Customer', email: 'guest@zest.com', password: 'password123', role: 'customer', status: 'Active' }
  ]);
  console.log('Inserted users:', users.length);
  console.log('Users created with emails:', users.map(u => u.email));
  console.log('All users have password: password123 (except admin which has admin123)');
  
  console.log('Default admin created: email: admin@zest.com, password: admin123');
  console.log('Database seeded!');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
