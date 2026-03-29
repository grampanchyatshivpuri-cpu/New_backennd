const express = require("express");
const router = express.Router();
const Representative = require("../models/Representative");
const Certificate = require("../models/Certificate");
const Image = require("../models/Image");
const Infrastructure = require("../models/Infrastructure");
const HistoricalData = require("../models/HistoricalData");
const GrampanchayatInfo = require("../models/GrampanchayatInfo");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/website/all
// @desc    Get all website data for static site
// @access  Public
// @cache   15 minutes (900 seconds) - comprehensive data
router.get("/all", cacheMiddleware(), async (req, res) => {
  try {
    const [
      representatives,
      certificates,
      images,
      infrastructure,
      historicalData,
      grampanchayatInfo,
    ] = await Promise.all([
      Representative.findAll(),
      Certificate.findAll(),
      Image.findAll(),
      Infrastructure.findAll(),
      HistoricalData.findAll(),
      GrampanchayatInfo.find(),
    ]);

    res.json({
      success: true,
      data: {
        representatives,
        certificates,
        images,
        infrastructure,
        historical: historicalData || { events: [], places: [] },
        grampanchayat: grampanchayatInfo,
      },
    });
  } catch (error) {
    console.error("Get all website data error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching website data",
      error: error.message,
    });
  }
});

// @route   GET /api/website/officials
// @desc    Get officials for homepage
// @access  Public
// @cache   10 minutes (600 seconds)
router.get("/officials", cacheMiddleware(), async (req, res) => {
  try {
    const representatives = await Representative.findAll();

    res.json({
      success: true,
      data: representatives,
    });
  } catch (error) {
    console.error("Get officials error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching officials",
      error: error.message,
    });
  }
});

// @route   GET /api/website/gallery
// @desc    Get gallery images
// @access  Public
// @cache   10 minutes (600 seconds)
router.get("/gallery", cacheMiddleware(), async (req, res) => {
  try {
    // Get all gallery images (Image.findAll already filters by isActive)
    const images = await Image.findAll("gallery");

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get gallery error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching gallery",
      error: error.message,
    });
  }
});

module.exports = router;
