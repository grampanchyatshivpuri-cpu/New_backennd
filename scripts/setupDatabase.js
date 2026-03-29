const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// SQL Schema
const SQL_SCHEMA = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Representatives table (Marathi-only)
CREATE TABLE IF NOT EXISTS representatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    position VARCHAR(100) NOT NULL,
    image TEXT,
    fixed BOOLEAN DEFAULT false,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates table (Marathi-only)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_name VARCHAR(255) NOT NULL,
    certificate_description TEXT NOT NULL,
    required_documents JSONB DEFAULT '[]',
    apply_online_url TEXT,
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    description TEXT,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'gallery', 'events', 'infrastructure', 'officials')),
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero Images table (for homepage slider)
CREATE TABLE IF NOT EXISTS hero_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructure table (Marathi-only)
CREATE TABLE IF NOT EXISTS infrastructure (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subcategory VARCHAR(255) NOT NULL,
    facility VARCHAR(255) NOT NULL,
    count VARCHAR(50) NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical events table (Marathi-only)
CREATE TABLE IF NOT EXISTS historical_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(10) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical places table (Marathi-only)
CREATE TABLE IF NOT EXISTS historical_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_name VARCHAR(255) NOT NULL,
    place_info TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical awards table (Marathi-only)
CREATE TABLE IF NOT EXISTS historical_awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    award_name VARCHAR(255) NOT NULL,
    award_description TEXT,
    year VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grampanchayat info table (Marathi-only)
CREATE TABLE IF NOT EXISTS grampanchayat_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grampanchayat_name VARCHAR(255) NOT NULL,
    taluka_name VARCHAR(255) NOT NULL,
    district_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    pincode VARCHAR(10),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements table (Marathi-only)
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path TEXT,
    file_url TEXT,
    file_type VARCHAR(50),
    file_size VARCHAR(50),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100) DEFAULT 'इतर',
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax Payment table (Marathi/English details)
CREATE TABLE IF NOT EXISTS tax_payment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_file_path TEXT,
    qr_file_url TEXT,
    qr_file_type VARCHAR(50),
    tax_info TEXT,
    bank_name VARCHAR(255),
    account_name VARCHAR(255),
    account_no VARCHAR(255),
    ifsc_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    cost NUMERIC,
    start_date DATE,
    end_date DATE,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_representatives_position ON representatives(position);
