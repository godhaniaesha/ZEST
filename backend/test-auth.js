const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zest-restaurant')
.then(async () => {
  console.log('MongoDB connected for testing');
  const user = await User.findOne({ email: 'admin@zest.com' });
  console.log('Found admin user:', user ? user.email : 'NOT FOUND');
  
  if (user) {
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('Password compare result (admin123):', isMatch);
    
    const isMatch2 = await user.comparePassword('admin123');
    console.log('User.comparePassword result (admin123):', isMatch2);
  }
  
  await mongoose.disconnect();
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
