const express = require('express');
const router = express.Router();
const wasteTypeController = require('../controllers/wasteTypeController');

router.post('/waste-type', wasteTypeController.addWasteType);
router.get('/waste-type', wasteTypeController.getAllWasteTypes);

module.exports = router;