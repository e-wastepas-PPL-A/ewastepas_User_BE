const { pool } = require('../config/database');

class WasteModel {
  async generateId() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM waste');
    const count = rows[0].count + 1;
    return `WST_${count.toString().padStart(2, '0')}`;
  }

  async tambahWaste(wasteName, point, wasteTypeId, image) {
    const wasteId = await this.generateId();
    const [result] = await pool.query(
      'INSERT INTO waste (waste_id, waste_name, point, waste_type_id, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [wasteId, wasteName, point, wasteTypeId, image]
    );
    return this.getWaste(wasteId);
  }

  async getWaste(wasteId) {
    const [rows] = await pool.query('SELECT * FROM waste WHERE waste_id = ?', [wasteId]);
    return rows[0];
  }

  async getAllWaste() {
    const [rows] = await pool.query('SELECT * FROM waste');
    return rows;
  }
}

module.exports = new WasteModel();