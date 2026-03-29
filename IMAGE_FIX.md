# 🖼️ Image Loading Issues - Fix Guide

Your images are not displaying on the frontend. This is typically a **Supabase storage bucket configuration issue**.

## ✅ Fix Steps

### Step 1: Make Supabase Bucket Public

1. Go to **Supabase Dashboard** → Your Project
2. Click **Storage** (left sidebar)
3. Find your bucket: `shivpuri`
4. Click the three dots (...) next to it
5. Click **Edit Bucket**
6. **Enable "Public bucket"** checkbox
7. Click **Save**

### Step 2: Verify Bucket Settings

In the same bucket settings:

- ✅ "Public bucket" = **ON**
- ✅ "File size limit" = at least 10MB
- ✅ "Allowed MIME types" = should include `image/*`

### Step 3: Verify Supabase RLS Policies

If images still don't load, you need to set Row Level Security policies:

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
-- Check if storage RLS is enabled
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- If no policies exist, create them:
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'shivpuri');

CREATE POLICY "Admin write access" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Step 4: Test Image URLs

1. Go to Supabase → Storage → `shivpuri` bucket
2. Upload a test image
3. Copy the public URL
4. Open it in your browser directly
5. Should see the image (not an error)

Expected URL format:

```
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/shivpuri/CATEGORY/FILENAME
```

### Step 5: Redeploy Backend

After bucket is public:

```bash
git add .
git commit -m "Fix: Add CORS headers for Supabase storage images"
git push origin main
```

Then on Render:

- Click **Manual Deploy**
- Wait for deployment

### Step 6: Clear Frontend Cache

In your browser:

1. Open Developer Tools (F12)
2. Go to **Application** tab
3. Clear **Cache Storage**
4. Refresh the page
5. Images should now load

---

## 🔍 Debugging: Check if Images Are Stored

Test if images exist in the database:

```bash
# Call the backend API
curl https://your-backend.onrender.com/api/representatives

# Should return JSON with image URLs like:
# "image": "https://xxx.supabase.co/storage/v1/object/public/shivpuri/..."
```

If you see image URLs, then:

- ✅ Backend is working
- ❌ Supabase bucket needs to be public

If you don't see image URLs, then:

- ❌ Images haven't been uploaded yet
- Use admin panel to upload images

---

## 📋 Supabase Bucket Checklist

- [ ] Bucket is created with name `shivpuri`
- [ ] "Public bucket" toggle is **ON**
- [ ] RLS policies allow public read access
- [ ] File size limit is >= 10MB
- [ ] MIME types include `image/*`
- [ ] No authentication required for public read

---

## 🛠️ If Still Not Working

1. **Check Supabase status** - https://status.supabase.com
2. **Verify bucket name** - Should be exactly `shivpuri` (case-sensitive)
3. **Test image URL directly** - Copy URL and open in new tab
4. **Check browser console** - Look for CORS errors (F12 → Console)
5. **Verify CORS headers** - Backend now sends appropriate headers

---

## 📞 Next Steps

After implementing these fixes:

1. Redeploy backend on Render
2. Make sure Supabase bucket is public
3. Clear browser cache
4. Refresh frontend and check images

Images should now display! 🖼️
