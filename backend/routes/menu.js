const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const { inferMenuType, toMenuTypeArray } = require("../utils/menuType");
const { auth, authorizeRoles } = require("../middleware/auth");
const upload = require("../middleware/uploadS3");
const { deleteFromS3 } = require("../middleware/uploadS3");

const buildMenuPayload = (body, file) => {
  const category = body.category;
  const payload = {
    name: body.name,
    category,
    price: parseFloat(body.price) || 0,
    status: body.status || "Available",
    type: toMenuTypeArray(body.type, category),
    cuisine: body.cuisine,
    description: body.description || "",
    rating: parseFloat(body.rating) || 4.5,
    reviews: parseInt(body.reviews) || 0,
    prepTime: body.prepTime || "15 MIN",
    calories: body.calories || "",
    dietary: body.dietary || "NONE",
    highlights: Array.isArray(body.highlights) ? body.highlights : (body.highlights ? body.highlights.split(',').map(h => h.trim()) : []),
    color: body.color || "#2ecc71",
  };

  if (file) {
    payload.img = `${process.env.AWS_S3_BASE_URL}/${file.key}`;
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
  auth,
  authorizeRoles("chef", "manager", "superadmin"),
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
  }
);

router.put(
  "/:id",
  auth,
  authorizeRoles("chef", "manager", "superadmin"),
  upload.single("img"),
  async (req, res) => {
    try {
      const menuItemData = buildMenuPayload(req.body, req.file);
      const updatedMenuItem = await Menu.findByIdAndUpdate(
        req.params.id,
        menuItemData,
        { new: true }
      );
      if (!updatedMenuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(updatedMenuItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete("/:id", auth, authorizeRoles("chef", "manager", "superadmin"), async (req, res) => {
  try {
    const menuItem = await Menu.findById(req.params.id);
    if (menuItem && menuItem.img) {
      await deleteFromS3(menuItem.img);
    }
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
