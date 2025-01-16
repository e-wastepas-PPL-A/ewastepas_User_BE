const { pool } = require('../config/database');

class CartModel {
  // Mendapatkan cart berdasarkan community_id
  async getCartByCommunityId(community_id) {
    const [rows] = await pool.query(
      'SELECT * FROM cart WHERE community_id = ?',
      [community_id]
    );
    return rows[0];
  }

  // Membuat cart baru untuk community_id
  async createCart(community_id) {
    const [result] = await pool.query(
      'INSERT INTO cart (community_id, created_at) VALUES (?, NOW())',
      [community_id]
    );

    const cart_id = result.insertId;
    return this.getCartById(cart_id);
  }

  // Mendapatkan cart berdasarkan cart_id
  async getCartById(cart_id) {
    const [rows] = await pool.query(
      'SELECT * FROM cart WHERE cart_id = ?',
      [cart_id]
    );
    return rows[0];
  }

  // Menambahkan atau memperbarui item di cart_detail
  async addOrUpdateCartItem(cart_id, waste_id, quantity) {
    const [existingItem] = await pool.query(
      'SELECT * FROM cart_detail WHERE cart_id = ? AND waste_id = ?',
      [cart_id, waste_id]
    );

    const [wasteData] = await pool.query(
      'SELECT point FROM waste WHERE waste_id = ?',
      [waste_id]
    );

    if (!wasteData || wasteData.length === 0) {
      throw new Error('Waste ID tidak valid. Data tidak ditemukan di tabel waste.');
    }

    const wastePoint = wasteData[0].point;

    if (existingItem.length > 0) {
      const item = existingItem[0];
      const newQuantity = item.quantity + quantity;
      const newPoint = item.point + wastePoint * quantity;

      await pool.query(
        'UPDATE cart_detail SET quantity = ?, point = ?, updated_at = NOW() WHERE cart_id = ? AND waste_id = ?',
        [newQuantity, newPoint, cart_id, waste_id]
      );

      return this.getCartItem(cart_id, waste_id);
    } else {
      const totalPoint = wastePoint * quantity;

      await pool.query(
        'INSERT INTO cart_detail (cart_id, waste_id, quantity, point, created_at) VALUES (?, ?, ?, ?, NOW())',
        [cart_id, waste_id, quantity, totalPoint]
      );

      return this.getCartItem(cart_id, waste_id);
    }
  }

  // Mengurangi jumlah item di cart_detail
  async decreaseCartItem(cart_id, waste_id, quantity) {
    const [existingItem] = await pool.query(
      'SELECT * FROM cart_detail WHERE cart_id = ? AND waste_id = ?',
      [cart_id, waste_id]
    );

    if (!existingItem || existingItem.length === 0) {
      return null;
    }

    const item = existingItem[0];

    const [wasteData] = await pool.query(
      'SELECT point FROM waste WHERE waste_id = ?',
      [waste_id]
    );

    const wastePoint = wasteData[0].point;

    const newQuantity = item.quantity - quantity;
    const newPoint = item.point - wastePoint * quantity;

    if (newQuantity <= 0) {
      await pool.query(
        'DELETE FROM cart_detail WHERE cart_id = ? AND waste_id = ?',
        [cart_id, waste_id]
      );
      return null;
    } else {
      await pool.query(
        'UPDATE cart_detail SET quantity = ?, point = ?, updated_at = NOW() WHERE cart_id = ? AND waste_id = ?',
        [newQuantity, newPoint, cart_id, waste_id]
      );

      return this.getCartItem(cart_id, waste_id);
    }
  }

  // Mendapatkan semua item dari cart_detail dengan JOIN waste untuk mendapatkan nama dan gambar
  async getAllCartItems(cart_id) {
    const [rows] = await pool.query(
      `SELECT 
         cd.cart_detail_id, 
         cd.cart_id, 
         cd.quantity, 
         cd.point, 
         cd.waste_id, 
         w.waste_name, 
         w.image, 
         cd.created_at, 
         cd.updated_at 
       FROM 
         cart_detail cd
       JOIN 
         waste w ON cd.waste_id = w.waste_id
       WHERE 
         cd.cart_id = ?`,
      [cart_id]
    );
    return rows;
  }

  // Mendapatkan item dari cart_detail berdasarkan cart_id dan waste_id
  async getCartItem(cart_id, waste_id) {
    const [rows] = await pool.query(
      'SELECT * FROM cart_detail WHERE cart_id = ? AND waste_id = ?',
      [cart_id, waste_id]
    );
    return rows[0];
  }

  // Menghapus item dari cart_detail berdasarkan cart_id dan waste_id
  async deleteCartItem(cart_id, waste_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM cart_detail WHERE cart_id = ? AND waste_id = ?',
        [cart_id, waste_id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Ambil alamat berdasarkan community_id
  async getAddressByCommunityId(community_id) {
    const [rows] = await pool.query(
      'SELECT address FROM community WHERE community_id = ?',
      [community_id]
    );
    return rows[0]?.address || null;
  }

  // Ambil detail cart berdasarkan community_id
  async getCartDetailsByCommunityId(community_id) {
    const [rows] = await pool.query(
      `
      SELECT cd.cart_id, cd.waste_id, cd.quantity, cd.point, w.waste_name, w.image
      FROM cart_detail cd
      JOIN cart c ON cd.cart_id = c.cart_id
      JOIN waste w ON cd.waste_id = w.waste_id
      WHERE c.community_id = ?
      `,
      [community_id]
    );
    return rows;
  }

}



module.exports = new CartModel();
