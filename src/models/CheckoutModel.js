const { pool } = require('../config/database');

class CheckoutModel {
  // Buat entri baru di tabel pickup_waste
  async createPickupWaste(community_id, pickup_address, pickup_date, pickup_time) {
    const [result] = await pool.query(
      `
      INSERT INTO pickup_waste (community_id, pickup_address, pickup_date, pickup_time, created_at)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [community_id, pickup_address, pickup_date, pickup_time]
    );
    return result.insertId; // Mengembalikan pickup_id yang baru dibuat
  }

  // Buat entri baru di tabel pickup_detail
  async createPickupDetails(pickup_id, items) {
    const values = items
      .map(
        (item) =>
          `(${pickup_id}, ${item.waste_id}, ${item.quantity}, ${item.point})`
      )
      .join(', ');

    await pool.query(
      `
      INSERT INTO pickup_detail (pickup_id, waste_id, quantity, points)
      VALUES ${values}
      `
    );
  }
  // Ambil alamat pengguna dari tabel community
  async getAddressByCommunityId(community_id) {
    const [rows] = await pool.query(
      `
      SELECT address 
      FROM community 
      WHERE community_id = ?
      `,
      [community_id]
    );
    return rows[0]?.address || null;
  }

  // Ambil data keranjang checkout
  async getCartDetailsForCheckout(community_id) {
    const [rows] = await pool.query(
      `
      SELECT cd.cart_detail_id, cd.waste_id, cd.quantity, cd.point, w.waste_name, w.image 
      FROM cart_detail cd
      JOIN cart c ON c.cart_id = cd.cart_id
      JOIN waste w ON w.waste_id = cd.waste_id
      WHERE c.community_id = ?
      `,
      [community_id]
    );
    return rows;
  }
}

module.exports = new CheckoutModel();
