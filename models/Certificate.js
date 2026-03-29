const { pool } = require("../config/database");

const Certificate = {
  // Get all active certificates
  findAll: async () => {
    const query =
      'SELECT * FROM certificates WHERE is_active IS NOT FALSE ORDER BY "order"';
    const result = await pool.query(query);

    // Transform data to match expected format
    return result.rows.map((row) => ({
      id: row.id,
      certificateName: row.certificate_name,
      certificateDescription: row.certificate_description,
      requiredDocuments: row.required_documents || [],
      applyOnlineUrl: row.apply_online_url,
      isActive: row.is_active,
      order: row.order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Create certificates (bulk)
  createMany: async (certificates) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Get the current max order value
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX("order"), -1) as max_order FROM certificates'
      );
      let currentOrder = maxOrderResult.rows[0].max_order + 1;

      // Insert or Update certificates
      const upsertPromises = certificates.map((cert) => {
        if (cert.id) {
          // Update existing
          const query = `
            UPDATE certificates 
            SET certificate_name = $1, certificate_description = $2, 
                required_documents = $3, apply_online_url = $4, 
                is_active = $5, updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
          `;
          return client.query(query, [
            cert.certificateName || "",
            cert.certificateDescription || "",
            JSON.stringify(cert.requiredDocuments || []),
            cert.applyOnlineUrl || null,
            cert.isActive !== undefined ? cert.isActive : true,
            cert.id,
          ]);
        } else {
          // Insert new
          const query = `
            INSERT INTO certificates (
              certificate_name, certificate_description,
              required_documents, apply_online_url, is_active, "order"
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
          `;
          return client.query(query, [
            cert.certificateName || "",
            cert.certificateDescription || "",
            JSON.stringify(cert.requiredDocuments || []),
            cert.applyOnlineUrl || null,
            cert.isActive !== undefined ? cert.isActive : true,
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
          certificateName: row.certificate_name,
          certificateDescription: row.certificate_description,
          requiredDocuments: row.required_documents,
          applyOnlineUrl: row.apply_online_url,
          isActive: row.is_active,
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

  // Delete a certificate by ID
  delete: async (id) => {
    const query = "DELETE FROM certificates WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      throw new Error("Certificate not found");
    }

    return result.rows[0];
  },
};

module.exports = Certificate;
