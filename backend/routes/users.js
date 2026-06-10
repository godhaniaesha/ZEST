const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorizeRoles } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload (consistent with menu.js)
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
  }
  else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Allow superadmin or the user themselves to see their profile
    if (req.user.role !== 'superadmin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(user);
  }
  catch (err) {
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
    address: req.body.address
  });

  try {
    const newUser = await user.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  console.log('Update request for ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  // Allow superadmin or the user themselves to update
  if (req.user.role !== 'superadmin' && req.user.id !== req.params.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      console.log('User not found with ID:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.role !== undefined && req.user.role === 'superadmin') user.role = req.body.role;
    if (req.body.status !== undefined && req.user.role === 'superadmin') user.status = req.body.status;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    
    if (req.file) {
      user.image = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
      console.log('Image updated to:', user.image);
    }
    else if (req.body.image !== undefined) {
      user.image = req.body.image;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;
    res.json(userResponse);
  }
  catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('superadmin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
