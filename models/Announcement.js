const { pool } = require("../config/database");
const { deleteFromSupabase } = require("../middleware/upload");

const Announcement = {
  // Get all active announcements
  findAll: async () => {
    const query =
      "SELECT * FROM announcements WHERE is_active IS NOT FALSE ORDER BY upload_date DESC, created_at DESC";
    const result = await pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      filePath: row.file_path,
      fileType: row.file_type,
      fileSize: row.file_size,
      uploadDate: row.upload_date,
      isActive: row.is_active,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Create announcements (bulk)
  createMany: async (announcements) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const upsertPromises = announcements.map((announcement) => {
        if (announcement.id) {
          // Update existing
          const query = `
            UPDATE announcements 
            SET title = $1, file_path = $2, file_type = $3, file_size = $4, 
                upload_date = $5, is_active = $6, category = $7, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
          `;
          return client.query(query, [
            announcement.title,
            announcement.filePath,
            announcement.fileType,
            announcement.fileSize ? String(announcement.fileSize) : null,
            announcement.uploadDate || new Date(),
            announcement.isActive !== undefined ? announcement.isActive : true,
            announcement.category || "इतर",
            announcement.id,
          ]);
        } else {
          // Insert new
          const query = `
            INSERT INTO announcements (
              title, file_path, file_type, file_size, upload_date, is_active, category, "order"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `;
          return client.query(query, [
            announcement.title,
            announcement.filePath,
            announcement.fileType,
            announcement.fileSize ? String(announcement.fileSize) : null,
            announcement.uploadDate || new Date(),
            announcement.isActive !== undefined ? announcement.isActive : true,
            announcement.category || "इतर",
            announcement.order || 0,
          ]);
        }
      });

      const results = await Promise.all(upsertPromises);
      await client.query("COMMIT");

      return results.map((r) => {
        const row = r.rows[0];
        return {
          id: row.id,
          title: row.title,
          filePath: row.file_path,
          fileType: row.file_type,
          fileSize: row.file_size,
          uploadDate: row.upload_date,
          isActive: row.is_active,
          category: row.category,
          order: row.order,
        };
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete an announcement by ID
  delete: async (id) => {
    // First, get the announcement to find the file path
    const findQuery = "SELECT * FROM announcements WHERE id = $1";
    const findResult = await pool.query(findQuery, [id]);

    if (findResult.rows.length === 0) {
      throw new Error("Announcement not found");
    }

    const announcement = findResult.rows[0];

    // Delete from database
    const deleteQuery = "DELETE FROM announcements WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);

    // Delete file from Supabase storage if it exists
    if (announcement.file_path) {
      try {
        await deleteFromSupabase(announcement.file_path);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Don't throw error, just log it - the database record is already deleted
      }
    }

    return result.rows[0];
  },
};

module.exports = Announcement;
