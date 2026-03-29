const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  console.error(
    "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file"
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is ok
      throw error;
    }
    console.log("✅ Supabase Connected Successfully");
    return true;
  } catch (error) {
    console.error("❌ Supabase Connection Error:", error.message);
    return false;
  }
};

module.exports = { supabase, testConnection };
