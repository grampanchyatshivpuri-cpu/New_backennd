-- Migration script to convert database from bilingual to Marathi-only
-- Run this script on existing databases to update the schema

-- ==============================================
-- 1. REPRESENTATIVES TABLE
-- ==============================================
-- Remove English duplicate columns and update position values to Marathi
ALTER TABLE representatives DROP COLUMN IF EXISTS name_mr;
ALTER TABLE representatives DROP COLUMN IF EXISTS mobile_mr;

-- Update position values to Marathi
UPDATE representatives SET position = 'सरपंच' WHERE position = 'Sarpanch';
UPDATE representatives SET position = 'उपसरपंच' WHERE position = 'Upsarpanch';
UPDATE representatives SET position = 'ग्रामपंचायत अधिकारी' WHERE position = 'Grampanchyat Adhikari';
UPDATE representatives SET position = 'सदस्य' WHERE position = 'Member';

-- Update CHECK constraint for position
ALTER TABLE representatives DROP CONSTRAINT IF EXISTS representatives_position_check;
ALTER TABLE representatives ADD CONSTRAINT representatives_position_check 
    CHECK (position IN ('सरपंच', 'उपसरपंच', 'ग्रामपंचायत अधिकारी', 'सदस्य'));

-- ==============================================
-- 2. CERTIFICATES TABLE
-- ==============================================
-- Rename Marathi columns to be the main columns
ALTER TABLE certificates RENAME COLUMN certificate_name_mr TO certificate_name;
ALTER TABLE certificates RENAME COLUMN certificate_description_mr TO certificate_description;

-- Drop English columns
ALTER TABLE certificates DROP COLUMN IF EXISTS certificate_name_en;
ALTER TABLE certificates DROP COLUMN IF EXISTS certificate_description_en;

-- ==============================================
-- 3. INFRASTRUCTURE TABLE
-- ==============================================
-- Rename columns to match new schema
ALTER TABLE infrastructure RENAME COLUMN category TO subcategory;
ALTER TABLE infrastructure RENAME COLUMN category_mr TO facility;

-- Drop description column if exists
ALTER TABLE infrastructure DROP COLUMN IF EXISTS description;

-- If the old schema had different column names, adjust accordingly
-- Alternative if columns were different:
-- ALTER TABLE infrastructure ADD COLUMN subcategory VARCHAR(255);
-- ALTER TABLE infrastructure ADD COLUMN facility VARCHAR(255);
-- UPDATE infrastructure SET subcategory = category, facility = category_mr;
-- ALTER TABLE infrastructure DROP COLUMN category;
-- ALTER TABLE infrastructure DROP COLUMN category_mr;

-- ==============================================
-- 4. HISTORICAL EVENTS TABLE
-- ==============================================
-- Keep Marathi event_name, drop English, rename description to additional_info
ALTER TABLE historical_events DROP COLUMN IF EXISTS event_name_en;
ALTER TABLE historical_events RENAME COLUMN description TO additional_info;

-- ==============================================
-- 5. HISTORICAL PLACES TABLE
-- ==============================================
-- Keep Marathi place_name, drop English, rename description to place_info
ALTER TABLE historical_places DROP COLUMN IF EXISTS place_name_en;
ALTER TABLE historical_places RENAME COLUMN description TO place_info;

-- ==============================================
-- 6. GRAMPANCHAYAT INFO TABLE
-- ==============================================
-- Drop all English name columns
ALTER TABLE grampanchayat_info DROP COLUMN IF EXISTS grampanchayat_name_en;
ALTER TABLE grampanchayat_info DROP COLUMN IF EXISTS taluka_name_en;
ALTER TABLE grampanchayat_info DROP COLUMN IF EXISTS district_name_en;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Run these to verify the migration was successful

-- Check representatives structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'representatives' ORDER BY ordinal_position;

-- Check certificates structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'certificates' ORDER BY ordinal_position;

-- Check infrastructure structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'infrastructure' ORDER BY ordinal_position;

-- Check historical_events structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'historical_events' ORDER BY ordinal_position;

-- Check historical_places structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'historical_places' ORDER BY ordinal_position;

-- Check grampanchayat_info structure
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'grampanchayat_info' ORDER BY ordinal_position;

-- ==============================================
-- NOTES
-- ==============================================
-- 1. Backup your database before running this migration!
-- 2. This migration assumes you want to keep the Marathi data and drop English data
-- 3. If you need to preserve English data, modify the script to copy data instead of dropping columns
-- 4. After migration, update your backend code to use the new column names
-- 5. Test thoroughly in a development environment before running in production
