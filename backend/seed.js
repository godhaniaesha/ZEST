const mongoose = require('mongoose');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const Table = require('./models/Table');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');
const Reservation = require('./models/Reservation');
const User = require('./models/User');
const Category = require('./models/Category');
const Cuisine = require('./models/Cuisine');
const Blog = require('./models/Blog');
const Contact = require('./models/Contact');
const Gallery = require('./models/Gallery');
const ItemRating = require('./models/ItemRating');
const Payment = require('./models/Payment');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
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

  // Insert Categories first
  const categories = await Category.insertMany([
    { name: 'Starters', type: 'Cafe', icon: '🥗', description: 'Delicious starters to begin your meal' },
    { name: 'Mains', type: 'Cafe', icon: '🍽️', description: 'Hearty main course dishes' },
    { name: 'Desserts', type: 'Cafe', icon: '🍰', description: 'Sweet treats to end your meal' },
    { name: 'Cocktails', type: 'Bar', icon: '🍸', description: 'Refreshing cocktails' },
    { name: 'Beer', type: 'Bar', icon: '🍺', description: 'Craft and draught beers' },
    { name: 'Wine', type: 'Bar', icon: '🍷', description: 'Fine wines' },
    { name: 'Spirits', type: 'Bar', icon: '🥃', description: 'Premium spirits' },
    { name: 'appitiser', type: 'Cafe', icon: '🍟', description: 'Quick appetizers' },
    { name: 'soft drink', type: 'Bar', icon: '🥤', description: 'Non-alcoholic drinks' }
  ]);
  console.log('Inserted categories:', categories.length);

  // Insert Cuisines
  const cuisines = await Cuisine.insertMany([
    { name: 'Italian', icon: '🇮🇹', description: 'Authentic Italian cuisine' },
    { name: 'Continental', icon: '🌍', description: 'Continental dishes' },
    { name: 'International', icon: '🌐', description: 'Global flavors' },
    { name: 'italian', icon: '🇮🇹', description: 'Italian cuisine' },
    { name: 'mojito', icon: '🍃', description: 'Mojito variations' }
  ]);
  console.log('Inserted cuisines:', cuisines.length);

  // Insert Menu Items, linking to categories and cuisines
  const menuItems = await Menu.insertMany([
    {
      name: "Truffle Risotto",
      category: "Mains",
      categoryId: categories.find(c => c.name === 'Mains')?._id,
      price: 680,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Italian",
      cuisineId: cuisines.find(c => c.name === 'Italian')?._id,
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
      categoryId: categories.find(c => c.name === 'Starters')?._id,
      price: 320,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      cuisineId: cuisines.find(c => c.name === 'Continental')?._id,
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
      categoryId: categories.find(c => c.name === 'Mains')?._id,
      price: 1200,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      cuisineId: cuisines.find(c => c.name === 'Continental')?._id,
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
      categoryId: categories.find(c => c.name === 'Mains')?._id,
      price: 245,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Italian",
      cuisineId: cuisines.find(c => c.name === 'Italian')?._id,
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
      categoryId: categories.find(c => c.name === 'Desserts')?._id,
      price: 280,
      status: "Sold Out",
      type: ["Cafe"],
      cuisine: "Italian",
      cuisineId: cuisines.find(c => c.name === 'Italian')?._id,
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
      categoryId: categories.find(c => c.name === 'Desserts')?._id,
      price: 95,
      status: "Available",
      type: ["Cafe"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Starters')?._id,
      price: 145,
      status: "Available",
      type: ["Cafe"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Mains')?._id,
      price: 320,
      status: "Available",
      type: ["Cafe"],
      cuisine: "Continental",
      cuisineId: cuisines.find(c => c.name === 'Continental')?._id,
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
      categoryId: categories.find(c => c.name === 'Cocktails')?._id,
      price: 320,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Cocktails')?._id,
      price: 380,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Cocktails')?._id,
      price: 480,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Cocktails')?._id,
      price: 440,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Beer')?._id,
      price: 180,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Wine')?._id,
      price: 420,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'Spirits')?._id,
      price: 350,
      status: "Available",
      type: ["Bar"],
      cuisine: "International",
      cuisineId: cuisines.find(c => c.name === 'International')?._id,
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
      categoryId: categories.find(c => c.name === 'appitiser')?._id,
      price: 45,
      status: "Available",
      type: ["Cafe"],
      cuisine: "italian",
      cuisineId: cuisines.find(c => c.name === 'italian')?._id,
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
      categoryId: categories.find(c => c.name === 'soft drink')?._id,
      price: 89,
      status: "Available",
      type: ["Bar"],
      cuisine: "mojito",
      cuisineId: cuisines.find(c => c.name === 'mojito')?._id,
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

  // Find menu items for order data
  const truffleRisotto = menuItems.find(m => m.name === 'Truffle Risotto');
  const mojito = menuItems.find(m => m.name === 'Mojito Classic');
  const beefTenderloin = menuItems.find(m => m.name === 'Beef Tenderloin');
  const beer = menuItems.find(m => m.name === 'Kingfisher Draught');

  // Insert Orders
  const orders = await Order.insertMany([
    { 
      id: '#T-1021', 
      table: 'Table 4', 
      waiter: 'Raj', 
      items: [
        { name: 'Truffle Risotto', qty: 1, price: truffleRisotto?.price || 680, menuItemId: truffleRisotto?._id, status: 'Served' },
        { name: 'Mojito Classic', qty: 2, price: mojito?.price || 320, menuItemId: mojito?._id, status: 'Served' }
      ], 
      type: 'Dine-in', 
      amount: 1320, 
      status: 'Paid', 
      time: '2 min ago' 
    },
    { 
      id: '#T-1020', 
      table: 'Table 7', 
      waiter: 'Priya', 
      items: [
        { name: 'Beef Tenderloin', qty: 1, price: beefTenderloin?.price || 1200, menuItemId: beefTenderloin?._id, status: 'Preparing' },
        { name: 'Kingfisher Draught', qty: 1, price: beer?.price || 180, menuItemId: beer?._id, status: 'Pending' }
      ], 
      type: 'Dine-in', 
      amount: 1380, 
      status: 'Pending', 
      time: '8 min ago' 
    }
  ]);
  console.log('Inserted orders:', orders.length);

  // Insert Tables
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

  // Insert Staff
  const staff = await Staff.insertMany([
    { name: 'Rajesh Kumar', role: 'Head Chef', shift: 'Morning', status: 'On Duty', initials: 'RK', color: '#C9A84C', phone: '9876543210', email: 'rajesh@zest.com', address: '123 Main St, City', salary: '60000', leavesTaken: 2, leavesTotal: 12, joiningDate: new Date('2024-01-15') },
    { name: 'Priya Sharma', role: 'Waiter', shift: 'Evening', status: 'On Duty', initials: 'PS', color: '#3498db', phone: '9812345678', email: 'priya@zest.com', address: '456 Oak Ave, City', salary: '25000', leavesTaken: 0, leavesTotal: 12, joiningDate: new Date('2024-03-20') },
    { name: 'Sam D\'Souza', role: 'Bartender', shift: 'Evening', status: 'On Duty', initials: 'SD', color: '#2ecc71', phone: '9898765432', email: 'sam@zest.com', address: '789 Pine Rd, City', salary: '30000', leavesTaken: 1, leavesTotal: 12, joiningDate: new Date('2024-02-10') },
    { name: 'Anita Verma', role: 'Cashier', shift: 'Morning', status: 'Off Duty', initials: 'AV', color: '#9b59b6', phone: '9876541230', email: 'anita@zest.com', address: '321 Cedar Ln, City', salary: '22000', leavesTaken: 3, leavesTotal: 12, joiningDate: new Date('2023-11-05') }
  ]);
  console.log('Inserted staff:', staff.length);

  // Insert Inventory
  const inventoryItems = await Inventory.insertMany([
    { name: 'Rice', quantity: 50, unit: 'kg', category: 'Grains' },
    { name: 'Chicken', quantity: 25, unit: 'kg', category: 'Meat' },
    { name: 'Tomatoes', quantity: 30, unit: 'kg', category: 'Vegetables' }
  ]);
  console.log('Inserted inventory items:', inventoryItems.length);

  // Insert Reservations
  const reservations = await Reservation.insertMany([
    {
      customerName: 'Amit Patel',
      email: 'amit@example.com',
      phone: '9876543210',
      date: new Date(Date.now() + 86400000),
      time: '19:00',
      guests: 4,
      table: tables[2]._id,
      advanceAmount: 200,
      advancePaid: 200,
      advancePaymentStatus: 'Paid',
      advancePaymentMethod: 'Card',
      status: 'Confirmed',
    },
    {
      customerName: 'Riya Singh',
      email: 'riya@example.com',
      phone: '9812345678',
      date: new Date(Date.now() + 172800000),
      time: '20:00',
      guests: 2,
      table: tables[5]._id,
      advanceAmount: 200,
      advancePaid: 200,
      advancePaymentStatus: 'Paid',
      advancePaymentMethod: 'UPI',
      status: 'Pending',
    },
  ]);
  console.log('Inserted reservations:', reservations.length);

  // Insert Users
  const users = await User.create([
    { name: 'Admin User', email: 'admin@zest.com', password: 'admin123', role: 'superadmin', status: 'Active', phone: '9999999999', address: '101 Admin Bldg, City', shift: 'Morning', salary: '80000', leavesTaken: 1, leavesTotal: 12, joiningDate: new Date('2023-01-01') },
    { name: 'John Manager', email: 'john@zest.com', password: 'password123', role: 'manager', status: 'On Duty', phone: '9888888888', address: '202 Manager House, City', shift: 'Both', salary: '70000', leavesTaken: 2, leavesTotal: 12, joiningDate: new Date('2023-06-15') },
    { name: 'Marco Chef', email: 'marco@zest.com', password: 'password123', role: 'chef', status: 'On Duty', phone: '9777777777', address: '303 Chef Lane, City', shift: 'Morning', salary: '55000', leavesTaken: 0, leavesTotal: 12, joiningDate: new Date('2024-02-01') },
    { name: 'Sam Waiter', email: 'sam@zest.com', password: 'password123', role: 'waiter', status: 'Active', phone: '9666666666', address: '404 Waiter Rd, City', shift: 'Evening', salary: '25000', leavesTaken: 1, leavesTotal: 12, joiningDate: new Date('2024-04-10') },
    { name: 'Sarah Cashier', email: 'sarah@zest.com', password: 'password123', role: 'cashier', status: 'Active', phone: '9555555555', address: '505 Cashier St, City', shift: 'Morning', salary: '22000', leavesTaken: 3, leavesTotal: 12, joiningDate: new Date('2024-01-20') },
    { name: 'Mike Bartender', email: 'mike@zest.com', password: 'password123', role: 'bartender', status: 'On Duty', phone: '9444444444', address: '606 Bartender Ave, City', shift: 'Evening', salary: '30000', leavesTaken: 0, leavesTotal: 12, joiningDate: new Date('2024-03-01') },
    { name: 'Guest Customer', email: 'guest@zest.com', password: 'password123', role: 'customer', status: 'Active' }
  ]);
  console.log('Inserted users:', users.length);
  console.log('Users created with emails:', users.map(u => u.email));
  console.log('All users have password: password123 (except admin which has admin123)');

  // Insert Blogs
  const blogs = await Blog.insertMany([
    {
      title: "10 Best Italian Dishes You Must Try",
      category: "Food",
      author: "Chef Marco",
      authorImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80",
      excerpt: "Discover the most delicious Italian dishes that will tantalize your taste buds.",
      content: "Italian cuisine is known for its simplicity, with many dishes having only a few ingredients. From pasta to risotto, Italian food is loved worldwide. In this blog, we explore the top 10 Italian dishes you must try at least once in your life.",
      readTime: 5
    },
    {
      title: "The Art of Mixing Cocktails",
      category: "Drinks",
      author: "Sam Bartender",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
      excerpt: "Learn the secrets behind creating the perfect cocktail.",
      content: "Mixing cocktails is both an art and a science. From the right balance of spirits to the perfect garnish, every detail matters. In this guide, we'll teach you how to make classic cocktails like a pro.",
      readTime: 8
    }
  ]);
  console.log('Inserted blogs:', blogs.length);

  // Insert Contacts (sample)
  const contacts = await Contact.insertMany([
    {
      name: "Rahul Desai",
      email: "rahul@example.com",
      phone: "9876543210",
      subject: "Reservation Inquiry",
      message: "I would like to make a reservation for 6 people this weekend.",
      status: "New"
    }
  ]);
  console.log('Inserted contacts:', contacts.length);

  // Insert Gallery
  const galleries = await Gallery.insertMany([
    {
      title: "Truffle Risotto Plating",
      category: "food",
      tag: "Italian",
      description: "Creamy truffle risotto garnished with parmesan.",
      image: "https://i.pinimg.com/736x/a8/a7/c5/a8a7c5d0f8b911fcd4ec1691dc3bf195.jpg",
      featured: true
    },
    {
      title: "Cocktail Hour",
      category: "drinks",
      tag: "Cocktails",
      description: "A selection of our finest cocktails.",
      image: "https://i.pinimg.com/1200x/e0/fd/56/e0fd566141751a4e6e1450f7e0242ac4.jpg",
      featured: true
    },
    {
      title: "Cozy Ambiance",
      category: "ambiance",
      tag: "Interior",
      description: "Our beautiful restaurant interior.",
      image: "https://i.pinimg.com/736x/cb/08/2e/cb082eedfc22dcba74f2c03fcad68e64.jpg",
      featured: true
    }
  ]);
  console.log('Inserted gallery items:', galleries.length);

  // Insert Item Ratings
  const itemRatings = await ItemRating.insertMany([
    {
      userId: users[6]._id, // Guest Customer
      orderId: orders[0]._id,
      itemId: orders[0].items[0]._id,
      menuItemId: truffleRisotto?._id,
      itemName: "Truffle Risotto",
      rating: 5,
      comment: "Absolutely delicious! The best risotto I've ever had."
    },
    {
      userId: users[6]._id, // Guest Customer
      orderId: orders[0]._id,
      itemId: orders[0].items[1]._id,
      menuItemId: mojito?._id,
      itemName: "Mojito Classic",
      rating: 4,
      comment: "Refreshing and well-made."
    }
  ]);
  console.log('Inserted item ratings:', itemRatings.length);

  // Insert Payments
  const payments = await Payment.insertMany([
    {
      orderId: orders[0]._id,
      amount: 1320,
      paymentType: "Bill",
      paymentMethod: "Card",
      status: "Succeeded"
    },
    {
      reservationId: reservations[0]._id,
      amount: 200,
      paymentType: "Advance",
      paymentMethod: "Card",
      status: "Succeeded"
    }
  ]);
  console.log('Inserted payments:', payments.length);

  // Insert Attendance Records
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const attendances = await Attendance.insertMany([
    {
      staffId: users[0]._id, // admin@zest.com
      staffName: users[0].name,
      role: users[0].role,
      date: today,
      status: 'present',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM'
    },
    {
      staffId: users[1]._id, // john@zest.com
      staffName: users[1].name,
      role: users[1].role,
      date: today,
      status: 'present',
      checkIn: '08:30 AM',
      checkOut: null
    },
    {
      staffId: users[2]._id, // marco@zest.com
      staffName: users[2].name,
      role: users[2].role,
      date: today,
      status: 'late',
      checkIn: '10:15 AM',
      checkOut: null
    },
    {
      staffId: users[3]._id, // sam@zest.com
      staffName: users[3].name,
      role: users[3].role,
      date: yesterday,
      status: 'present',
      checkIn: '02:00 PM',
      checkOut: '10:00 PM'
    },
    {
      staffId: users[4]._id, // sarah@zest.com
      staffName: users[4].name,
      role: users[4].role,
      date: yesterday,
      status: 'absent',
      checkIn: null,
      checkOut: null
    }
  ]);
  console.log('Inserted attendance records:', attendances.length);

  // Insert Leave Requests
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekPlus2 = new Date(nextWeek);
  nextWeekPlus2.setDate(nextWeekPlus2.getDate() + 2);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekPlus1 = new Date(lastWeek);
  lastWeekPlus1.setDate(lastWeekPlus1.getDate() + 1);

  const leaves = await Leave.insertMany([
    {
      staffId: users[1]._id, // john@zest.com
      staffName: users[1].name,
      role: users[1].role,
      startDate: nextWeek,
      endDate: nextWeekPlus2,
      type: 'vacation',
      reason: 'Family vacation to Goa',
      status: 'pending',
      days: 3
    },
    {
      staffId: users[3]._id, // sam@zest.com
      staffName: users[3].name,
      role: users[3].role,
      startDate: lastWeek,
      endDate: lastWeekPlus1,
      type: 'sick',
      reason: 'Food poisoning',
      status: 'approved',
      days: 2
    },
    {
      staffId: users[4]._id, // sarah@zest.com
      staffName: users[4].name,
      role: users[4].role,
      startDate: new Date(today.getTime() + 86400000 * 3),
      endDate: new Date(today.getTime() + 86400000 * 4),
      type: 'personal',
      reason: 'Personal family matter',
      status: 'pending',
      days: 2
    },
    {
      staffId: users[2]._id, // marco@zest.com
      staffName: users[2].name,
      role: users[2].role,
      startDate: lastWeek,
      endDate: lastWeek,
      type: 'sick',
      reason: 'High fever',
      status: 'rejected',
      rejectionReason: 'Staff shortage, please reschedule',
      days: 1
    }
  ]);
  console.log('Inserted leave requests:', leaves.length);

  console.log('Default admin created: email: admin@zest.com, password: admin123');
  console.log('Database seeded completely!');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
