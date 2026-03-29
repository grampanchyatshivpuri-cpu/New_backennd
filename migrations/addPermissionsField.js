require("dotenv").config();
const { pool } = require("../config/database");

async function addPermissionsField() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Add permissions column if it doesn't exist
    await client.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='permissions'
                ) THEN
                    ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]';
                END IF;
            END $$;
        `);

    // Update role constraint to include 'viewer'
    await client.query(`
            ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        `);

    await client.query(`
            ALTER TABLE users ADD CONSTRAINT users_role_check 
            CHECK (role IN ('admin', 'editor', 'viewer'));
        `);

    // Change default role from 'admin' to 'editor'
    await client.query(`
            ALTER TABLE users ALTER COLUMN role SET DEFAULT 'editor';
        `);

    // Update existing admin users to have full permissions
    await client.query(`
            UPDATE users 
            SET permissions = '["*"]'::jsonb 
            WHERE role = 'admin' AND (permissions IS NULL OR permissions = '[]'::jsonb);
        `);

    await client.query("COMMIT");
    console.log(
      "✅ Successfully added permissions field and updated role constraints"
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error in migration:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addPermissionsField()
    .then(() => {
      console.log("Migration completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = addPermissionsField;
