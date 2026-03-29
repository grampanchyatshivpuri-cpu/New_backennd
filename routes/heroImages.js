const express = require("express");
const router = express.Router();
const HeroImage = require("../models/HeroImage");
const auth = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload");
const { checkWritePermission } = require("../middleware/checkPermission");
const { uploadFileToSupabase } = uploadMiddleware;
const upload = uploadMiddleware.upload;
const { cacheMiddleware } = require("../middleware/cache");

// Get all hero images (public)
// @cache   10 minutes (600 seconds)
router.get("/", cacheMiddleware(), async (req, res) => {
  try {
    const heroImages = await HeroImage.findAll();
    res.json({
      success: true,
      data: heroImages,
    });
  } catch (error) {
    console.error("Get hero images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hero images",
    });
  }
});

// Upload new hero image (protected, max 3)
router.post(
  "/upload",
  auth,
  checkWritePermission("task9"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Check if already have 3 images
      const count = await HeroImage.getCount();
      if (count >= 3) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 3 hero images allowed. Please delete an existing image first.",
        });
      }

      // Upload to Supabase
      const uploadResult = await uploadFileToSupabase(req.file, "hero-images");

      // Save to database with order
      const order = count + 1; // Auto-assign order based on count
      const heroImage = await HeroImage.create({
        image_path: uploadResult.filePath,
        image_url: uploadResult.publicUrl,
        order: order,
      });

      res.json({
        success: true,
        message: "Hero image uploaded successfully",
        data: heroImage,
      });
    } catch (error) {
      console.error("Upload hero image error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload hero image",
      });
    }
  }
);

// Update hero image order
router.patch("/:id/order", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { order } = req.body;

    if (order === undefined || order < 1 || order > 3) {
      return res.status(400).json({
        success: false,
        message: "Order must be between 1 and 3",
      });
    }

    const heroImage = await HeroImage.updateOrder(id, order);

    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: "Hero image not found",
      });
    }

    res.json({
      success: true,
      message: "Hero image order updated successfully",
      data: heroImage,
    });
  } catch (error) {
    console.error("Update hero image order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update hero image order",
    });
  }
});

// Delete hero image
router.delete("/:id", auth, checkWritePermission("task9"), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await HeroImage.delete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Hero image not found",
      });
    }

    res.json({
      success: true,
      message: "Hero image deleted successfully",
      data: deletedImage,
    });
  } catch (error) {
    console.error("Delete hero image error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete hero image",
    });
  }
});

module.exports = router;
