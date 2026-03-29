const { pool } = require("../config/database");
const { deleteFromSupabase } = require("../middleware/upload");

const Representative = {
  // Get all representatives
  findAll: async () => {
    const query = 'SELECT * FROM representatives ORDER BY "order", created_at';
    const result = await pool.query(query);
    return result.rows;
  },

  // Create representatives (bulk)
  createMany: async (representatives) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get existing representatives to check for duplicates
      const existingQuery = 'SELECT * FROM representatives ORDER BY "order"';
      const existingResult = await client.query(existingQuery);
      const existingReps = existingResult.rows;

      // Create a map of existing reps by ID
      const existingById = new Map(existingReps.map((rep) => [rep.id, rep]));

      // Create a map of existing fixed positions
      const existingFixedPositions = new Map(
        existingReps
          .filter((rep) => rep.fixed)
          .map((rep) => [rep.position, rep])
      );

      const upsertPromises = representatives.map((rep, index) => {
        // For fixed positions, check if one already exists
        if (rep.fixed && !rep.id) {
          const existing = existingFixedPositions.get(rep.position);
          if (existing) {
            // Update the existing fixed position instead of creating duplicate
            rep.id = existing.id;
          }
        }

        // If rep has an ID, update; otherwise insert
        if (rep.id) {
          const query = `
            UPDATE representatives 
            SET name = $1, mobile = $2, position = $3, image = $4, fixed = $5, "order" = $6, updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
          `;
          return client.query(query, [
            rep.name,
            rep.mobile,
            rep.position,
            rep.image || null,
            rep.fixed || false,
            index,
            rep.id,
          ]);
        } else {
          const query = `
            INSERT INTO representatives (name, mobile, position, image, fixed, "order")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          return client.query(query, [
            rep.name,
            rep.mobile,
            rep.position,
            rep.image || null,
            rep.fixed || false,
            index,
          ]);
        }
      });

      const results = await Promise.all(upsertPromises);
      await client.query("COMMIT");

      return results.map((r) => r.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete all representatives
  deleteAll: async () => {
    const query = "DELETE FROM representatives";
    await pool.query(query);
  },

  // Delete a single representative by ID
  delete: async (id) => {
    // First, get the representative to find the image path
    const findQuery = "SELECT * FROM representatives WHERE id = $1";
    const findResult = await pool.query(findQuery, [id]);

    if (findResult.rows.length === 0) {
      throw new Error("Representative not found");
    }

    const representative = findResult.rows[0];

    // Delete from database
    const deleteQuery = "DELETE FROM representatives WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);

    // Delete image from Supabase if it exists
    if (representative.image) {
      try {
        await deleteFromSupabase(representative.image);
      } catch (error) {
        console.error("Error deleting image from storage:", error);
        // Don't throw error, just log it - the database record is already deleted
      }
    }

    return result.rows[0];
  },
};

module.exports = Representative;
