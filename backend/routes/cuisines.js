const express = require('express');
const router = express.Router();
const Cuisine = require('../models/Cuisine');
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

// Public route to get all cuisines
router.get('/', async (req, res) => {
  try {
    const cuisines = await Cuisine.find();
    res.json(cuisines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes
router.post('/', auth, authorizeRoles('manager', 'superadmin', 'chef'), upload.single('img'), async (req, res) => {
  const cuisineData = {
    name: req.body.name,
    icon: req.body.icon,
    description: req.body.description
  };

  if (req.file) {
    cuisineData.img = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
  }

  const cuisine = new Cuisine(cuisineData);

  try {
    const newCuisine = await cuisine.save();
    res.status(201).json(newCuisine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), upload.single('img'), async (req, res) => {
  try {
    const cuisineData = {
      name: req.body.name,
      icon: req.body.icon,
      description: req.body.description
    };

    if (req.file) {
      cuisineData.img = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    }

    const updatedCuisine = await Cuisine.findByIdAndUpdate(req.params.id, cuisineData, { new: true });
    res.json(updatedCuisine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), async (req, res) => {
  try {
    await Cuisine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cuisine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
