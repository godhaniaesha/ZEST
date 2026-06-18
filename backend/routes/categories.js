const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/uploadS3');
const { deleteFromS3 } = require('../middleware/uploadS3');

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
router.post('/', auth, authorizeRoles('manager', 'superadmin', 'chef'), upload.single('img'), async (req, res) => {
  const categoryData = {
    name: req.body.name,
    type: req.body.type,
    icon: req.body.icon,
    description: req.body.description
  };

  if (req.file) {
    categoryData.img = `${process.env.AWS_S3_BASE_URL}/${req.file.key}`;
  }

  const category = new Category(categoryData);

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), upload.single('img'), async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      type: req.body.type,
      icon: req.body.icon,
      description: req.body.description
    };

    if (req.file) {
      categoryData.img = `${process.env.AWS_S3_BASE_URL}/${req.file.key}`;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true });
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category && category.img) {
      await deleteFromS3(category.img);
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
