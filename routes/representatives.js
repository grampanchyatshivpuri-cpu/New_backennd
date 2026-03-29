const express = require("express");
const router = express.Router();
const Representative = require("../models/Representative");
const auth = require("../middleware/auth");
const { upload, uploadFileToSupabase } = require("../middleware/upload");
const { checkWritePermission } = require("../middleware/checkPermission");

// @route   GET /api/representatives
// @desc    Get all representatives
// @access  Public
router.get("/", async (req, res) => {
  try {
    const representatives = await Representative.findAll();

    res.json({
      success: true,
      data: representatives,
    });
  } catch (error) {
    console.error("Get representatives error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching representatives",
      error: error.message,
    });
  }
});

// @route   POST /api/representatives
// @desc    Create or update all representatives
// @access  Private (Task 1)
router.post("/", auth, checkWritePermission("task1"), async (req, res) => {
  try {
    const { representatives } = req.body;

    if (!Array.isArray(representatives)) {
      return res.status(400).json({
        success: false,
        message: "Representatives must be an array",
      });
    }

    // Create representatives (model handles delete and insert)
    const created = await Representative.createMany(representatives);

    res.json({
      success: true,
      message: "Representatives saved successfully",
      data: created,
    });
  } catch (error) {
    console.error("Save representatives error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving representatives",
      error: error.message,
    });
  }
});

// @route   POST /api/representatives/upload
// @desc    Upload representative image
// @access  Private (Task 1)
router.post(
  "/upload",
  auth,
  checkWritePermission("task1"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Upload to Supabase
      const supabaseResult = await uploadFileToSupabase(
        req.file,
        req.body.category || "officials"
      );

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          filePath: supabaseResult.filePath,
          imageUrl: supabaseResult.publicUrl,
        },
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

// @route   DELETE /api/representatives/:id
// @desc    Delete a representative
// @access  Private (Task 1)
router.delete("/:id", auth, checkWritePermission("task1"), async (req, res) => {
  try {
    const { id } = req.params;

    await Representative.delete(id);

    res.json({
      success: true,
      message: "Representative deleted successfully",
    });
  } catch (error) {
    console.error("Delete representative error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting representative",
      error: error.message,
    });
  }
});

module.exports = router;
