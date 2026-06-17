const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorizeRoles } = require('../middleware/auth');

const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

const STAFF_ROLES = ['superadmin', 'manager', 'chef', 'waiter', 'cashier', 'bartender'];

const toUserResponse = (user) => {
  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

const applyStaffFields = (user, body) => {
  if (body.name !== undefined) user.name = body.name;
  if (body.email !== undefined) user.email = body.email;
  if (body.phone !== undefined) user.phone = body.phone;
  if (body.address !== undefined) user.address = body.address;
  if (body.status !== undefined) user.status = body.status;
  if (body.shift !== undefined) user.shift = body.shift;
  if (body.salary !== undefined && body.salary !== null && body.salary !== '') {
    user.salary = String(body.salary);
  }
  if (body.leavesTaken !== undefined) user.leavesTaken = body.leavesTaken;
  if (body.leavesTotal !== undefined) user.leavesTotal = body.leavesTotal;
  if (body.joiningDate !== undefined) user.joiningDate = body.joiningDate || null;
  if (body.password) user.password = body.password;
};

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

router.get('/', auth, async (req, res) => {
  try {
    if (req.query.staffOnly === 'true') {
      if (!['manager', 'superadmin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      const staff = await User.find({ role: { $ne: 'customer' } }).select('-password');
      return res.json(staff);
    }

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/staff', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  if (!req.body.role || req.body.role === 'customer' || !STAFF_ROLES.includes(req.body.role)) {
    return res.status(400).json({ message: 'Invalid role for staff member' });
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    phone: req.body.phone,
    address: req.body.address,
    status: req.body.status || 'Active',
    shift: req.body.shift || 'Morning',
    salary: req.body.salary != null && req.body.salary !== '' ? String(req.body.salary) : undefined,
    leavesTaken: req.body.leavesTaken ?? 0,
    leavesTotal: req.body.leavesTotal ?? 12,
    joiningDate: req.body.joiningDate || null
  });

  try {
    const newUser = await user.save();
    res.status(201).json(toUserResponse(newUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/staff/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid staff member ID' });
  }

  if (req.body.role === 'customer') {
    return res.status(400).json({ message: 'Invalid role for staff member' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Staff member not found' });
    if (user.role === 'customer') return res.status(404).json({ message: 'Staff member not found' });

    applyStaffFields(user, req.body);
    if (req.body.role !== undefined && STAFF_ROLES.includes(req.body.role)) {
      user.role = req.body.role;
    }

    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/staff/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid staff member ID' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'customer') {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Staff member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.user.role !== 'superadmin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorizeRoles('superadmin'), async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    phone: req.body.phone,
    address: req.body.address,
    status: req.body.status || 'Active',
    shift: req.body.shift || 'Morning',
    salary: req.body.salary != null && req.body.salary !== '' ? String(req.body.salary) : undefined,
    leavesTaken: req.body.leavesTaken ?? 0,
    leavesTotal: req.body.leavesTotal ?? 12,
    joiningDate: req.body.joiningDate || null
  });

  try {
    const newUser = await user.save();
    res.status(201).json(toUserResponse(newUser));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  if (req.user.role !== 'superadmin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.role !== undefined && req.user.role === 'superadmin') user.role = req.body.role;
    if (req.body.status !== undefined && req.user.role === 'superadmin') user.status = req.body.status;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.shift !== undefined && req.user.role === 'superadmin') user.shift = req.body.shift;
    if (req.body.salary !== undefined && req.user.role === 'superadmin') user.salary = req.body.salary;
    if (req.body.leavesTaken !== undefined && req.user.role === 'superadmin') user.leavesTaken = req.body.leavesTaken;
    if (req.body.leavesTotal !== undefined && req.user.role === 'superadmin') user.leavesTotal = req.body.leavesTotal;
    if (req.body.joiningDate !== undefined && req.user.role === 'superadmin') user.joiningDate = req.body.joiningDate || null;

    if (req.file) {
      user.image = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      user.image = req.body.image;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('superadmin'), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
