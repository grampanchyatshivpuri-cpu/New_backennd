const { pool } = require("../config/database");
const { deleteFromSupabase } = require("../middleware/upload");

const Image = {
  // Get all images with optional category filter
  findAll: async (category = null) => {
    let query = "SELECT * FROM images WHERE is_active = true";
    const params = [];

    if (category) {
      query += " AND category = $1";
      params.push(category);
    }

    query += ' ORDER BY "order", created_at DESC';

    const result = await pool.query(query, params);

    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      imagePath: row.image_path,
      imageUrl: row.image_url,
      category: row.category,
      isActive: row.is_active,
      order: row.order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  // Create image
  create: async (imageData) => {
    const query = `
      INSERT INTO images (title, description, image_path, image_url, category, is_active, "order")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      imageData.title || null,
      imageData.description || null,
      imageData.imagePath,
      imageData.imageUrl,
      imageData.category || "general",
      imageData.isActive !== undefined ? imageData.isActive : true,
      imageData.order || 0,
    ]);

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imagePath: row.image_path,
      imageUrl: row.image_url,
      category: row.category,
      isActive: row.is_active,
      order: row.order,
    };
  },

  // Delete image
  delete: async (id) => {
    // First, get the image to find the image path
    const findQuery = "SELECT * FROM images WHERE id = $1";
    const findResult = await pool.query(findQuery, [id]);

    if (findResult.rows.length === 0) {
      throw new Error("Image not found");
    }

    const image = findResult.rows[0];

    // Delete from database
    const deleteQuery = "DELETE FROM images WHERE id = $1 RETURNING *";
    const result = await pool.query(deleteQuery, [id]);

    // Delete image from Supabase storage if it exists
    if (image.image_url || image.image_path) {
      try {
        // Try to delete using image_url first, then image_path
        const pathToDelete = image.image_url || image.image_path;
        await deleteFromSupabase(pathToDelete);
      } catch (error) {
        console.error("Error deleting image from storage:", error);
        // Don't throw error, just log it - the database record is already deleted
      }
    }

    return result.rows[0];
  },
};

module.exports = Image;
