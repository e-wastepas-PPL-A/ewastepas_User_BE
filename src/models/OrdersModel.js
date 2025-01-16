const { pool } = require('../config/database');

class OrdersModel {
  // Mengambil semua pickup beserta detail berdasarkan community_id
  async getPickupData(community_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        pw.pickup_id, 
        pw.pickup_date, 
        pw.pickup_status, 
        pd.waste_id, 
        pd.quantity, 
        pd.points, 
        w.waste_name, 
        w.image 
      FROM 
        pickup_waste pw
      LEFT JOIN 
        pickup_detail pd ON pw.pickup_id = pd.pickup_id
      LEFT JOIN 
        waste w ON pd.waste_id = w.waste_id
      WHERE 
        pw.community_id = ? 
        AND pw.pickup_status IN ('Menunggu Penjemputan', 'Dalam Perjalanan', 'Sampah telah dijemput')
      ORDER BY 
        pw.pickup_date DESC
      `,
      [community_id]
    );
  
    return rows;
  }
 
  async getPickupHistory(community_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        pw.pickup_id, 
        pw.pickup_date, 
        pw.pickup_status, 
        pd.waste_id, 
        pd.quantity, 
        pd.points, 
        w.waste_name, 
        w.image 
      FROM 
        pickup_waste pw
      LEFT JOIN 
        pickup_detail pd ON pw.pickup_id = pd.pickup_id
      LEFT JOIN 
        waste w ON pd.waste_id = w.waste_id
      WHERE 
        pw.community_id = ? 
        AND pw.pickup_status IN ('Pesanan selesai', 'Penjemputan gagal')
      ORDER BY 
        pw.pickup_date DESC
      `,
      [community_id]
    );

    // Group by pickup_id
    const groupedData = rows.reduce((acc, row) => {
      if (!acc[row.pickup_id]) {
        acc[row.pickup_id] = {
          pickup_id: row.pickup_id,
          pickup_date: row.pickup_date,
          pickup_status: row.pickup_status,
          details: [],
        };
      }
      acc[row.pickup_id].details.push({
        waste_id: row.waste_id,
        quantity: row.quantity,
        points: row.points,
        waste_name: row.waste_name,
        image: row.image,
      });
      return acc;
    }, {});

    return Object.values(groupedData);
  }

  async getPickupDetails(community_id) {
    const [rows] = await pool.query(
      `
      SELECT 
        pw.pickup_id, 
        pw.pickup_status, 
        pw.pickup_address, 
        c.name AS courier_name
      FROM 
        pickup_waste pw
      LEFT JOIN 
        courier c ON pw.courier_id = c.courier_id
      WHERE 
        pw.community_id = ?
      ORDER BY 
        pw.pickup_date DESC
      `,
      [community_id]
    );

    return rows;
  }

  async getPickupDetailsById(pickupId) {
    const [rows] = await pool.query(
      `
      SELECT 
        pw.pickup_id, 
        pw.pickup_status, 
        pw.pickup_address, 
        c.name AS courier_name
      FROM 
        pickup_waste pw
      LEFT JOIN 
        courier c ON pw.courier_id = c.courier_id
      WHERE 
        pw.pickup_id = ?
      `,
      [pickupId]
    );

    return rows[0]; // Return the first row, assuming pickup_id is unique
  }
}

module.exports = new OrdersModel();
