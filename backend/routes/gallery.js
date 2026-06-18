const express = require("express");
const router = express.Router();
const Gallery = require("../models/Gallery");
const upload = require("../middleware/uploadS3");
const { deleteFromS3 } = require("../middleware/uploadS3");

const buildGalleryPayload = (body, file, existingImage = null) => {
  const payload = {
    title: body.title,
    category: body.category,
    tag: body.tag,
    description: body.description,
    featured: body.featured === 'true' || body.featured === true,
  };

  if (file) {
    payload.image = `${process.env.AWS_S3_BASE_URL}/${file.key}`;
  } else if (body.image && typeof body.image === "string") {
    payload.image = body.image;
  } else if (existingImage) {
    payload.image = existingImage;
  }

  return payload;
};

// Public routes
router.get("/", async (req, res) => {
  try {
    const gallery = await Gallery.find().sort({ createdAt: -1 });
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ message: "Gallery item not found" });
    }
    res.json(gallery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected routes (superadmin and manager only)
const { auth, authorizeRoles } = require("../middleware/auth");

router.post(
  "/",
  auth,
  authorizeRoles("superadmin", "manager"),
  upload.single("image"),
  async (req, res) => {
    try {
      const galleryData = buildGalleryPayload(req.body, req.file);
      const gallery = new Gallery(galleryData);
      const newGallery = await gallery.save();
      res.status(201).json(newGallery);
    } catch (err) {
      console.error("Error saving gallery item:", err);
      res.status(400).json({ message: err.message });
    }
  },
);

router.put(
  "/:id",
  auth,
  authorizeRoles("superadmin", "manager"),
  upload.single("image"),
  async (req, res) => {
    try {
      const existingGallery = await Gallery.findById(req.params.id);
      if (!existingGallery) return res.status(404).json({ message: "Gallery item not found" });
      
      const updateData = buildGalleryPayload(req.body, req.file, existingGallery.image);
      const gallery = await Gallery.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true },
      );
      res.json(gallery);
    } catch (err) {
      console.error("Error updating gallery item:", err);
      res.status(400).json({ message: err.message });
    }
  },
);

router.delete(
  "/:id",
  auth,
  authorizeRoles("superadmin", "manager"),
  async (req, res) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (gallery && gallery.image) {
        await deleteFromS3(gallery.image);
      }
      await Gallery.findByIdAndDelete(req.params.id);
      res.json({ message: "Gallery item deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
