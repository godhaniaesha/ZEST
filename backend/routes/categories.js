const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth, authorizeRoles } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Public route to get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes
router.post('/', auth, authorizeRoles('manager', 'superadmin', 'chef', 'bartender'), upload.single('img'), async (req, res) => {
  const categoryData = {
    name: req.body.name,
    type: req.body.type,
    icon: req.body.icon,
    description: req.body.description
  };

  if (req.file) {
    categoryData.img = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  }

  const category = new Category(categoryData);

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef', 'bartender'), upload.single('img'), async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      type: req.body.type,
      icon: req.body.icon,
      description: req.body.description
    };

    if (req.file) {
      categoryData.img = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef', 'bartender'), async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
