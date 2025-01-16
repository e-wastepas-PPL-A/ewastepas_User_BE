const express = require('express');
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/add', authenticate, cartController.addItem);
router.post('/decrease', authenticate, cartController.decreaseItem);
router.get('/view', authenticate, cartController.viewCart);
router.delete('/delete', authenticate, cartController.deleteItem);


module.exports = router;
