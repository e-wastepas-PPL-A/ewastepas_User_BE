const express = require('express');
const OrdersController = require('../controllers/OrdersController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();
// Endpoint untuk mendapatkan data pickup
router.get('/pickup-data', authenticate, OrdersController.getPickupData);
// Endpoint untuk mendapatkan riwayat pickup
router.get('/pickup-history', authenticate, OrdersController.getPickupHistory);
// Endpoint untuk mendapatkan detail pickup
router.get('/pickup-details', authenticate, OrdersController.getPickupDetails);
// Endpoint for getting pickup details by ID
router.get('/pickup-details/:pickupId', authenticate, OrdersController.getPickupDetailsById);

module.exports = router;
