# Supabase Storage Bucket Setup Guide

## Step 1: Make Bucket Public

1. Go to Supabase Dashboard:

   - URL: https://supabase.com/dashboard/project/cjadkphmecwmqhxdbsrx/storage/buckets

2. Click on **`test-bucket`**

3. Click **Configuration** or **Settings** tab

4. Toggle **"Public bucket"** to **ON**

5. Click **Save**

---

## Step 2: Add Storage Policies (REQUIRED)

Even if the bucket is public, you need to add policies to allow public read access.

### Method A: Using Supabase Dashboard (Recommended)

1. Go to Storage Policies:

   - URL: https://supabase.com/dashboard/project/cjadkphmecwmqhxdbsrx/storage/policies

2. Select bucket: **`test-bucket`**

3. Click **"New Policy"**

4. Create **READ Policy**:

   - **Policy name**: `Public Read Access`
   - **Allowed operation**: `SELECT` (or `Read`)
   - **Policy definition**: `true` (allows everyone)
   - **Target roles**: `public` or `anon`

   SQL code:

   ```sql
   CREATE POLICY "Public Read Access"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'test-bucket');
   ```

5. Click **"New Policy"** again

6. Create **INSERT Policy** (for admin uploads):

   - **Policy name**: `Admin Upload Access`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: `true`
   - **Target roles**: `authenticated` or `service_role`

   SQL code:

   ```sql
   CREATE POLICY "Admin Upload Access"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'test-bucket');
   ```

7. Click **"New Policy"** again

8. Create **DELETE Policy** (for admin deletion):

   - **Policy name**: `Admin Delete Access`
   - **Allowed operation**: `DELETE`
   - **Policy definition**: `true`
   - **Target roles**: `authenticated` or `service_role`

   SQL code:

   ```sql
   CREATE POLICY "Admin Delete Access"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'test-bucket');
   ```

---

### Method B: Using SQL Editor (Alternative)

1. Go to SQL Editor:

   - URL: https://supabase.com/dashboard/project/cjadkphmecwmqhxdbsrx/sql/new

2. Run this SQL:

```sql
-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access to all files in test-bucket
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'test-bucket');

-- Policy 2: Allow authenticated users to upload files to test-bucket
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'test-bucket');

-- Policy 3: Allow authenticated users to update files in test-bucket
CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'test-bucket');

-- Policy 4: Allow authenticated users to delete files from test-bucket
CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'test-bucket');
```

3. Click **Run**

---

## Step 3: Verify Setup

1. **Upload a test image** using Task 4 in the admin panel

2. **Check the URL** - it should look like:

   ```
   https://cjadkphmecwmqhxdbsrx.supabase.co/storage/v1/object/public/test-bucket/gallery/xxx.jpeg
   ```

3. **Open the URL in browser** - the image should display without errors

4. **Check the frontend website** - images should now show in:
   - Gallery page
   - Officials section
   - Homepage

---

## Troubleshooting

### Images still not showing?

1. **Check bucket is public:**

   - Go to bucket settings
   - Verify "Public bucket" is enabled

2. **Check policies exist:**

   - Go to Storage > Policies
   - Select `test-bucket`
   - Verify you see at least one SELECT policy for public

3. **Check the URL format:**

   - Should have `/public/` in the path
   - Example: `.../object/public/test-bucket/...`

4. **Clear browser cache:**

   - Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

5. **Check Next.js image config:**
   - Verify `cjadkphmecwmqhxdbsrx.supabase.co` is in allowed domains
   - Already added in `next.config.mjs`

---

## Important Notes

- ✅ **Public bucket** = Anyone can read files
- ✅ **Policies** = Define who can read/write/delete
- ✅ **Both are required** for public access
- ⚠️ Without policies, even public buckets won't be accessible
- 🔒 Service role key bypasses RLS, but frontend needs public access

---

## Quick Test

After setup, test with this curl command:

```bash
curl -I https://cjadkphmecwmqhxdbsrx.supabase.co/storage/v1/object/public/test-bucket/gallery/test.jpeg
```

Should return:

- ✅ `200 OK` = Working!
- ❌ `400 Bad Request` = Bucket not public or no policies
- ❌ `404 Not Found` = File doesn't exist (normal if no files uploaded)
