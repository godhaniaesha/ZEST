const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const multer = require("multer");
const path = require("path");

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

const buildBlogPayload = (body, file, existingImage = null) => {
  const payload = {
    title: body.title,
    category: body.category,
    author: body.author,
    authorImage: body.authorImage || '',
    excerpt: body.excerpt,
    content: body.content,
    readTime: parseInt(body.readTime) || 5,
  };

  if (file) {
    payload.image = `http://localhost:${process.env.PORT || 5000}/uploads/${file.filename}`;
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
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
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
      const blogData = buildBlogPayload(req.body, req.file);
      const blog = new Blog(blogData);
      const newBlog = await blog.save();
      res.status(201).json(newBlog);
    } catch (err) {
      console.error("Error saving blog:", err);
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
      const updateData = buildBlogPayload(req.body, req.file);
      const blog = await Blog.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true, runValidators: true },
      );
      if (!blog) return res.status(404).json({ message: "Blog not found" });
      res.json(blog);
    } catch (err) {
      console.error("Error updating blog:", err);
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
      await Blog.findByIdAndDelete(req.params.id);
      res.json({ message: "Blog deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
