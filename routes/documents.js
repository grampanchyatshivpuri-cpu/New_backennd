const express = require("express");
const router = express.Router();
const Document = require("../models/Document");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/documents
// @desc    Get all documents
// @access  Public
// @cache   10 minutes (600 seconds)
router.get("/", cacheMiddleware(), async (req, res) => {
  try {
    const documents = await Document.findAll();

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching documents",
      error: error.message,
    });
  }
});

// @route   POST /api/documents
// @desc    Create or update documents
// @access  Private (Task 2)
router.post("/", auth, checkWritePermission("task2"), async (req, res) => {
  try {
    const { documents } = req.body;

    if (!Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: "Documents must be an array",
      });
    }

    // Create new documents
    const created = [];
    for (const doc of documents) {
      const newDoc = await Document.create(doc);
      created.push(newDoc);
    }

    res.json({
      success: true,
      message: "Documents saved successfully",
      data: created,
    });
  } catch (error) {
    console.error("Save documents error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving documents",
      error: error.message,
    });
  }
});

module.exports = router;
