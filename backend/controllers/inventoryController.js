const Inventory = require('../models/Inventory');

const deriveStatus = (quantity) => {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= 5) return 'Low Stock';
  return 'In Stock';
};

exports.getAll = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity ?? req.body.qty, 10) || 0;
    const item = new Inventory({
      name: req.body.name,
      category: req.body.category || 'General',
      quantity,
      unit: req.body.unit,
      status: req.body.status || deriveStatus(quantity),
    });
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.qty !== undefined && update.quantity === undefined) {
      update.quantity = parseInt(update.qty, 10);
      delete update.qty;
    }
    if (update.quantity !== undefined && !update.status) {
      update.status = deriveStatus(parseInt(update.quantity, 10));
    }

    const item = await Inventory.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
