const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/certificates
// @desc    Get all certificates
// @access  Public
// @cache   1 minute (60 seconds) for faster testing/updates
router.get("/", cacheMiddleware(60), async (req, res) => {
  try {
    const certificates = await Certificate.findAll();

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching certificates",
      error: error.message,
    });
  }
});

// @route   POST /api/certificates
// @desc    Create or update certificates
// @access  Private (Task 3)
router.post("/", auth, checkWritePermission("task3"), async (req, res) => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates)) {
      return res.status(400).json({
        success: false,
        message: "Certificates must be an array",
      });
    }

    // Create certificates (model handles delete and insert)
    const created = await Certificate.createMany(certificates);

    res.json({
      success: true,
      message: "Certificates saved successfully",
      data: created,
    });
  } catch (error) {
    console.error("Save certificates error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving certificates",
      error: error.message,
    });
  }
});

// @route   DELETE /api/certificates/:id
// @desc    Delete a certificate
// @access  Private (Task 3)
router.delete("/:id", auth, checkWritePermission("task3"), async (req, res) => {
  try {
    const { id } = req.params;

    await Certificate.delete(id);

    res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Delete certificate error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting certificate",
      error: error.message,
    });
  }
});

module.exports = router;
