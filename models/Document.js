const { pool } = require("../config/database");

const Document = {
  // Get all documents
  findAll: async () => {
    const query = "SELECT * FROM documents ORDER BY created_at DESC";
    const result = await pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Find documents by category
  findByCategory: async (category) => {
    const query =
      "SELECT * FROM documents WHERE category = $1 ORDER BY created_at DESC";
    const result = await pool.query(query, [category]);

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Find document by ID
  findById: async (id) => {
    const query = "SELECT * FROM documents WHERE id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Create document
  create: async (documentData) => {
    const query = `
      INSERT INTO documents (title, description, category, data)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await pool.query(query, [
      documentData.title,
      documentData.description || null,
      documentData.category,
      documentData.data ? JSON.stringify(documentData.data) : "{}",
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Update document
  update: async (id, documentData) => {
    const query = `
      UPDATE documents 
      SET title = $2, description = $3, category = $4, data = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      id,
      documentData.title,
      documentData.description || null,
      documentData.category,
      documentData.data ? JSON.stringify(documentData.data) : "{}",
    ]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },

  // Delete document
  delete: async (id) => {
    const query = "DELETE FROM documents WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      data: row.data,
    };
  },

  // Delete many documents
  deleteMany: async (ids) => {
    const query = "DELETE FROM documents WHERE id = ANY($1::uuid[])";
    await pool.query(query, [ids]);
    return { deletedCount: ids.length };
  },
};

module.exports = Document;
