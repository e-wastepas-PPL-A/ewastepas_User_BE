const OrdersModel = require('../models/OrdersModel');

class OrdersController {
  // Menampilkan semua pickup beserta detailnya
  async getPickupData(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
    }
  
    const community_id = req.user.id;
    console.log('Community ID:', community_id);
  
    if (!community_id) {
      return res.status(400).json({ message: 'Community ID tidak ditemukan.' });
    }
  
    try {
      const data = await OrdersModel.getPickupData(community_id);
      
      if (data.length === 0) {
        return res.status(404).json({ message: 'Tidak ada data pickup untuk komunitas ini.' });
      }
  
      res.status(200).json({
        message: 'Data pickup berhasil diambil.',
        data,
      });
    } catch (error) {
      console.error('Error fetching pickup data:', error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async getPickupHistory(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
    }

    const community_id = req.user.id;
    console.log('Community ID:', community_id);

    if (!community_id) {
      return res.status(400).json({ message: 'Community ID tidak ditemukan.' });
    }

    try {
      const history = await OrdersModel.getPickupHistory(community_id);
      
      if (history.length === 0) {
        return res.status(404).json({ message: 'Tidak ada riwayat pickup untuk komunitas ini.' });
      }

      res.status(200).json({
        message: 'Riwayat pickup berhasil diambil.',
        data: history,
      });
    } catch (error) {
      console.error('Error fetching pickup history:', error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async getPickupDetails(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'User belum login. Silakan login terlebih dahulu.' });
    }

    const community_id = req.user.id;

    if (!community_id) {
      return res.status(400).json({ message: 'Community ID tidak ditemukan.' });
    }

    try {
      const details = await OrdersModel.getPickupDetails(community_id);
      
      if (details.length === 0) {
        return res.status(404).json({ message: 'Tidak ada detail pickup untuk komunitas ini.' });
      }

      res.status(200).json({
        message: 'Detail pickup berhasil diambil.',
        data: details,
      });
    } catch (error) {
      console.error('Error fetching pickup details:', error.message);
      res.status(500).json({ message: error.message });
    }
  }

  async getPickupDetailsById(req, res) {
    const { pickupId } = req.params;

    try {
      const details = await OrdersModel.getPickupDetailsById(pickupId);
      
      if (!details) {
        return res.status(404).json({ message: 'Pickup details not found.' });
      }

      res.status(200).json({
        message: 'Pickup details retrieved successfully.',
        data: details,
      });
    } catch (error) {
      console.error('Error fetching pickup details:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrdersController();
