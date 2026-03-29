const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function removePositionConstraint() {
  try {
    console.log("🔧 Removing position CHECK constraint...");

    // Remove the constraint if it exists
    await pool.query(`
      ALTER TABLE representatives 
      DROP CONSTRAINT IF EXISTS representatives_position_check
    `);

    console.log("✅ Position constraint removed successfully!");
    console.log("📝 Representatives can now have any custom position value");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error removing constraint:", error.message);
    await pool.end();
    process.exit(1);
  }
}

removePositionConstraint();
