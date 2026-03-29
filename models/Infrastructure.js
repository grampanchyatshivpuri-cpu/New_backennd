const { pool } = require("../config/database");

const Infrastructure = {
  // Get all infrastructure
  findAll: async () => {
    const query = 'SELECT * FROM infrastructure ORDER BY "order"';
    const result = await pool.query(query);

    // Transform to match expected format
    return result.rows.map((row) => ({
      id: row.id,
      subcategory: row.subcategory,
      facility: row.facility,
      count: row.count,
      order: row.order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Get infrastructure by subcategory
  findBySubcategory: async (subcategory) => {
    const query =
      'SELECT * FROM infrastructure WHERE subcategory = $1 ORDER BY "order"';
    const result = await pool.query(query, [subcategory]);

    // Transform to match expected format
    return result.rows.map((row) => ({
      id: row.id,
      subcategory: row.subcategory,
      facility: row.facility,
      count: row.count,
      order: row.order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Create infrastructure (bulk)
  createMany: async (infrastructureList) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get the current max order value
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX("order"), -1) as max_order FROM infrastructure'
      );
      let currentOrder = maxOrderResult.rows[0].max_order + 1;

      const upsertPromises = infrastructureList.map((item) => {
        if (item.id) {
          // Update existing
          const query = `
            UPDATE infrastructure 
            SET subcategory = $1, facility = $2, count = $3, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *
          `;
          return client.query(query, [
            item.subcategory,
            item.facility,
            item.count,
            item.id,
          ]);
        } else {
          // Insert new
          const query = `
            INSERT INTO infrastructure (subcategory, facility, count, "order")
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `;
          return client.query(query, [
            item.subcategory,
            item.facility,
            item.count,
            currentOrder++,
          ]);
        }
      });

      const results = await Promise.all(upsertPromises);
      await client.query("COMMIT");

      return results.map((r) => {
        const row = r.rows[0];
        return {
          id: row.id,
          subcategory: row.subcategory,
          facility: row.facility,
          count: row.count,
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

  // Delete an infrastructure item by ID
  delete: async (id) => {
    const query = "DELETE FROM infrastructure WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Infrastructure item not found");
    }

    return result.rows[0];
  },

  // Delete all infrastructure items by subcategory
  deleteBySubcategory: async (subcategory) => {
    const query =
      "DELETE FROM infrastructure WHERE subcategory = $1 RETURNING *";
    const result = await pool.query(query, [subcategory]);
    return result.rows;
  },
};

module.exports = Infrastructure;
