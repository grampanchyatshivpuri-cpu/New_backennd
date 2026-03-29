const express = require("express");
const router = express.Router();
const Infrastructure = require("../models/Infrastructure");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/infrastructure
// @desc    Get all infrastructure
// @access  Public
// @cache   30 seconds
router.get("/", cacheMiddleware(30), async (req, res) => {
  try {
    const infrastructure = await Infrastructure.findAll();

    res.json({
      success: true,
      data: infrastructure,
    });
  } catch (error) {
    console.error("Get infrastructure error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching infrastructure",
      error: error.message,
    });
  }
});

// @route   GET /api/infrastructure/subcategory/:subcategory
// @desc    Get infrastructure by subcategory
// @access  Public
router.get("/subcategory/:subcategory", async (req, res) => {
  try {
    const { subcategory } = req.params;
    const infrastructure = await Infrastructure.findBySubcategory(
      decodeURIComponent(subcategory)
    );

    res.json({
      success: true,
      data: infrastructure,
    });
  } catch (error) {
    console.error("Get infrastructure by subcategory error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching infrastructure",
      error: error.message,
    });
  }
});

// @route   POST /api/infrastructure
// @desc    Create or update infrastructure
// @access  Private
router.post("/", auth, checkWritePermission("task5"), async (req, res) => {
  try {
    const { infrastructure, subcategory } = req.body;

    if (!Array.isArray(infrastructure)) {
      return res.status(400).json({
        success: false,
        message: "Infrastructure must be an array",
      });
    }

    // If subcategory is provided, delete existing items of that subcategory first
    // This allows Task 2 (आकडेवारी) and Task 5 (other subcategories) to update independently
    if (subcategory) {
      await Infrastructure.deleteBySubcategory(subcategory);
    }

    // Create infrastructure
    const created = await Infrastructure.createMany(infrastructure);

    res.json({
      success: true,
      message: "Infrastructure saved successfully",
      data: created,
    });
  } catch (error) {
    console.error("Save infrastructure error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving infrastructure",
      error: error.message,
    });
  }
});

// @route   DELETE /api/infrastructure/:id
// @desc    Delete an infrastructure item
// @access  Private
router.delete("/:id", auth, checkWritePermission("task5"), async (req, res) => {
  try {
    const { id } = req.params;

    await Infrastructure.delete(id);

    res.json({
      success: true,
      message: "Infrastructure item deleted successfully",
    });
  } catch (error) {
    console.error("Delete infrastructure error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting infrastructure",
      error: error.message,
    });
  }
});

module.exports = router;
