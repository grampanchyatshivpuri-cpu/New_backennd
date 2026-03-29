const express = require("express");
const router = express.Router();
const GrampanchayatInfo = require("../models/GrampanchayatInfo");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/grampanchayat
// @desc    Get grampanchayat info
// @access  Public
// @cache   10 minutes (600 seconds)
router.get("/", cacheMiddleware(), async (req, res) => {
  try {
    let info = await GrampanchayatInfo.find();

    if (!info) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: Array.isArray(info) ? info[0] : info,
    });
  } catch (error) {
    console.error("Get grampanchayat info error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching grampanchayat info",
      error: error.message,
    });
  }
});

// @route   POST /api/grampanchayat
// @desc    Create or update grampanchayat info
// @access  Private
router.post("/", auth, checkWritePermission("task7"), async (req, res) => {
  try {
    // Save grampanchayat info (model handles delete and insert)
    const info = await GrampanchayatInfo.save(req.body);

    res.json({
      success: true,
      message: "Grampanchayat info saved successfully",
      data: info,
    });
  } catch (error) {
    console.error("Save grampanchayat info error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving grampanchayat info",
      error: error.message,
    });
  }
});

module.exports = router;
