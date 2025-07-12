const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrderById, updateOrderTracking, deleteOrderTracking, getOrdersByUserId, createRazorpayOrder, verifyRazorpayPayment, testRazorpay } = require('../controllers/orderController');

router.route('/')
  .post(protect, placeOrder)
  .get(protect, isAdmin, getAllOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/user/:userId').get(protect, isAdmin, getOrdersByUserId);

router.route('/:orderId')
  .get(protect, getOrderById)
  .put(protect, isAdmin, updateOrderStatus);

router.route('/:orderId/tracking')
  .put(protect, isAdmin, updateOrderTracking);

router.route('/:orderId/tracking/:trackingId')
    .delete(protect, isAdmin, deleteOrderTracking);

// Razorpay routes - temporarily removed authentication for debugging
router.post('/create-razorpay-order', createRazorpayOrder); // Removed protect middleware
router.post('/verify-razorpay-payment', verifyRazorpayPayment); // Removed protect middleware
router.get('/test-razorpay', testRazorpay); // Test route

module.exports = router;
