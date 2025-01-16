const wasteTypeModel = require('../models/wasteTypeModel');

class WasteTypeController {
  async getAllWasteTypes(req, res) {
    try {
      const wasteTypes = await wasteTypeModel.getAllWasteTypes(); // Pastikan nama metode benar
      res.json({ data: wasteTypes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addWasteType(req, res) {
    const { waste_type_name } = req.body;
    try {
      const wasteType = await wasteTypeModel.tambahWasteType(waste_type_name);
      res.status(201).json({ message: 'Waste type added successfully', data: wasteType });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new WasteTypeController();