const { pool } = require("../config/database");

const TaxPayment = {
  // Get tax payment info
  find: async () => {
    const query = "SELECT * FROM tax_payment LIMIT 1";
    const result = await pool.query(query);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      qrFilePath: row.qr_file_path,
      qrFileUrl: row.qr_file_url,
      qrFileType: row.qr_file_type,
      taxInfo: row.tax_info,
      bankName: row.bank_name,
      accountName: row.account_name,
      accountNo: row.account_no,
      ifscCode: row.ifsc_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Save tax payment info
  save: async (data) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check if info already exists
      const checkQuery = "SELECT id FROM tax_payment LIMIT 1";
      const checkResult = await client.query(checkQuery);

      let result;
      if (checkResult.rows.length > 0) {
        // Update existing info
        const updateQuery = `
          UPDATE tax_payment
          SET tax_info = $1, bank_name = $2, account_name = $3,
              account_no = $4, ifsc_code = $5,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $6
          RETURNING *
        `;
        result = await client.query(updateQuery, [
          data.taxInfo || null,
          data.bankName || null,
          data.accountName || null,
          data.accountNo || null,
          data.ifscCode || null,
          checkResult.rows[0].id,
        ]);
      } else {
        // Insert new info
        const insertQuery = `
          INSERT INTO tax_payment (
            tax_info, bank_name, account_name,
            account_no, ifsc_code
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        result = await client.query(insertQuery, [
          data.taxInfo || null,
          data.bankName || null,
          data.accountName || null,
          data.accountNo || null,
          data.ifscCode || null,
        ]);
      }

      await client.query("COMMIT");

      const row = result.rows[0];
      return {
        id: row.id,
        taxInfo: row.tax_info,
        bankName: row.bank_name,
        accountName: row.account_name,
        accountNo: row.account_no,
        ifscCode: row.ifsc_code,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  // Update QR code
  updateQR: async (id, qrData) => {
    const query = `
      UPDATE tax_payment
      SET qr_file_path = $1, qr_file_url = $2, qr_file_type = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      qrData.path,
      qrData.url,
      qrData.type,
      id
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      qrFilePath: row.qr_file_path,
      qrFileUrl: row.qr_file_url,
      qrFileType: row.qr_file_type
    };
  },

  // Delete/Clear tax payment info
  delete: async () => {
    const query = "DELETE FROM tax_payment";
    await pool.query(query);
    return true;
  },

  // Delete only the image
  deleteImage: async (id) => {
    const query = `
      UPDATE tax_payment
      SET qr_file_path = NULL, qr_file_url = NULL, qr_file_type = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await pool.query(query, [id]);
    return true;
  }
};

module.exports = TaxPayment;
