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
    {
      name: "Truffle Risotto",
      category: "Mains",
      price: 680,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Italian",
      color: "#2ecc71",
      img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=80",
      description: "Creamy Arborio rice infused with black truffle oil and wild mushrooms.",
      rating: 4.8,
      reviews: 42,
      prepTime: "20 MIN",
      calories: "450 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["Black truffle oil", "Wild mushrooms", "Parmesan cheese"]
    },
    {
      name: "Caesar Salad",
      category: "Starters",
      price: 320,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      color: "#f39c12",
      img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      description: "Crisp romaine lettuce with Caesar dressing, croutons, and parmesan flakes.",
      rating: 4.4,
      reviews: 31,
      prepTime: "10 MIN",
      calories: "280 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["House-made dressing", "Garlic croutons", "Parmesan flakes"]
    },
    {
      name: "Beef Tenderloin",
      category: "Mains",
      price: 1200,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      color: "#2ecc71",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
      description: "Prime beef tenderloin grilled to perfection, served with red wine jus.",
      rating: 4.9,
      reviews: 28,
      prepTime: "25 MIN",
      calories: "650 KCAL",
      dietary: "NON-VEGETARIAN",
      highlights: ["Prime beef", "Red wine jus", "Slow-grilled"]
    },
    {
      name: "Creamy Mushroom Pasta",
      category: "Mains",
      price: 245,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Italian",
      color: "#2ecc71",
      img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=600&q=80",
      description: "Handmade pasta in a rich mushroom and cream sauce with fresh herbs.",
      rating: 4.7,
      reviews: 35,
      prepTime: "15 MIN",
      calories: "420 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["House-made pasta", "Wild mushrooms", "Fresh cream"]
    },
    {
      name: "Tiramisu",
      category: "Desserts",
      price: 280,
      status: "Sold Out",
      type: ["Cafe"],
      cuisine: "Italian",
      color: "#e74c3c",
      img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
      description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream.",
      rating: 4.7,
      reviews: 51,
      prepTime: "15 MIN",
      calories: "380 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["Mascarpone cream", "Fresh espresso", "Cocoa dusting"]
    },
    {
      name: "Chocolate Lava Cake",
      category: "Desserts",
      price: 95,
      status: "Available",
      type: ["Cafe"],
      cuisine: "International",
      color: "#e74c3c",
      img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
      description: "Decadent chocolate cake with a molten center, served with vanilla ice cream.",
      rating: 4.9,
      reviews: 45,
      prepTime: "18 MIN",
      calories: "580 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["Molten center", "Vanilla ice cream", "Warm serving"]
    },
    {
      name: "Avocado Toast",
      category: "Starters",
      price: 145,
      status: "Available",
      type: ["Cafe"],
      cuisine: "International",
      color: "#f39c12",
      img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      description: "Creamy avocado spread on sourdough toast, topped with poached egg.",
      rating: 4.6,
      reviews: 28,
      prepTime: "12 MIN",
      calories: "320 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["Fresh avocado", "Poached egg", "Sourdough"]
    },
    {
      name: "Grilled Salmon",
      category: "Mains",
      price: 320,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      color: "#2ecc71",
      img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
      description: "Fresh Atlantic salmon grilled to perfection, served with seasonal vegetables.",
      rating: 4.8,
      reviews: 38,
      prepTime: "22 MIN",
      calories: "410 KCAL",
      dietary: "NON-VEGETARIAN",
      highlights: ["Wild-caught salmon", "Seasonal veggies", "Lemon butter"]
    },
    {
      name: "Mojito Classic",
      category: "Cocktails",
      price: 320,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780552920016-558324282.jpg",
      description: "Refreshing blend of white rum, fresh mint, lime juice, and soda water.",
      rating: 4.5,
      reviews: 35,
      prepTime: "5 MIN",
      calories: "160 KCAL",
      dietary: "VEGAN",
      highlights: ["Fresh mint", "Premium rum", "Hand-pressed lime"]
    },
    {
      name: "Espresso Martini",
      category: "Cocktails",
      price: 380,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780553652064-972703322.jpg",
      description: "A sophisticated mix of vodka, fresh espresso, and coffee liqueur.",
      rating: 4.6,
      reviews: 24,
      prepTime: "7 MIN",
      calories: "210 KCAL",
      dietary: "VEGAN",
      highlights: ["Fresh espresso", "Premium vodka", "Coffee liqueur"]
    },
    {
      name: "Old Fashioned",
      category: "Cocktails",
      price: 480,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780553810307-802977768.jpg",
      description: "Classic whiskey cocktail with bitters, sugar, and a twist of orange.",
      rating: 4.8,
      reviews: 28,
      prepTime: "8 MIN",
      calories: "220 KCAL",
      dietary: "NONE",
      highlights: ["Premium whiskey", "Aromatic bitters", "Fresh citrus"]
    },
    {
      name: "Whiskey Sour",
      category: "Cocktails",
      price: 440,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780554049525-364364077.jpg",
      description: "Smooth blend of whiskey, lemon juice, and simple syrup.",
      rating: 4.7,
      reviews: 32,
      prepTime: "6 MIN",
      calories: "190 KCAL",
      dietary: "NONE",
      highlights: ["Fresh lemon", "Premium whiskey", "Egg white option"]
    },
    {
      name: "Kingfisher Draught",
      category: "Beer",
      price: 180,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#3498db",
      img: "https://images.unsplash.com/photo-1608270586620-24848c78ada9?auto=format&fit=crop&w=600&q=80",
      description: "Refreshing and crisp draught beer.",
      rating: 4.2,
      reviews: 15,
      prepTime: "2 MIN",
      calories: "150 KCAL",
      dietary: "VEGAN",
      highlights: ["Chilled", "Freshly tapped"]
    },
    {
      name: "House Red Wine",
      category: "Wine",
      price: 420,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#e74c3c",
      img: "https://images.unsplash.com/photo-1510812431401-41d2bd2724f3?auto=format&fit=crop&w=600&q=80",
      description: "Carefully selected house red wine with rich fruity notes.",
      rating: 4.5,
      reviews: 22,
      prepTime: "3 MIN",
      calories: "125 KCAL",
      dietary: "VEGAN",
      highlights: ["Selected vineyard", "Oak aged"]
    },
    {
      name: "Premium Vodka",
      category: "Spirits",
      price: 350,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      color: "#9b59b6",
      img: "https://images.unsplash.com/photo-1527281400683-1aae7dc6d8e5?auto=format&fit=crop&w=600&q=80",
      description: "Smooth, premium distilled vodka.",
      rating: 4.6,
      reviews: 18,
      prepTime: "2 MIN",
      calories: "100 KCAL",
      dietary: "VEGAN",
      highlights: ["Triple distilled", "Crystal clear"]
    },
    {
      name: "iiiiii",
      category: "appitiser",
      price: 45,
      status: "Available",
      type: ["Cafe"],
      cuisine: "italian",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780565147379-7462874.jfif",
      description: "Quick bite appetizer.",
      rating: 4.0,
      reviews: 5,
      prepTime: "5 MIN",
      calories: "120 KCAL",
      dietary: "VEGETARIAN",
      highlights: ["Crispy", "Quick serve"]
    },
    {
      name: "mmm",
      category: "soft drink",
      price: 89,
      status: "Available",
      type: ["Bar"],
      cuisine: "mojito",
      color: "#2ecc71",
      img: "https://zest-images-2026.s3.us-east-1.amazonaws.com/menu/1780565328229-866322414.jpg",
      description: "Refreshing soft drink blend.",
      rating: 4.3,
      reviews: 12,
      prepTime: "5 MIN",
      calories: "90 KCAL",
      dietary: "VEGAN",
      highlights: ["Chilled", "Fresh blend"]
    }
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
