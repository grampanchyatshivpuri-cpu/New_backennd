const express = require("express");
const router = express.Router();
const TaxPayment = require("../models/TaxPayment");
const auth = require("../middleware/auth");
const { checkWritePermission } = require("../middleware/checkPermission");
const { upload, uploadFileToSupabase } = require("../middleware/upload");
const { cacheMiddleware } = require("../middleware/cache");

// @route   GET /api/tax-payment
// @desc    Get tax payment info
// @access  Public
router.get("/", cacheMiddleware(), async (req, res) => {
  try {
    const info = await TaxPayment.find();

    res.json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.error("Get tax payment info error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tax payment info",
      error: error.message,
    });
  }
});

// @route   POST /api/tax-payment
// @desc    Create or update tax payment info
// @access  Private
router.post("/", auth, checkWritePermission("task10"), async (req, res) => {
  try {
    const info = await TaxPayment.save(req.body);

    res.json({
      success: true,
      message: "Tax payment info saved successfully",
      data: info,
    });
  } catch (error) {
    console.error("Save tax payment info error:", error);
    res.status(500).json({
      success: false,
      message: "Error saving tax payment info",
      error: error.message,
    });
  }
});

// @route   POST /api/tax-payment/upload
// @desc    Upload QR code/Document
// @access  Private
router.post("/upload", auth, checkWritePermission("task10"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Upload to Supabase
    const uploadResult = await uploadFileToSupabase(req.file, "tax-payment");

    // Get current tax info to get ID
    let info = await TaxPayment.find();

    // If no info exists, create an empty one first to get an ID
    if (!info) {
      info = await TaxPayment.save({});
    }

    const qrData = {
      path: uploadResult.filePath,
      url: uploadResult.publicUrl,
      type: uploadResult.fileType,
    };

    const updated = await TaxPayment.updateQR(info.id, qrData);

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Upload tax payment file error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
      error: error.message,
    });
  }
});

// @route   DELETE /api/tax-payment/image
// @desc    Delete only the QR code image
// @access  Private
router.delete("/image", auth, checkWritePermission("task10"), async (req, res) => {
  try {
    const info = await TaxPayment.find();
    if (!info) {
      return res.status(404).json({
        success: false,
        message: "Tax payment info not found",
      });
    }

    await TaxPayment.deleteImage(info.id);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete tax payment image error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: error.message,
    });
  }
});

module.exports = router;
