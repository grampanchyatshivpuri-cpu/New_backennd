# 🚀 Render Deployment Checklist for Backend

Follow this checklist to deploy your backend to Render successfully.

## ✅ Pre-Deployment Preparation

- [ ] Code is working locally without errors
- [ ] All dependencies are in package.json
- [ ] .env.example is updated with all required variables
- [ ] .gitignore includes .env and node_modules
- [ ] Database is set up in Supabase
- [ ] Supabase storage bucket created: `grampanchayat-files`

## 📦 Required Information

Gather these before starting deployment:

### From Supabase Dashboard

1. **Database URL**:

   - Go to: Settings → Database → Connection String
   - Select: URI
   - Copy the full connection string
   - Example: `postgresql://postgres:password@db.project.supabase.co:5432/postgres`

2. **Supabase URL**:

   - Go to: Settings → API → Project URL
   - Example: `https://yourproject.supabase.co`

3. **Supabase Anon Key**:
   - Go to: Settings → API → Project API keys
   - Copy: `anon` `public` key (not the service role key)

### Generate JWT Secret

- Visit: https://randomkeygen.com/
- Use: CodeIgniter Encryption Keys (256-bit)
- Or run: `openssl rand -base64 32`

## 🌐 Render Deployment Steps

### Step 1: Push to GitHub

```bash
cd "G:\gp New"
git add backend/
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Go to: https://dashboard.render.com
2. Click: **"New +"** → **"Web Service"**
3. Click: **"Connect account"** if not connected to GitHub
4. Select: Your repository
5. Click: **"Connect"**

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**

```
Name: grampanchayat-backend
Region: Singapore (closest to India)
Branch: main
Root Directory: backend
```

**Build & Deploy:**

```
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Instance Type:**

```
Free (for testing)
or
Starter - $7/month (recommended for production)
```

### Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add each of these (click "+ Add Environment Variable" for each):

```
DATABASE_URL
Value: postgresql://postgres:password@db.project.supabase.co:5432/postgres
(Paste your Supabase database URL)

SUPABASE_URL
Value: https://yourproject.supabase.co
(Paste your Supabase project URL)

SUPABASE_KEY
Value: your-anon-key-here
(Paste your Supabase anon/public key)

SUPABASE_BUCKET_NAME
Value: grampanchayat-files

JWT_SECRET
Value: your-generated-secret-here
(Paste the secret you generated)

NODE_ENV
Value: production

PORT
Value: 5000

HOST
Value: 0.0.0.0

CORS_ORIGINS
Value: http://localhost:3000,http://localhost:3001
(Will update after deploying frontends)

MAX_FILE_SIZE
Value: 10485760
```

### Step 5: Deploy

1. Scroll down and click: **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Watch the logs for any errors

### Step 6: Verify Deployment

After deployment completes, you'll see your URL:

```
https://grampanchayat-backend.onrender.com
```

Test your endpoints:

1. **Root endpoint:**

   ```
   https://your-backend.onrender.com/
   ```

   Should return API information

2. **Health check:**

   ```
   https://your-backend.onrender.com/api/health
   ```

   Should return: `{"status":"OK","message":"Gram Panchayat API is running"...}`

3. **Public endpoint:**
   ```
   https://your-backend.onrender.com/api/grampanchayat
   ```
   Should return data or empty object

### Step 7: Save Your Backend URL

Copy your backend URL:

```
https://your-service-name.onrender.com
```

You'll need this for frontend deployment!

## 🔄 Update CORS After Frontend Deployment

After deploying your frontends to Vercel:

1. Go to Render Dashboard
2. Click on your backend service
3. Go to: **"Environment"** tab
4. Find: `CORS_ORIGINS`
5. Update value to:
   ```
   https://your-admin.vercel.app,https://your-website.vercel.app
   ```
6. Click: **"Save Changes"**
7. Service will auto-redeploy (2-3 minutes)

## ✅ Post-Deployment Verification

- [ ] Backend URL accessible
- [ ] Health check returns OK
- [ ] No errors in Render logs
- [ ] Database connection successful
- [ ] Supabase connection successful
- [ ] Can fetch public data (grampanchayat, announcements)

## 🐛 Troubleshooting

### Build Failed

**Check these:**

- Node version in package.json (should be >=18.0.0)
- All dependencies in package.json
- Build command is correct: `npm install`

**Solution:**

- Check Render logs for specific error
- Verify package.json is valid JSON
- Ensure no syntax errors in code

### Deploy Success but App Not Working

**Check these:**

- All environment variables are set correctly
- DATABASE_URL has correct password
- SUPABASE_KEY is the anon/public key (not service role)

**Solution:**

- Go to: Logs tab in Render dashboard
- Look for connection errors
- Verify each environment variable

### Database Connection Failed

**Error:** "Connection refused" or "timeout"

**Solutions:**

- Verify DATABASE_URL is exactly from Supabase
- Check Supabase project is running
- Ensure URL includes SSL parameters
- Try reconnecting in Supabase dashboard

### CORS Errors from Frontend

**Error:** "Access blocked by CORS policy"

**Solution:**

- Check CORS_ORIGINS includes your frontend URLs
- Ensure no trailing slashes in URLs
- Protocol must match (https:// for production)
- No spaces after commas in CORS_ORIGINS

### Health Check Failing

**Error:** "Health check failed"

**Solution:**

- Verify `/api/health` endpoint exists
- Check app is listening on PORT from env variable
- Look at Render logs for startup errors

### Free Tier - App Sleeps

**Behavior:** First request after inactivity is slow

**This is normal for free tier:**

- App sleeps after 15 minutes of inactivity
- First request takes ~30 seconds to wake up
- Subsequent requests are fast

**Solutions:**

- Upgrade to Starter plan ($7/month) for always-on
- Or accept the wake-up delay

## 📊 Monitor Your Deployment

### Render Dashboard

- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Events**: Deployment history

### Useful Logs Commands

View logs for errors:

- Look for: "❌" or "Error:" in logs
- Check: Database connection messages
- Monitor: API request logs

## 🔧 Useful Render Features

### Auto-Deploy

- Enabled by default
- Deploys automatically on push to main branch
- Can disable in Settings if needed

### Manual Deploy

- Go to: Service → Manual Deploy
- Click: "Deploy latest commit"
- Use when you need to redeploy without code changes

### Environment Groups

- Create environment group for shared variables
- Useful if you have multiple services

### Custom Domain (Optional)

- Go to: Settings → Custom Domain
- Add: api.yourvillage.gov.in
- Configure DNS as instructed

## 💰 Pricing

### Free Tier

- 750 hours/month (enough for 1 service)
- Sleeps after 15 min inactivity
- Slower spin-up time
- **Cost: $0**

### Starter Tier

- Always-on (no sleep)
- 512 MB RAM
- Faster performance
- **Cost: $7/month**

## 🎉 Success!

If all checks pass, your backend is successfully deployed!

**Your API is live at:**

```
https://grampanchayat-backend.onrender.com
```

**Next Steps:**

1. Save backend URL for frontend deployment
2. Deploy admin panel to Vercel
3. Deploy website to Vercel
4. Update CORS_ORIGINS with frontend URLs
5. Test full system end-to-end

---

**Need help?**

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Check DEPLOYMENT_GUIDE.md for detailed troubleshooting
