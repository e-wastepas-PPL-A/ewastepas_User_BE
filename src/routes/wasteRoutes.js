const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');

router.post('/waste', wasteController.tambahWaste);
router.get('/waste', wasteController.getAllWaste);

module.exports = router;