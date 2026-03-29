const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin operations

let supabase = null;
let supabaseInitError = null;

if (!supabaseUrl || !supabaseServiceKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push("SUPABASE_URL");
  if (!supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_KEY");
  
  const errorMsg = `❌ Missing Supabase credentials: ${missingVars.join(", ")}`;
  console.error(errorMsg);
  console.error("Please set these in environment variables or .env file");
  supabaseInitError = errorMsg;
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
      },
    });
  } catch (error) {
    const errorMsg = `Failed to initialize Supabase client: ${error.message}`;
    console.error(`❌ ${errorMsg}`);
    supabaseInitError = errorMsg;
  }
}

// Test connection
const testConnection = async () => {
  try {
    if (!supabase) {
      throw new Error(supabaseInitError || "Supabase client not initialized");
    }

    // Use a simpler query that works even with fresh databases
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      throw new Error(`Supabase auth check failed: ${error.message}`);
    }
    
    console.log("✅ Supabase Connected Successfully");
    return true;
  } catch (error) {
    console.error("❌ Supabase Connection Error:", error.message);
    console.error(
      "⚠️  Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are correctly set"
    );
    return false;
  }
};

module.exports = { supabase, testConnection };
