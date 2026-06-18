const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { auth, authorizeRoles } = require('../middleware/auth');

// Helper to calculate status
const calculateStatus = (quantity, minQuantity) => {
  if (!minQuantity || minQuantity <= 0) return 'Good';
  if (quantity <= minQuantity / 2) return 'Critical';
  if (quantity <= minQuantity) return 'Low';
  return 'Good';
};

router.get('/', auth, async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorizeRoles('manager', 'superadmin', 'chef', 'bartender'), async (req, res) => {
  // Validation
  if (!req.body.name || !req.body.quantity || !req.body.unit) {
    return res.status(400).json({ message: 'Name, quantity, and unit are required' });
  }

  if (!req.body.minQuantity || req.body.minQuantity <= 0) {
    return res.status(400).json({ message: 'Minimum quantity must be greater than 0' });
  }

  if (req.body.quantity < 0) {
    return res.status(400).json({ message: 'Quantity cannot be negative' });
  }

  // Auto-calculate status
  const status = calculateStatus(req.body.quantity, req.body.minQuantity);

  // router.post('/', auth, authorizeRoles('manager', 'superadmin', 'chef'), async (req, res) => {
  const item = new Inventory({
    name: req.body.name,
    category: req.body.category || 'General',
    quantity: req.body.quantity,
    minQuantity: req.body.minQuantity,
    unit: req.body.unit,
    status: status
  });

  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', auth, authorizeRoles('manager', 'superadmin', 'chef'), async (req, res) => {
  try {
    // Validation
    if (req.body.minQuantity !== undefined && req.body.minQuantity <= 0) {
      return res.status(400).json({ message: 'Minimum quantity must be greater than 0' });
    }

    if (req.body.quantity !== undefined && req.body.quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    // Auto-calculate status based on quantity and minQuantity
    const item = await Inventory.findById(req.params.id);
    const qty = req.body.quantity !== undefined ? req.body.quantity : item.quantity;
    const min = req.body.minQuantity !== undefined ? req.body.minQuantity : item.minQuantity;

    req.body.status = calculateStatus(qty, min);

    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorizeRoles('manager', 'superadmin'), async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
