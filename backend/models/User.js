const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'customer'], default: 'customer' },
  status: { type: String, enum: ['Active', 'Inactive', 'On Duty'], default: 'Active' },
  shift: { type: String, enum: ['Morning', 'Evening', 'Both'], default: 'Morning' },
  phone: { type: String },
  address: { type: String },
  salary: { type: Number, default: 0, min: 0 },
  salaryType: { type: String, enum: ['monthly', 'weekly', 'daily', 'hourly'], default: 'monthly' },
  bankAccount: { type: String },
  leavesTaken: { type: Number, default: 0 },
  leavesTotal: { type: Number, default: 12 },
  joiningDate: { type: Date },
  image: { type: String } // Optional image URL
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Normalise legacy string salaries to numbers on save
userSchema.pre('save', async function() {
  if (this.salary !== undefined && this.salary !== null && this.salary !== '') {
    const parsed = Number(String(this.salary).replace(/[^0-9.-]/g, ''));
    this.salary = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } else {
    this.salary = 0;
  }
});

module.exports = mongoose.model('User', userSchema);
