const { pool } = require('../config/database');

class WasteTypeModel {
  async generateId() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM waste_type');
    const count = rows[0].count + 1;
    return `WT_${count.toString().padStart(2, '0')}`;
  }

  async tambahWasteType(waste_type_name) {
    const wasteTypeId = await this.generateId();
    const [result] = await pool.query(
      'INSERT INTO waste_type (waste_type_id, waste_type_name, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [wasteTypeId, waste_type_name]
    );
    return this.getWasteType(wasteTypeId);
  }

  async getWasteType(wasteTypeId) {
    const [rows] = await pool.query('SELECT * FROM waste_type WHERE waste_type_id = ?', [wasteTypeId]);
    return rows[0];
  }

  async getAllWasteTypes() {
    const [rows] = await pool.query('SELECT * FROM waste_type');
    return rows;
  }
}

module.exports = new WasteTypeModel();