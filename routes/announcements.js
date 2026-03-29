const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const {
  documentUpload,
  uploadFileToSupabase,
} = require("../middleware/upload");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Public
// @cache   1 minute (60 seconds) for faster testing/updates
router.get("/", cacheMiddleware(60), async (req, res) => {
  try {
    const announcements = await Announcement.findAll();

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message,
    });
  }
});

// @route   POST /api/announcements
// @desc    Create announcements
// @access  Private (Task 8)
router.post("/", auth, checkWritePermission("task8"), async (req, res) => {
  try {
    const { announcements } = req.body;

    if (!Array.isArray(announcements)) {
      return res.status(400).json({
        success: false,
        message: "Announcements must be an array",
      });
    }

    const created = await Announcement.createMany(announcements);

    res.json({
      success: true,
      message: "Announcements saved successfully",
      data: created,
    });
  } catch (error) {
    console.error("Save announcements error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving announcements",
      error: error.message,
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
// @access  Private (Task 8)
router.delete("/:id", auth, checkWritePermission("task8"), async (req, res) => {
  try {
    const { id } = req.params;

    await Announcement.delete(id);

    res.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting announcement",
      error: error.message,
    });
  }
});

// @route   POST /api/announcements/upload
// @desc    Upload document
// @access  Private
router.post(
  "/upload",
  auth,
  documentUpload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const { category } = req.body;

      // Upload to Supabase
      const supabaseResult = await uploadFileToSupabase(
        req.file,
        category || "documents"
      );

      res.json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          filePath: supabaseResult.publicUrl,
          fileName: supabaseResult.fileName,
          fileType: req.file.mimetype,
          fileSize: `${(req.file.size / 1024).toFixed(2)} KB`,
        },
      });
    } catch (error) {
      console.error("Upload document error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading document",
        error: error.message,
      });
    }
  }
);

module.exports = router;
