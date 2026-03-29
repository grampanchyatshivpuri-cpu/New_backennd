const { supabase } = require("../config/supabase");

/**
 * Script to create and configure Supabase storage bucket
 * This will create a public bucket for storing images
 */

async function setupBucket() {
  const bucketName = process.env.SUPABASE_BUCKET_NAME || "test-bucket";

  try {
    console.log(`🔧 Setting up Supabase bucket: ${bucketName}`);

    // Check if bucket exists
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("❌ Error listing buckets:", listError.message);
      return;
    }

    const bucketExists = buckets.some((b) => b.name === bucketName);

    if (!bucketExists) {
      // Create bucket
      console.log(`📦 Creating bucket: ${bucketName}`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
      });

      if (error) {
        console.error("❌ Error creating bucket:", error.message);
        return;
      }

      console.log("✅ Bucket created successfully");
    } else {
      console.log(`📦 Bucket ${bucketName} already exists`);

      // Update bucket to be public
      console.log(`🔓 Making bucket public...`);
      const { data, error } = await supabase.storage.updateBucket(bucketName, {
        public: true,
      });

      if (error) {
        console.error("❌ Error updating bucket:", error.message);
        console.log(
          "\n⚠️  You may need to manually set the bucket to public in Supabase Dashboard:"
        );
        console.log(
          `   1. Go to https://supabase.com/dashboard/project/cjadkphmecwmqhxdbsrx/storage/buckets`
        );
        console.log(`   2. Click on "${bucketName}"`);
        console.log(`   3. Click "Edit bucket"`);
        console.log(`   4. Enable "Public bucket"`);
        console.log(`   5. Save changes`);
      } else {
        console.log("✅ Bucket is now public");
      }
    }

    // Test upload and public URL
    console.log("\n🧪 Testing upload and public URL...");
    const testFile = Buffer.from("test");
    const testPath = "test/test.txt";

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testFile, {
        contentType: "text/plain",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Test upload failed:", uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(testPath);

    console.log("✅ Test upload successful");
    console.log(`📸 Public URL: ${publicUrl}`);

    // Clean up test file
    await supabase.storage.from(bucketName).remove([testPath]);

    console.log("\n✅ Bucket setup complete!");
    console.log(
      `\n📝 Your images will be accessible at: https://cjadkphmecwmqhxdbsrx.supabase.co/storage/v1/object/public/${bucketName}/`
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
}

// Run the setup
setupBucket()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
