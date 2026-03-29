const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("✅ PostgreSQL Connected Successfully");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    return false;
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
