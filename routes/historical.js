const express = require("express");
const router = express.Router();
const HistoricalData = require("../models/HistoricalData");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { pool } = require("../config/database");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/historical
// @desc    Get historical data
// @access  Public
// @cache   30 seconds
router.get("/", cacheMiddleware(30), async (req, res) => {
  try {
    let historicalData = await HistoricalData.findAll();

    if (!historicalData) {
      historicalData = { events: [], places: [], awards: [] };
    }

    res.json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error("Get historical data error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching historical data",
      error: error.message,
    });
  }
});

// @route   POST /api/historical
// @desc    Create or update historical data
// @access  Private
router.post("/", auth, checkWritePermission("task6"), async (req, res) => {
  try {
    const { events, places, awards } = req.body;

    // Save historical data (model handles delete and insert)
    const historicalData = await HistoricalData.saveAll(
      events || [],
      places || [],
      awards || []
    );

    res.json({
      success: true,
      message: "Historical data saved successfully",
      data: historicalData,
    });
  } catch (error) {
    console.error("Save historical data error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving historical data",
      error: error.message,
    });
  }
});

// @route   DELETE /api/historical/events/:id
// @desc    Delete a historical event
// @access  Private
router.delete(
  "/events/:id",
  auth,
  checkWritePermission("task6"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM historical_events WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Historical event not found",
        });
      }

      res.json({
        success: true,
        message: "Historical event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting historical event",
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/historical/places/:id
// @desc    Delete a historical place
// @access  Private
router.delete(
  "/places/:id",
  auth,
  checkWritePermission("task6"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM historical_places WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Historical place not found",
        });
      }

      res.json({
        success: true,
        message: "Historical place deleted successfully",
      });
    } catch (error) {
      console.error("Delete place error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting historical place",
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/historical/awards/:id
// @desc    Delete a historical award
// @access  Private
router.delete(
  "/awards/:id",
  auth,
  checkWritePermission("task6"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM historical_awards WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Historical award not found",
        });
      }

      res.json({
        success: true,
        message: "Historical award deleted successfully",
      });
    } catch (error) {
      console.error("Delete award error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting historical award",
        error: error.message,
      });
    }
  }
);

module.exports = router;
