const { Pool } = require("pg");

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Required format: postgresql://user:password@host:port/database");
}

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client:", err);
});

// Test database connection
const testConnection = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ PostgreSQL Connected Successfully");
    console.log(`   Database time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    if (error.message.includes("tenant") || error.message.includes("user")) {
      console.error(
        "   Hint: Check DATABASE_URL is valid and database exists"
      );
    }
    if (error.message.includes("ENOTFOUND") || error.message.includes("ERR_NAME_RESOLUTION")) {
      console.error(
        "   Hint: Cannot resolve database host - check connection string"
      );
    }
    return false;
  } finally {
    client.release();
  }
};

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};
