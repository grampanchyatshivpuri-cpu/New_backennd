# Gram Panchayat Backend API

Backend API server for Gram Panchayat website management system.

## 🚀 Quick Start

**🆕 Setting up for a new village?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) - Everything is automated!

**📘 Technical documentation?** Continue reading below for API details.

**🔧 Database scripts?** See [scripts/README.md](scripts/README.md) for database management.

## Features

- 🔐 JWT Authentication
- 📝 Complete CRUD operations for all tasks
- 🖼️ Image upload and management with Supabase Storage
- 🗄️ PostgreSQL database (Supabase)
- 🔒 Secure API endpoints with Row Level Security
- 📱 RESTful API design
- ☁️ Cloud-based file storage with CDN

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage (cloud-based)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, bcrypt
- **ORM**: Custom query-based models

## Installation

### Prerequisites

- Node.js (v18 or higher)
- Supabase account (free tier available)

### Quick Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Setup Supabase**

   - Create project at [supabase.com](https://supabase.com)
   - Get your credentials from Settings → API
   - Run `database/schema.sql` in SQL Editor
   - Create storage bucket: `grampanchayat-files`

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:

   ```env
   PORT=5000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=your_service_key
   SUPABASE_ANON_KEY=your_anon_key

   # Database
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

   # Storage
   SUPABASE_BUCKET_NAME=grampanchayat-files

   # Auth
   JWT_SECRET=your_secret_key_here
   ADMIN_EMAIL=admin@grampanchayat.gov.in
   ADMIN_PASSWORD=admin123
   ```

4. **Create admin user**

   ```bash
   node scripts/createAdmin.js
   ```

5. **Run the server**

   Development mode:

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user (Protected)

### Representatives (Task 1)

- `GET /api/representatives` - Get all representatives
- `POST /api/representatives` - Create/Update representatives (Protected)

### Documents (Task 2)

- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create document (Protected)
- `PUT /api/documents/:id` - Update document (Protected)
- `DELETE /api/documents/:id` - Delete document (Protected)

### Certificates (Task 3)

- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Create/Update certificates (Protected)

### Images (Task 4 - Gallery)

- `GET /api/images` - Get all images (optional: ?category=gallery)
- `POST /api/images/upload` - Upload image (Protected)
- `DELETE /api/images/:id` - Delete image (Protected)

### Infrastructure (Task 5)

- `GET /api/infrastructure` - Get all infrastructure
- `POST /api/infrastructure` - Create/Update infrastructure (Protected)

### Historical Data (Task 6)

- `GET /api/historical` - Get historical events and places
- `POST /api/historical` - Create/Update historical data (Protected)

### Grampanchayat Info (Task 7)

- `GET /api/grampanchayat` - Get grampanchayat info
- `POST /api/grampanchayat` - Create/Update grampanchayat info (Protected)

### Website Data (Public API)

- `GET /api/website/all` - Get all website data
- `GET /api/website/officials` - Get officials
- `GET /api/website/gallery` - Get gallery images
- `GET /api/website/info` - Get grampanchayat information

## Database Schema

### Tables

1. **users** - Admin authentication
2. **representatives** - Village officials/representatives
3. **documents** - Documents and statistics
4. **certificates** - Certificate services information
5. **images** - Gallery and other images
6. **infrastructure** - Infrastructure details
7. **historical_events** - Historical events
8. **historical_places** - Historical places
9. **grampanchayat_info** - Basic village information

### Key Features

- UUID primary keys
- JSONB columns for flexible data
- Automatic timestamps
- Row Level Security (RLS)
- Indexed for performance
- Bilingual support (Marathi + English)

## Authentication

Protected routes require JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE'
}
```

Get token by logging in:

```bash
POST /api/auth/login
{
  "email": "admin@grampanchayat.gov.in",
  "password": "admin123"
}
```

## File Uploads

Files are stored in Supabase Storage bucket with the following structure:

```
grampanchayat-files/ (bucket)
  ├── general/
  │   └── uuid-filename.jpg
  ├── gallery/
  │   └── uuid-filename.jpg
  ├── events/
  │   └── uuid-filename.jpg
  └── infrastructure/
      └── uuid-filename.jpg
```

**Features:**

- CDN-backed URLs for fast delivery
- Public access for images
- UUID-based naming for uniqueness
- Maximum file size: 5MB (configurable)

**Upload Example:**

```javascript
// Single file upload
POST /api/images/upload
Content-Type: multipart/form-data
Authorization: Bearer YOUR_TOKEN

