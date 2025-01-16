const wasteModel = require('../models/wasteModel');
const wasteTypeModel = require('../models/wasteTypeModel');

class WasteController {
  async tambahWaste(req, res) {
    const { wasteName, point, wasteTypeId, image } = req.body;
    try {
      const wasteType = await wasteTypeModel.getWasteType(wasteTypeId);
      if (!wasteType) {
        return res.status(400).json({ error: 'Invalid waste type ID' });
      }

      const waste = await wasteModel.tambahWaste(wasteName, point, wasteTypeId, image);
      res.status(201).json({ message: 'Waste berhasil ditambahkan', data: waste });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllWaste(req, res) {
    try {
      const waste = await wasteModel.getAllWaste();
      res.json({ data: waste });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new WasteController();