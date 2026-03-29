const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// 1. CORS Middleware FIRST
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim()) 
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const isAllowed = 
        allowedOrigins.indexOf(origin) !== -1 || 
        allowedOrigins.includes("*") ||
        origin.endsWith(".gpkarvat.in") ||
        origin.endsWith(".gpkahir.in") ||
        /^http:\/\/localhost:\d+$/.test(origin); // Dynamic: Allow any localhost port in dev
                       
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "X-Custom-Header"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    optionsSuccessStatus: 200,
  })
);

// 2. Helmet and other middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable CSP for now to avoid issues, or configure properly
  })
);
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database Connection and Auto-Setup
const { testConnection: testSupabase } = require("./config/supabase");
const { testConnection: testDB } = require("./config/database");
const setupDatabase = require("./scripts/setupDatabase");

// Test connections and auto-setup database on startup
(async () => {
  console.log("🚀 Starting Gram Panchayat Backend...");

  const supabaseOk = await testSupabase();
  const dbOk = await testDB();

  // If PostgreSQL is not connected, exit
  if (!dbOk) {
    console.error("❌ PostgreSQL connection failed - cannot continue");
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
    return;
  }

  // Auto-setup database (creates tables and admin if not exists)
  // This runs even if Supabase check fails (tables might not exist yet)
  try {
    console.log("\n🔧 Running auto-setup...");
    await setupDatabase();
    console.log("✅ Auto-setup completed\n");

    // Test Supabase again after table creation
    if (!supabaseOk) {
      console.log("🔄 Retesting Supabase connection...");
      const supabaseRetry = await testSupabase();
      if (supabaseRetry) {
        console.log("✅ Supabase connection successful after setup\n");
      } else {
        console.warn(
          "⚠️  Supabase still not connected, but server will continue\n"
        );
      }
    }
  } catch (error) {
    console.error("⚠️  Auto-setup failed:", error.message);
    console.log(
      "ℹ️  Server will continue, but database may need manual setup\n"
    );
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
})();

// Import Routes
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const representativesRoutes = require("./routes/representatives");
const documentsRoutes = require("./routes/documents");
const certificatesRoutes = require("./routes/certificates");
const imagesRoutes = require("./routes/images");
const heroImagesRoutes = require("./routes/heroImages");
const infrastructureRoutes = require("./routes/infrastructure");
const historicalRoutes = require("./routes/historical");
const grampanchayatRoutes = require("./routes/grampanchayat");
const websiteDataRoutes = require("./routes/websiteData");
const announcementsRoutes = require("./routes/announcements");
const taxPaymentRoutes = require("./routes/taxPayment");
const projectsRoutes = require("./routes/projects");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/representatives", representativesRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/images", imagesRoutes);
app.use("/api/hero-images", heroImagesRoutes);
app.use("/api/infrastructure", infrastructureRoutes);
app.use("/api/historical", historicalRoutes);
app.use("/api/grampanchayat", grampanchayatRoutes);
app.use("/api/website", websiteDataRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/tax-payment", taxPaymentRoutes);
app.use("/api/projects", projectsRoutes);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Gram Panchayat API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      representatives: "/api/representatives",
      certificates: "/api/certificates",
      images: "/api/images",
      announcements: "/api/announcements",
      projects: "/api/projects",
    },
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Gram Panchayat API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 API URL: http://${HOST}:${PORT}/api`);
});

module.exports = app;
