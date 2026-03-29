const { pool } = require("../config/database");

const GrampanchayatInfo = {
  // Get grampanchayat info
  find: async () => {
    const query = "SELECT * FROM grampanchayat_info LIMIT 1";
    const result = await pool.query(query);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      grampanchayatName: row.grampanchayat_name,
      talukaName: row.taluka_name,
      districtName: row.district_name,
      phone: row.phone,
      email: row.email,
      address: row.address,
      pincode: row.pincode,
      website: row.website,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Save grampanchayat info
  save: async (data) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if info already exists
      const checkQuery = "SELECT id FROM grampanchayat_info LIMIT 1";
      const checkResult = await client.query(checkQuery);

      let result;
      if (checkResult.rows.length > 0) {
        // Update existing info
        const updateQuery = `
          UPDATE grampanchayat_info
          SET grampanchayat_name = $1, taluka_name = $2, district_name = $3,
              phone = $4, email = $5, address = $6, pincode = $7, website = $8,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $9
          RETURNING *
        `;
        result = await client.query(updateQuery, [
          data.grampanchayatName,
          data.talukaName,
          data.districtName,
          data.phone,
          data.email || null,
          data.address || null,
          data.pincode || null,
          data.website || null,
          checkResult.rows[0].id,
        ]);
      } else {
        // Insert new info
        const insertQuery = `
          INSERT INTO grampanchayat_info (
            grampanchayat_name, taluka_name, district_name,
            phone, email, address, pincode, website
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        result = await client.query(insertQuery, [
          data.grampanchayatName,
          data.talukaName,
          data.districtName,
          data.phone,
          data.email || null,
          data.address || null,
          data.pincode || null,
          data.website || null,
        ]);
      }

      await client.query("COMMIT");

      const row = result.rows[0];
      return {
        id: row.id,
        grampanchayatName: row.grampanchayat_name,
        talukaName: row.taluka_name,
        districtName: row.district_name,
        phone: row.phone,
        email: row.email,
        address: row.address,
        pincode: row.pincode,
        website: row.website,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = GrampanchayatInfo;
