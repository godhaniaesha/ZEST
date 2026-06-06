const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const multer = require("multer");
const path = require("path");
const { inferMenuType, toMenuTypeArray } = require("../utils/menuType");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

const buildMenuPayload = (body, file) => {
  const category = body.category;
  const payload = {
    name: body.name,
    category,
    price: parseFloat(body.price) || 0,
    status: body.status || "Available",
    type: toMenuTypeArray(body.type, category),
    cuisine: body.cuisine,
    color: body.color || "#2ecc71",
  };

  if (file) {
    payload.img = `http://localhost:${process.env.PORT || 5000}/uploads/${file.filename}`;
  } else if (body.img && typeof body.img === "string") {
    payload.img = body.img;
  }

  return payload;
};

router.get("/", async (req, res) => {
  try {
    const menu = await Menu.find();
    const normalizedMenu = menu.map((item) => ({
      ...item.toObject(),
      type: toMenuTypeArray(item.type, item.category),
    }));
    res.json(normalizedMenu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.json({
      ...menuItem.toObject(),
      type: toMenuTypeArray(menuItem.type, menuItem.category),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  upload.single("img"),
  async (req, res) => {
    try {
      const menuItemData = buildMenuPayload(req.body, req.file);
      const menuItem = new Menu(menuItemData);
      const newMenuItem = await menuItem.save();
      res.status(201).json(newMenuItem);
    } catch (err) {
      console.error("Error saving menu item:", err);
      res.status(400).json({ message: err.message });
    }
  },
);

router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const updateData = buildMenuPayload(req.body, req.file);

    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true },
    );
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });
    res.json(menuItem);
  } catch (err) {
    console.error("Error updating menu item:", err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
