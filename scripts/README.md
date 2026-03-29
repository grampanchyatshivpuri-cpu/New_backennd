# Database Scripts

This folder contains scripts for managing the PostgreSQL database.

## Scripts Overview

### 1. `setupDatabase.js` (Auto-Setup)

**Purpose**: Automatically creates database schema on server startup if tables don't exist.

**When it runs**:

- Automatically on every server startup
- Safe for production (won't drop existing data)

**What it does**:

1. Checks if all 11 tables exist
2. If tables are missing, creates them with proper schema
3. Creates default admin user if doesn't exist
4. Sets up indexes, triggers, and RLS policies

**Usage**:

- Runs automatically, no manual intervention needed
- Used in `server.js` during startup

---

### 2. `migrateDatabase.js` (Manual Migration)

**Purpose**: Update database schema when you make changes to the structure.

⚠️ **WARNING**: This script will **DROP ALL TABLES** and **DELETE ALL DATA**!

**When to use**:

- When you add new columns to tables
- When you change table structure
- When you need to fix schema issues
- **NEVER** use in production without backup!

**Usage**:

```bash
# Step 1: Backup your data first!
# Export from Supabase dashboard or use pg_dump

# Step 2: Run migration
node scripts/migrateDatabase.js --force

# Step 3: Restore your data or re-enter it
```

**After migration, you must**:

1. Create new admin user (or restore from backup)
2. Re-enter all village data
3. Re-upload all files and images

---

## Database Schema

The database includes **11 tables**:

1. **users** - Admin/editor users
2. **representatives** - Sarpanch, officials (Task 1)
3. **documents** - General documents (Task 2)
4. **certificates** - Certificate information (Task 3)
5. **images** - Gallery and other images (Task 4)
6. **hero_images** - Homepage slider images (Task 9)
7. **infrastructure** - Village infrastructure/statistics (Task 2 & Task 5)
8. **historical_events** - Historical timeline (Task 6)
9. **historical_places** - Historical places with images (Task 6)
10. **grampanchayat_info** - Basic village info (Task 7)
11. **announcements** - Public announcements (Task 8)

---

## Production Deployment Checklist

### First Time Setup

1. **Set Environment Variables**:

   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ADMIN_EMAIL=admin@yourvillage.gov.in
   ADMIN_PASSWORD=your-secure-password
   NODE_ENV=production
   ```

2. **Deploy Backend**:

   - Push code to Render/Railway/Vercel
   - Database tables will be created automatically on first startup

3. **Verify Setup**:
   - Check server logs for "✅ Auto-setup completed"
   - Login to admin panel with ADMIN_EMAIL/ADMIN_PASSWORD
   - **Change the default password immediately!**

### Schema Updates (Use with Caution!)

If you need to update the database structure:

1. **Backup Data** (Required!):

   ```bash
   # From Supabase dashboard or
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Run Migration Locally First**:

   ```bash
   # Test on development database
   node scripts/migrateDatabase.js --force
   ```

3. **Deploy to Production**:

   ```bash
   # SSH into production server
   cd /path/to/backend
   node scripts/migrateDatabase.js --force
   ```

4. **Restore Data**:
   - Restore from backup or
   - Re-enter data through admin panel

---

## Common Issues

### Issue: "column 'order' does not exist"

**Cause**: Old database schema doesn't have the `"order"` column.

**Fix**: Run migration script:

```bash
node scripts/migrateDatabase.js --force
```

### Issue: "Database setup failed"

**Cause**: Connection issues or schema conflicts.

**Fix**:

1. Check DATABASE_URL is correct
2. Verify PostgreSQL is running
3. Check server logs for detailed error
4. If needed, run migration script

### Issue: Tables exist but missing columns

**Cause**: Schema was updated but old tables exist.

**Fix**: Run migration to recreate tables with new schema.

---

## Safety Notes

✅ **Safe for Production**:

- `setupDatabase.js` - Runs on every startup, won't delete data

⚠️ **Dangerous - Use with Caution**:

- `migrateDatabase.js` - Deletes all data, only use with backups!

---

## Support

For issues or questions:

1. Check server logs for detailed errors
2. Verify environment variables are set correctly
3. Ensure PostgreSQL connection is working
4. Test migration on development database first