FormData:
  - file: [image file]
  - category: "gallery"
  - caption: "Image caption"
```

## Error Handling

All API responses follow this format:

**Success:**

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Security Features

- ✅ Helmet for HTTP headers security
- ✅ CORS configuration
- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Row Level Security (RLS) in database
- ✅ Parameterized queries (SQL injection prevention)
- ✅ File upload validation
- ✅ Environment variable protection
- ✅ Service role key for server-side operations only

## Development

### Create Admin User

```bash
node scripts/createAdmin.js
```

This uses credentials from `.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Testing API

**Using curl:**

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@grampanchayat.gov.in","password":"admin123"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Using Postman/Thunder Client:**

- Import endpoints from documentation
- Set Authorization header with token
- Test all CRUD operations

### Database Management

**Supabase Dashboard:**

- View tables: Table Editor
- Run queries: SQL Editor
- Monitor performance: Database → Logs
- Check storage: Storage

**Using psql (optional):**

```bash
psql "postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

# Use production Supabase project
SUPABASE_URL=https://prod-xxxxx.supabase.co
SUPABASE_SERVICE_KEY=prod_service_key
DATABASE_URL=production_database_url

# Strong secrets
JWT_SECRET=strong_random_string_here

# Production admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=strong_password

# Production domains
CORS_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

### Deployment Options

**Option 1: Vercel/Netlify Functions**

- Deploy as serverless functions
- Configure environment variables
- Connect to Supabase

**Option 2: Railway/Render**

- Deploy as Node.js app
- Set environment variables
- Auto-deploys from Git

**Option 3: Traditional VPS**

```bash
# Install PM2
npm install -g pm2

# Start server
pm2 start server.js --name grampanchayat-api

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Supabase Production Setup

1. **Database**

   - Run `database/schema.sql` in production project
   - Set up connection pooling if needed
   - Configure RLS policies

2. **Storage**

   - Create `grampanchayat-files` bucket
   - Make bucket public
   - Configure CORS for your domains

3. **Security**
   - Never expose `SUPABASE_SERVICE_KEY` to frontend
   - Use `SUPABASE_ANON_KEY` for client-side operations
   - Review RLS policies before production

## Project Structure

```
backend/
├── config/
│   ├── database.js         # PostgreSQL connection pool
│   └── supabase.js        # Supabase client
├── database/
│   └── schema.sql         # Complete database schema
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── upload.js          # Supabase Storage upload
├── models/
│   ├── User.js            # User model
│   ├── Representative.js  # Representatives model
│   ├── Certificate.js     # Certificates model
│   ├── Image.js           # Images model
│   ├── Infrastructure.js  # Infrastructure model
│   ├── HistoricalData.js  # Historical data model
│   ├── GrampanchayatInfo.js # Village info model
│   └── Document.js        # Documents model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── representatives.js # Representatives routes
│   ├── certificates.js    # Certificates routes
│   ├── images.js         # Images routes
│   ├── infrastructure.js  # Infrastructure routes
│   ├── historical.js      # Historical data routes
│   ├── grampanchayat.js  # Village info routes
│   ├── documents.js      # Documents routes
│   └── websiteData.js    # Public API routes
├── scripts/
│   └── createAdmin.js    # Admin creation script
├── .env.example          # Environment template
├── server.js            # Main server file
├── package.json         # Dependencies
├── QUICK_START.md       # Quick setup guide
├── MIGRATION_GUIDE.md   # Detailed migration guide
└── MIGRATION_SUMMARY.md # Technical changes summary
```

## Troubleshooting

### Common Issues

**"Connection refused" or "ECONNREFUSED"**

- Check `DATABASE_URL` is correct
- Verify Supabase project is running
- Check internet connection

**"Invalid API key"**

- Verify `SUPABASE_SERVICE_KEY` is correct
- Ensure no extra spaces in `.env`
- Use service role key, not anon key

**"Bucket not found"**

- Create bucket in Supabase dashboard
- Verify `SUPABASE_BUCKET_NAME` matches
- Check bucket is public

**"Table does not exist"**

- Run `database/schema.sql` in SQL Editor
- Verify all tables created
- Check database connection

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed troubleshooting.

## Documentation

- **[QUICK_START.md](QUICK_START.md)** - Fast setup guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Complete migration instructions
- **[MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)** - Technical changes overview

## Support

For issues and questions:

1. Check documentation files
2. Review Supabase dashboard logs
3. Check server console output
4. Create an issue in the repository

## License

ISC
