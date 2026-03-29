const pool = require("../config/database");
const { deleteFromSupabase } = require("../middleware/upload");

const HeroImage = {
  // Get all hero images (ordered)
  async findAll() {
    const query = `
      SELECT * FROM hero_images 
      WHERE is_active = true 
      ORDER BY "order" ASC, created_at DESC
      LIMIT 3
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // Get hero image by ID
  async findById(id) {
    const query = "SELECT * FROM hero_images WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // Create new hero image
  async create(data) {
    const { image_path, image_url, order = 0 } = data;
    const query = `
      INSERT INTO hero_images (image_path, image_url, "order", is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `;
    const result = await pool.query(query, [image_path, image_url, order]);
    return result.rows[0];
  },

  // Update hero image order
  async updateOrder(id, order) {
    const query = `
      UPDATE hero_images 
      SET "order" = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [order, id]);
    return result.rows[0];
  },

  // Delete hero image
  async delete(id) {
    // Get image info before deleting
    const heroImage = await this.findById(id);
    if (!heroImage) {
      throw new Error("Hero image not found");
    }

    // Delete from database
    const query = "DELETE FROM hero_images WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    // Delete from Supabase storage
    if (heroImage.image_path) {
      await deleteFromSupabase(heroImage.image_path);
    }

    return result.rows[0];
  },

  // Get count of active hero images
  async getCount() {
    const query =
      "SELECT COUNT(*) as count FROM hero_images WHERE is_active = true";
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  },
};

module.exports = HeroImage;
