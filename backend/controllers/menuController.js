const Menu = require('../models/Menu');
const Category = require('../models/Category');
const Cuisine = require('../models/Cuisine');
const { toMenuTypeArray } = require('../utils/menuType');
const { uploadImage } = require('../utils/s3Upload');

const normalizeType = (value) => {
  const t = String(value || '').trim();
  if (t.toLowerCase() === 'bar') return 'Bar';
  if (t.toLowerCase() === 'cafe') return 'Cafe';
  return t;
};

const buildMetaPayload = async (body, file, folder) => {
  const payload = {
    name: String(body.name || '').trim(),
    type: normalizeType(body.type),
  };
  if (!payload.name) throw new Error('Name is required');
  if (!['Cafe', 'Bar'].includes(payload.type)) throw new Error('Type must be Cafe or Bar');

  if (file) {
    payload.img = await uploadImage(file, folder);
  } else if (body.img && typeof body.img === 'string') {
    payload.img = body.img;
  }

  return payload;
};

const buildMenuPayload = async (body, file) => {
  const category = body.category;
  const payload = {
    name: body.name,
    category,
    price: parseFloat(body.price) || 0,
    status: body.status || 'Available',
    type: toMenuTypeArray(body.type, category),
    cuisine: body.cuisine,
    color: body.color || '#2ecc71',
  };

  if (file) {
    payload.img = await uploadImage(file, 'menu');
  } else if (body.img && typeof body.img === 'string') {
    payload.img = body.img;
  }

  return payload;
};

const normalizeMenuItem = (item) => ({
  ...item.toObject(),
  type: toMenuTypeArray(item.type, item.category),
});

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const menu = await Menu.find(filter);
    console.log(`[Menu API] GET /api/menu — ${menu.length} items (filter: ${JSON.stringify(filter)})`);
    res.json(menu.map(normalizeMenuItem));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(normalizeMenuItem(item));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const menuItemData = await buildMenuPayload(req.body, req.file);
    const menuItem = new Menu(menuItemData);
    const newMenuItem = await menuItem.save();
    res.status(201).json(newMenuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updateData = await buildMenuPayload(req.body, req.file);
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json(menuItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Categories ──

exports.getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = normalizeType(req.query.type);
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const payload = await buildMetaPayload(req.body, req.file, 'categories');
    const category = await Category.create(payload);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const payload = await buildMetaPayload(req.body, req.file, 'categories');
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Cuisines ──

exports.getCuisines = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = normalizeType(req.query.type);
    const cuisines = await Cuisine.find(filter).sort({ name: 1 });
    res.json(cuisines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCuisine = async (req, res) => {
  try {
    const payload = await buildMetaPayload(req.body, req.file, 'cuisines');
    const cuisine = await Cuisine.create(payload);
    res.status(201).json(cuisine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCuisine = async (req, res) => {
  try {
    const payload = await buildMetaPayload(req.body, req.file, 'cuisines');
    const cuisine = await Cuisine.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );
    if (!cuisine) return res.status(404).json({ message: 'Cuisine not found' });
    res.json(cuisine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeCuisine = async (req, res) => {
  try {
    const cuisine = await Cuisine.findByIdAndDelete(req.params.id);
    if (!cuisine) return res.status(404).json({ message: 'Cuisine not found' });
    res.json({ message: 'Cuisine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
