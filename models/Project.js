const { pool } = require("../config/database");

class Project {
  static async find() {
    try {
      const result = await pool.query(
        "SELECT * FROM projects ORDER BY created_at DESC"
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query("SELECT * FROM projects WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async save(data) {
    const { id, name, type, description, cost, start_date, end_date, status } = data;
    
    // Convert empty strings to null for optional fields
    const formattedCost = cost === "" ? null : cost;
    const formattedStartDate = start_date === "" ? null : start_date;
    const formattedEndDate = end_date === "" ? null : end_date;
    const formattedStatus = status === "" ? "प्रस्तावित" : status;

    try {
      if (id) {
        // Update
        const result = await pool.query(
          `UPDATE projects SET 
            name = $1, 
            type = $2, 
            description = $3, 
            cost = $4, 
            start_date = $5, 
            end_date = $6, 
            status = $7, 
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $8 RETURNING *`,
          [name, type, description, formattedCost, formattedStartDate, formattedEndDate, formattedStatus, id]
        );
        return result.rows[0];
      } else {
        // Create
        const result = await pool.query(
          `INSERT INTO projects (name, type, description, cost, start_date, end_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [name, type, description, formattedCost, formattedStartDate, formattedEndDate, formattedStatus]
        );
        return result.rows[0];
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.query("DELETE FROM projects WHERE id = $1", [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Project;
