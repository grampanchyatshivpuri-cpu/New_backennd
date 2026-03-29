const { Pool } = require("pg");
require("dotenv").config();

async function seedAnnouncements() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  const sampleData = [
    {
      title: "जमा-खर्च अहवाल २०२४-२५",
      category: "जमा-खर्च",
      file_path: "https://example.com/sample1.pdf",
      file_type: "pdf",
      file_size: "1.2 MB"
    },
    {
      title: "नवीन घरकुल योजनेचा अर्ज",
      category: "अर्जांचे नमुने",
      file_path: "https://example.com/sample2.pdf",
      file_type: "pdf",
      file_size: "0.5 MB"
    },
    {
      title: "जन्म-मृत्यू दाखला प्रक्रिया",
      category: "दाखले",
      file_path: "https://example.com/sample3.pdf",
      file_type: "pdf",
      file_size: "0.8 MB"
    },
    {
      title: "पाणीपट्टी स्वयंघोषणापत्र",
      category: "स्वयंघोषणापत्रे",
      file_path: "https://example.com/sample4.pdf",
      file_type: "pdf",
      file_size: "0.4 MB"
    },
    {
      title: "ग्रामसभा महत्त्वाची सूचना",
      category: "इतर",
      file_path: "https://example.com/sample5.pdf",
      file_type: "pdf",
      file_size: "1.5 MB"
    }
  ];

  try {
    console.log("🌱 Seeding categorized announcements...");
    
    for (const item of sampleData) {
      await pool.query(
        `INSERT INTO announcements (title, category, file_path, file_type, file_size, is_active) 
         VALUES ($1, $2, $3, $4, $5, true)`,
        [item.title, item.category, item.file_path, item.file_type, item.file_size]
      );
    }
    
    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await pool.end();
  }
}

seedAnnouncements();
