const express = require('express');
const CheckoutController = require('../controllers/CheckoutController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/checkout', authenticate, CheckoutController.checkout);
router.get('/address', authenticate, CheckoutController.getAddress);
router.get('/preview', authenticate, CheckoutController.previewCheckout);

module.exports = router;
