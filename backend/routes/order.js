const { protect } = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get current user's orders
// ✅ Add this missing POST route to place an order
router.post('/orders', protect, orderController.placeOrder);

// ✅ Already existing
router.get('/my', protect, orderController.getMyOrders);
