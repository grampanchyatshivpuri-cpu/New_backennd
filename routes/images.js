const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const auth = require("../middleware/auth");
const { upload, uploadFileToSupabase } = require("../middleware/upload");
const { checkWritePermission } = require("../middleware/checkPermission");

// @route   GET /api/images
// @desc    Get all images
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const images = await Image.findAll(category || null);

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching images",
      error: error.message,
    });
  }
});

// @route   POST /api/images/upload
// @desc    Upload image
// @access  Private
router.post(
  "/upload",
  auth,
  checkWritePermission("task4"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { title, description, category } = req.body;

      // Upload to Supabase
      const supabaseResult = await uploadFileToSupabase(
        req.file,
        category || "gallery"
      );

      const imageData = {
        title: title || null,
        description: description || null,
        imagePath: supabaseResult.filePath,
        imageUrl: supabaseResult.publicUrl,
        category: category || "gallery",
        isActive: true,
        order: 0,
      };

      const image = await Image.create(imageData);

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: image,
      });
    } catch (error) {
      console.error("Upload image error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading image",
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/images/:id
// @desc    Delete image
// @access  Private
router.delete("/:id", auth, checkWritePermission("task4"), async (req, res) => {
  try {
    const image = await Image.delete(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
});

module.exports = router;
