const multer = require("multer");
const { supabase } = require("../config/supabase");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// File filter for documents (PDF, Word, Excel)
const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, Word, Excel, and Image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

const documentUpload = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
});

// Middleware to upload to Supabase Storage
const uploadToSupabase = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const category = req.body.category || "general";
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `${category}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
      .getPublicUrl(filePath);

    // Attach file info to request
    req.uploadedFile = {
      fileName: req.file.originalname,
      filePath: publicUrl,
      fileType: req.file.mimetype,
      category: category,
    };

    next();
  } catch (error) {
    console.error("Supabase upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
};

// Middleware to upload multiple files to Supabase
const uploadMultipleToSupabase = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const category = req.body.category || "general";
    const uploadPromises = req.files.map(async (file) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = `${category}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
        .getPublicUrl(filePath);

      return {
        fileName: file.originalname,
        filePath: publicUrl,
        fileType: file.mimetype,
        category: category,
      };
    });

    req.uploadedFiles = await Promise.all(uploadPromises);

    next();
  } catch (error) {
    console.error("Supabase upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload files",
      error: error.message,
    });
  }
};

// Function to delete file from Supabase Storage
const deleteFromSupabase = async (filePath) => {
  try {
    // Extract path from public URL if needed
    const bucketName =
      process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files";
    let path = filePath;

    // If it's a full URL, extract the path
    if (filePath.includes(bucketName)) {
      const urlParts = filePath.split(`${bucketName}/`);
      path = urlParts[urlParts.length - 1];
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove([path]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Supabase delete error:", error);
    return { success: false, error: error.message };
  }
};

// Helper function to upload file to Supabase (for use in routes)
const uploadFileToSupabase = async (file, category = "general") => {
  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `${category}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME || "grampanchayat-files")
      .getPublicUrl(filePath);

    return {
      fileName: file.originalname,
      filePath: filePath,
      publicUrl: publicUrl,
      fileType: file.mimetype,
      category: category,
    };
  } catch (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }
};

module.exports = {
  upload,
  documentUpload,
  uploadToSupabase,
  uploadMultipleToSupabase,
  deleteFromSupabase,
  uploadFileToSupabase,
};
