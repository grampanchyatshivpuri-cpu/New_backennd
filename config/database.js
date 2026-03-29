const { Pool } = require("pg");

// Validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Required format: postgresql://user:password@host:port/database");
}

// Log connection attempt (hide password for security)
if (databaseUrl) {
  const urlObj = new URL(databaseUrl);
  const maskedUrl = `${urlObj.protocol}//${urlObj.username}:***@${urlObj.hostname}:${urlObj.port}${urlObj.pathname}`;
  console.log(`🔌 Attempting to connect to: ${maskedUrl}`);
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
  let client;
  try {
    client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ PostgreSQL Connected Successfully");
    console.log(`   Database time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL Connection Error:", error.message);
    
    // Provide specific hints based on error type
    if (error.message.includes("password authentication failed")) {
      console.error(
        "   Hint: Password is incorrect or has special characters"
      );
      console.error(
        "   💡 If password has special characters (@, #, $, %, etc.), they need URL encoding:"
      );
      console.error("      Replace @ with %40, # with %23, $ with %24, etc.");
      console.error("      Use an online tool: https://www.urlencoder.org/");
    }
    if (error.message.includes("ECONNREFUSED")) {
      console.error(
        "   Hint: Cannot connect to host:port - check DATABASE_URL"
      );
      console.error("   Make sure host and port are correct");
    }
    if (error.message.includes("ENOTFOUND") || error.message.includes("ERR_NAME_RESOLUTION")) {
      console.error(
        "   Hint: Cannot resolve database host - check connection string"
      );
      console.error("   Verify hostname/domain is correct and accessible");
    }
    if (error.message.includes("role") || error.message.includes("does not exist")) {
      console.error(
        "   Hint: Database user (role) doesn't exist"
      );
      console.error("   Check the username in DATABASE_URL");
    }
    if (error.message.includes("database") && error.message.includes("does not exist")) {
      console.error(
        "   Hint: Database name doesn't exist"
      );
      console.error("   Check the database name in DATABASE_URL");
    }
    
    return false;
  } finally {
    if (client) client.release();
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
