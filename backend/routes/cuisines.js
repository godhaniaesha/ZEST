const express = require('express');
const router = express.Router();
const Cuisine = require('../models/Cuisine');
const { auth, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/uploadS3');
const { deleteFromS3 } = require('../middleware/uploadS3');

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
    cuisineData.img = `${process.env.AWS_S3_BASE_URL}/${req.file.key}`;
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
      cuisineData.img = `${process.env.AWS_S3_BASE_URL}/${req.file.key}`;
    }

    const updatedCuisine = await Cuisine.findByIdAndUpdate(req.params.id, cuisineData, { new: true });
    res.json(updatedCuisine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), async (req, res) => {
  try {
    const cuisine = await Cuisine.findById(req.params.id);
    if (cuisine && cuisine.img) {
      await deleteFromS3(cuisine.img);
    }
    await Cuisine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cuisine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