CREATE INDEX IF NOT EXISTS idx_representatives_order ON representatives("order");
CREATE INDEX IF NOT EXISTS idx_certificates_active ON certificates(is_active);
CREATE INDEX IF NOT EXISTS idx_certificates_order ON certificates("order");
CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_active ON images(is_active);
CREATE INDEX IF NOT EXISTS idx_infrastructure_order ON infrastructure("order");
CREATE INDEX IF NOT EXISTS idx_hero_images_order ON hero_images("order");
CREATE INDEX IF NOT EXISTS idx_hero_images_active ON hero_images(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_order ON announcements("order");
CREATE INDEX IF NOT EXISTS idx_tax_payment_id ON tax_payment(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_representatives_updated_at ON representatives;
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
DROP TRIGGER IF EXISTS update_images_updated_at ON images;
DROP TRIGGER IF EXISTS update_hero_images_updated_at ON hero_images;
DROP TRIGGER IF EXISTS update_infrastructure_updated_at ON infrastructure;
DROP TRIGGER IF EXISTS update_historical_events_updated_at ON historical_events;
DROP TRIGGER IF EXISTS update_historical_places_updated_at ON historical_places;
DROP TRIGGER IF EXISTS update_historical_awards_updated_at ON historical_awards;
DROP TRIGGER IF EXISTS update_grampanchayat_info_updated_at ON grampanchayat_info;
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
DROP TRIGGER IF EXISTS update_tax_payment_updated_at ON tax_payment;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_representatives_updated_at BEFORE UPDATE ON representatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_images_updated_at BEFORE UPDATE ON hero_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_infrastructure_updated_at BEFORE UPDATE ON infrastructure FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historical_events_updated_at BEFORE UPDATE ON historical_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historical_places_updated_at BEFORE UPDATE ON historical_places FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_historical_awards_updated_at BEFORE UPDATE ON historical_awards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grampanchayat_info_updated_at BEFORE UPDATE ON grampanchayat_info FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_payment_updated_at BEFORE UPDATE ON tax_payment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE grampanchayat_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access" ON representatives;
DROP POLICY IF EXISTS "Public read access" ON certificates;
DROP POLICY IF EXISTS "Public read access" ON images;
DROP POLICY IF EXISTS "Public read access" ON hero_images;
DROP POLICY IF EXISTS "Public read access" ON infrastructure;
DROP POLICY IF EXISTS "Public read access" ON historical_events;
DROP POLICY IF EXISTS "Public read access" ON historical_places;
DROP POLICY IF EXISTS "Public read access" ON historical_awards;
DROP POLICY IF EXISTS "Public read access" ON grampanchayat_info;
DROP POLICY IF EXISTS "Public read access" ON announcements;
DROP POLICY IF EXISTS "Public read access" ON tax_payment;
DROP POLICY IF EXISTS "Public read access" ON projects;

-- Create policies for public read access (for website)
CREATE POLICY "Public read access" ON representatives FOR SELECT USING (true);
CREATE POLICY "Public read access" ON certificates FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON images FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON hero_images FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON infrastructure FOR SELECT USING (true);
CREATE POLICY "Public read access" ON historical_events FOR SELECT USING (true);
CREATE POLICY "Public read access" ON historical_places FOR SELECT USING (true);
CREATE POLICY "Public read access" ON historical_awards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON grampanchayat_info FOR SELECT USING (true);
CREATE POLICY "Public read access" ON announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access" ON tax_payment FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (true);
`;

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    console.log("🔧 Starting database setup...");

    // Check if tables exist
    const tablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const existingTables = tablesCheck.rows.map((r) => r.table_name);
    const hasAllTables = existingTables.length >= 13;
    const hasProjectsTable = existingTables.includes("projects");

    if (hasAllTables && hasProjectsTable && existingTables.includes("tax_payment")) {
      console.log("ℹ️  Database tables already exist, skipping schema creation");
      console.log("📊 Existing tables count: " + existingTables.length);
    } else {
      // Only create schema if tables don't exist or are incomplete
      console.log("📋 Creating tables and indexes...");
      await pool.query(SQL_SCHEMA);
      console.log("✅ Database schema created successfully");
    }

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@grampanchayat.gov.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    console.log("👤 Creating default admin user...");

    // Check if admin exists
    const existingAdmin = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        "INSERT INTO users (email, password, role, permissions, is_active) VALUES ($1, $2, $3, $4, $5)",
        [adminEmail, hashedPassword, "admin", JSON.stringify(["*"]), true]
      );
      console.log("✅ Admin user created: " + adminEmail);
      console.log("🔑 Password: " + adminPassword);
      console.log("⚠️  IMPORTANT: Change this password after first login!");
    } else {
      console.log("ℹ️  Admin user already exists");

      // Update existing admin to have permissions if missing
      await pool.query(
        "UPDATE users SET permissions = $1 WHERE email = $2 AND (permissions IS NULL OR permissions = '[]'::jsonb)",
        [JSON.stringify(["*"]), adminEmail]
      );
    }

    // Verify setup
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log("\n✅ Database setup complete!");
    console.log("📊 Tables created: " + tables.rows.length);
    console.log("📋 Tables: " + tables.rows.map((r) => r.table_name).join(", "));

    return true;
  } catch (error) {
    console.error("❌ Database setup failed: " + error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Export for use in server startup
module.exports = setupDatabase;

// Run directly if called as script
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log("\n🎉 Setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup failed:", error);
      process.exit(1);
    });
}
