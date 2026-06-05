const mongoose = require('mongoose');
const Menu = require('./models/Menu');
const Category = require('./models/Category');
const Cuisine = require('./models/Cuisine');
const Order = require('./models/Order');
const Table = require('./models/Table');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
require('dotenv').config();

const IMG = {
  risotto: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80',
  mojito: 'https://images.unsplash.com/photo-1551538827-9b37f4b1f7d1?auto=format&fit=crop&w=600&q=80',
  beef: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
  tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80',
  martini: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  pasta: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80',
  beer: 'https://images.unsplash.com/photo-1608270586620-24848c78ada9?auto=format&fit=crop&w=600&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2724f3?auto=format&fit=crop&w=600&q=80',
  whiskey: 'https://images.unsplash.com/photo-1527281400683-1aae7dc6d8e5?auto=format&fit=crop&w=600&q=80',
};

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zest-restaurant')
  .then(async () => {
    console.log('MongoDB connected for seeding at', mongoose.connection.host);

    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      console.log('Dropping collection', collection.collectionName);
      await collection.drop().catch(() => console.log('Collection might not exist, skipping'));
    }

    console.log('All collections cleared!');

    const menuItems = await Menu.insertMany([
      { name: 'Truffle Risotto', category: 'Mains', price: 680, status: 'Available', type: ['Cafe'], cuisine: 'Italian', color: '#2ecc71', img: IMG.risotto },
      { name: 'Caesar Salad', category: 'Starters', price: 320, status: 'Available', type: ['Cafe'], cuisine: 'Continental', color: '#f39c12', img: IMG.salad },
      { name: 'Beef Tenderloin', category: 'Mains', price: 1200, status: 'Available', type: ['Cafe'], cuisine: 'Continental', color: '#2ecc71', img: IMG.beef },
      { name: 'Creamy Mushroom Pasta', category: 'Mains', price: 245, status: 'Available', type: ['Cafe'], cuisine: 'Italian', color: '#2ecc71', img: IMG.pasta },
      { name: 'Tiramisu', category: 'Desserts', price: 280, status: 'Sold Out', type: ['Cafe'], cuisine: 'Italian', color: '#e74c3c', img: IMG.tiramisu },
      { name: 'Chocolate Lava Cake', category: 'Desserts', price: 95, status: 'Available', type: ['Cafe'], cuisine: 'International', color: '#e74c3c', img: IMG.tiramisu },
      // { name: 'Avocado Toast', category: 'Starters', price: 145, status: 'Available', type: ['Cafe'], cuisine: 'International', color: '#f39c12', img: IMG.salad },
      { name: 'Grilled Salmon', category: 'Mains', price: 320, status: 'Available', type: ['Cafe'], cuisine: 'Continental', color: '#2ecc71', img: IMG.beef },
      { name: 'Mojito Classic', category: 'Cocktails', price: 320, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#3498db', img: IMG.mojito },
      { name: 'Espresso Martini', category: 'Cocktails', price: 380, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#3498db', img: IMG.martini },
      { name: 'Old Fashioned', category: 'Cocktails', price: 480, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#f39c12', img: IMG.whiskey },
      { name: 'Whiskey Sour', category: 'Cocktails', price: 440, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#e67e22', img: IMG.whiskey },
      { name: 'Kingfisher Draught', category: 'Beer', price: 180, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#3498db', img: IMG.beer },
      { name: 'House Red Wine', category: 'Wine', price: 420, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#e74c3c', img: IMG.wine },
      { name: 'Premium Vodka', category: 'Spirits', price: 350, status: 'Available', type: ['Bar'], cuisine: 'International', color: '#9b59b6', img: IMG.whiskey },
    ]);
    console.log('Inserted menu items:', menuItems.length);

    const categories = await Category.insertMany([
      { name: 'Starters', type: 'Cafe', img: IMG.salad },
      { name: 'Mains', type: 'Cafe', img: IMG.beef },
      { name: 'Desserts', type: 'Cafe', img: IMG.tiramisu },
      { name: 'Cocktails', type: 'Bar', img: IMG.mojito },
      { name: 'Beer', type: 'Bar', img: IMG.beer },
      { name: 'Wine', type: 'Bar', img: IMG.wine },
      { name: 'Spirits', type: 'Bar', img: IMG.whiskey },
    ]);
    console.log('Inserted categories:', categories.length);

    const cuisines = await Cuisine.insertMany([
      { name: 'Italian', type: 'Cafe', img: IMG.pasta },
      { name: 'Continental', type: 'Cafe', img: IMG.beef },
      { name: 'International', type: 'Cafe', img: IMG.salad },
      { name: 'Indian', type: 'Cafe', img: IMG.risotto },
      { name: 'Chinese', type: 'Cafe', img: IMG.salad },
      { name: 'Mexican', type: 'Cafe', img: IMG.salad },
      { name: 'Gujarati', type: 'Cafe', img: IMG.risotto },
      { name: 'Punjabi', type: 'Cafe', img: IMG.beef },
      { name: 'South Indian', type: 'Cafe', img: IMG.risotto },
      { name: 'International', type: 'Bar', img: IMG.martini },
    ]);
    console.log('Inserted cuisines:', cuisines.length);

    const orders = await Order.insertMany([
      { orderCode: '#T-1021', table: 'Table 4', waiter: 'Sam Waiter', items: 'Truffle Risotto, Mojito x2', type: 'Cafe', amount: '₹1,320', status: 'Served', time: '2 min ago' },
      { orderCode: '#T-1020', table: 'Table 7', waiter: 'Sam Waiter', items: 'Beef Tenderloin, House Red Wine', type: 'Cafe', amount: '₹1,620', status: 'Preparing', time: '8 min ago' },
      { orderCode: '#T-1019', table: 'Bar 101', waiter: 'Mike Bartender', items: 'Espresso Martini, Old Fashioned', type: 'Bar', amount: '₹860', status: 'Pending', time: '12 min ago' },
      { orderCode: '#T-1018', table: 'Table 2', waiter: 'Sam Waiter', items: 'Caesar Salad, Avocado Toast', type: 'Cafe', amount: '₹465', status: 'Served', time: '25 min ago' },
      { orderCode: '#T-1017', table: 'Table 5', waiter: 'Sam Waiter', items: 'Creamy Mushroom Pasta x2', type: 'Cafe', amount: '₹490', status: 'Cancelled', time: '1 hr ago' },
    ]);
    console.log('Inserted orders:', orders.length);

    const tables = await Table.insertMany([
      { number: 1, capacity: 2, type: 'Cafe', status: 'Free', location: 'Indoor' },
      { number: 2, capacity: 4, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
      { number: 3, capacity: 2, type: 'Cafe', status: 'Reserved', location: 'Outdoor' },
      { number: 4, capacity: 6, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
      { number: 5, capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
      { number: 6, capacity: 2, type: 'Cafe', status: 'Free', location: 'Outdoor' },
      { number: 7, capacity: 4, type: 'Cafe', status: 'Occupied', location: 'Indoor' },
      { number: 8, capacity: 4, type: 'Cafe', status: 'Free', location: 'Outdoor' },
      { number: 9, capacity: 6, type: 'Cafe', status: 'Free', location: 'Indoor' },
      { number: 10, capacity: 2, type: 'Cafe', status: 'Reserved', location: 'Outdoor' },
      { number: 11, capacity: 4, type: 'Cafe', status: 'Free', location: 'Indoor' },
      { number: 12, capacity: 8, type: 'Cafe', status: 'Free', location: 'Private Room' },
      { number: 101, capacity: 1, type: 'Bar', status: 'Occupied', location: 'Bar Counter' },
      { number: 102, capacity: 1, type: 'Bar', status: 'Free', location: 'Bar Counter' },
    ]);
    console.log('Inserted tables:', tables.length);

    const staff = await Staff.insertMany([
      { name: 'Rajesh Kumar', role: 'Head Chef', shift: 'Morning', status: 'On Duty', initials: 'RK', color: '#C9A84C' },
      { name: 'Priya Sharma', role: 'Sous Chef', shift: 'Evening', status: 'On Duty', initials: 'PS', color: '#3498db' },
      { name: 'Sam Waiter', role: 'Waiter', shift: 'Evening', status: 'On Duty', initials: 'SW', color: '#2ecc71' },
      { name: 'Mike Bartender', role: 'Bartender', shift: 'Evening', status: 'On Duty', initials: 'MB', color: '#9b59b6' },
      { name: 'Anita Verma', role: 'Cashier', shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#e74c3c' },
      { name: 'Dev Kapoor', role: 'Manager', shift: 'Both', status: 'On Duty', initials: 'DK', color: '#f39c12' },
    ]);
    console.log('Inserted staff:', staff.length);

    const inventoryItems = await Inventory.insertMany([
      { name: 'Arborio Rice', category: 'Grains', quantity: 12, unit: 'kg', status: 'In Stock' },
      { name: 'Beef Tenderloin', category: 'Meat', quantity: 3, unit: 'kg', status: 'Low Stock' },
      { name: 'White Wine', category: 'Beverages', quantity: 24, unit: 'btl', status: 'In Stock' },
      { name: 'Coffee Beans', category: 'Beverages', quantity: 2, unit: 'kg', status: 'Low Stock' },
      { name: 'Cream', category: 'Dairy', quantity: 8, unit: 'L', status: 'In Stock' },
      { name: 'Mint Leaves', category: 'Produce', quantity: 0, unit: 'pkg', status: 'Out of Stock' },
      { name: 'Whiskey (JD)', category: 'Spirits', quantity: 18, unit: 'btl', status: 'In Stock' },
      { name: 'Pasta', category: 'Grains', quantity: 6, unit: 'kg', status: 'In Stock' },
      { name: 'Tomatoes', category: 'Produce', quantity: 15, unit: 'kg', status: 'In Stock' },
      { name: 'Basil', category: 'Produce', quantity: 4, unit: 'bunch', status: 'In Stock' },
      { name: 'Olive Oil', category: 'Pantry', quantity: 7, unit: 'L', status: 'In Stock' },
      { name: 'Garlic', category: 'Produce', quantity: 2, unit: 'kg', status: 'Low Stock' },
      { name: 'Chicken', category: 'Meat', quantity: 10, unit: 'kg', status: 'In Stock' },
      { name: 'Salmon', category: 'Seafood', quantity: 5, unit: 'kg', status: 'In Stock' },
      { name: 'Red Wine', category: 'Beverages', quantity: 20, unit: 'btl', status: 'In Stock' },
      { name: 'Vodka', category: 'Spirits', quantity: 12, unit: 'btl', status: 'In Stock' },
      { name: 'Sugar', category: 'Pantry', quantity: 3, unit: 'kg', status: 'Low Stock' },
      { name: 'Milk', category: 'Dairy', quantity: 6, unit: 'L', status: 'In Stock' },
      { name: 'Eggs', category: 'Dairy', quantity: 8, unit: 'dozen', status: 'In Stock' },
      { name: 'Butter', category: 'Dairy', quantity: 4, unit: 'kg', status: 'In Stock' },
      { name: 'Flour', category: 'Grains', quantity: 10, unit: 'kg', status: 'In Stock' },
      { name: 'Yeast', category: 'Bakery', quantity: 5, unit: 'pkg', status: 'In Stock' },
      { name: 'Lemons', category: 'Produce', quantity: 3, unit: 'kg', status: 'Low Stock' },
      { name: 'Limes', category: 'Produce', quantity: 2, unit: 'kg', status: 'Low Stock' },
      { name: 'Tequila', category: 'Spirits', quantity: 10, unit: 'btl', status: 'In Stock' },
    ]);
    console.log('Inserted inventory items:', inventoryItems.length);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const reservations = await Reservation.insertMany([
      { customerName: 'Arjun Mehta', email: 'arjun@email.com', phone: '9876543210', date: new Date(), time: '7:00 PM', guests: 4, tableNumber: 3, status: 'Confirmed' },
      { customerName: 'Sneha Patel', email: 'sneha@email.com', phone: '9123456789', date: new Date(), time: '7:30 PM', guests: 2, tableNumber: 6, status: 'Confirmed' },
      { customerName: 'Corporate Group', email: 'corporate@email.com', phone: '9800111222', date: tomorrow, time: '8:00 PM', guests: 12, tableNumber: 12, status: 'Pending' },
      { customerName: 'Riya Sharma', email: 'riya@email.com', phone: '7765432109', date: tomorrow, time: '8:30 PM', guests: 3, tableNumber: 8, status: 'Confirmed' },
      { customerName: 'Dev Kapoor', email: 'dev@email.com', phone: '8800199882', date: dayAfter, time: '9:00 PM', guests: 6, tableNumber: 5, status: 'Cancelled' },
      { customerName: 'Guest Customer', email: 'guest@zest.com', phone: '9998887776', date: dayAfter, time: '6:30 PM', guests: 2, tableNumber: 2, status: 'Pending' },
    ]);
    console.log('Inserted reservations:', reservations.length);

    const users = await User.create([
      { name: 'Admin User', email: 'admin@zest.com', password: 'admin123', role: 'superadmin', status: 'Active' },
      { name: 'John Manager', email: 'john@zest.com', password: 'password123', role: 'manager', status: 'On Duty' },
      { name: 'Marco Chef', email: 'marco@zest.com', password: 'password123', role: 'chef', status: 'On Duty' },
      { name: 'Sam Waiter', email: 'sam@zest.com', password: 'password123', role: 'waiter', status: 'Active' },
      { name: 'Sarah Cashier', email: 'sarah@zest.com', password: 'password123', role: 'cashier', status: 'Active' },
      { name: 'Mike Bartender', email: 'mike@zest.com', password: 'password123', role: 'bartender', status: 'On Duty' },
      { name: 'Guest Customer', email: 'guest@zest.com', password: 'password123', role: 'customer', status: 'Active' },
    ]);
    console.log('Inserted users:', users.length);

    console.log('\n--- Seed complete ---');
    console.log('Admin: admin@zest.com / admin123');
    console.log('Staff & customer: *@zest.com / password123');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
