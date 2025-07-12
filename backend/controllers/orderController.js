const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Configure these constants for easy reference
const RAZORPAY_KEY_ID = 'rzp_test_igMFcMtYLETsxs';
const RAZORPAY_KEY_SECRET = 'w3ny584W2SR8bX9miUzmI1CE';

// Initialize Razorpay with valid test keys
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
  console.log('Razorpay initialized successfully');
} catch (err) {
  console.error('Failed to initialize Razorpay:', err);
}

// Create Razorpay order
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ 
        message: 'Payment gateway not initialized', 
        error: 'Server configuration error' 
      });
    }
    
    let { amount } = req.body;
    
    // Very simple validation to ensure amount is valid
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    // Ensure we have an integer value in paise (no decimals)
    const amountInPaise = Math.round(amount * 100);
    
    console.log('Attempting to create Razorpay order for amount:', { amount, amountInPaise });
    
    // Create receipt ID
    const receiptId = 'order_receipt_' + Date.now();
    
    // Using try-catch specifically for Razorpay API call
    try {
      // Simplified options object
      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId
      };
      
      console.log('Creating order with options:', orderOptions);
      
      // Create order
      const order = await razorpay.orders.create(orderOptions);
      
      console.log('Successfully created order:', order);
      
      // Return successful response
      return res.status(200).json({
        success: true,
        order,
        key: RAZORPAY_KEY_ID
      });
    } catch (razorpayError) {
      // Log the specific Razorpay error
      console.error('Razorpay API Error:', razorpayError);
      
      // Return more specific error
      return res.status(500).json({
        message: 'Failed to create payment order',
        error: razorpayError.message || 'Unknown Razorpay error'
      });
    }
  } catch (error) {
    // Log the general error
    console.error('Error in createRazorpayOrder:', error);
    
    // Return generic error
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ 
        message: 'Payment gateway not initialized', 
        error: 'Server configuration error' 
      });
    }
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        message: 'Missing required payment information',
        error: 'Please provide all required payment details'
      });
    }
    
    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    
    try {
      // Create a signature using the key_secret and verify against the received signature
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      
      const isAuthentic = expectedSignature === razorpay_signature;
      console.log('Payment verification:', { expectedSignature, receivedSignature: razorpay_signature, isAuthentic });
      
      if (!isAuthentic) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } catch (verificationError) {
      console.error('Error during payment verification:', verificationError);
      return res.status(500).json({
        message: 'Payment verification failed',
        error: verificationError.message
      });
    }
  } catch (error) {
    console.error('❌ Error verifying Razorpay payment:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// Update placeOrder to support Razorpay
exports.placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items, phone, totalAmount, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    // If items are provided directly from frontend, use them
    // Otherwise, get from cart
    let orderItems;
    if (items && items.length > 0) {
      orderItems = items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      }));
    } else {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      }));
    }

    // Transform shipping address to match model schema
    const transformedShippingAddress = {
      address: shippingAddress.street || shippingAddress.address,
      city: shippingAddress.city,
      postalCode: shippingAddress.zipCode || shippingAddress.postalCode,
      country: shippingAddress.country
    };

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: transformedShippingAddress,
      paymentMethod,
      totalAmount,
      razorpayPaymentId,
      razorpayOrderId,
      isPaid: paymentMethod === 'razorpay' && razorpayPaymentId ? true : false,
      paidAt: paymentMethod === 'razorpay' && razorpayPaymentId ? Date.now() : null
    });

    // Clear cart if it exists
    await Cart.deleteOne({ user: req.user._id });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('orderItems.product');
  res.json(orders);
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, currentLocation } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = status;
    if (typeof currentLocation === 'string') {
      // Only add to trackingHistory if location is new or changed
      if (
        !order.trackingHistory.length ||
        order.trackingHistory[order.trackingHistory.length - 1].location !== currentLocation
      ) {
        order.trackingHistory.push({ location: currentLocation, timestamp: new Date() });
      }
      order.currentLocation = currentLocation;
    }
    if (status.toLowerCase() === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Add/Update order tracking
exports.updateOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, status } = req.body;

    console.log('Updating order tracking:', { orderId, location, status });

    if (!location || !status) {
      return res.status(400).json({ message: 'Location and status are required' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Initialize trackingHistory if it doesn't exist
    if (!order.trackingHistory) {
      order.trackingHistory = [];
    }

    const newTrackingEntry = {
      location,
      status,
      timestamp: new Date()
    };

    console.log('Adding tracking entry:', newTrackingEntry);

    order.trackingHistory.push(newTrackingEntry);
    
    // Also update the main order status to the latest tracking status
    order.status = status;

    console.log('Saving order with tracking history:', order.trackingHistory.length, 'entries');

    await order.save();

    res.json({ message: 'Order tracking updated successfully', order });
  } catch (error) {
    console.error('Error updating order tracking:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ message: 'Failed to update order tracking', error: error.message });
  }
};

// Delete a specific tracking entry from an order
exports.deleteOrderTracking = async (req, res) => {
  try {
    const { orderId, trackingId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Find the tracking entry and pull it from the array
    const trackingEntry = order.trackingHistory.id(trackingId);
    if (!trackingEntry) {
      return res.status(404).json({ message: 'Tracking entry not found' });
    }

    // Use the pull method for more reliable subdocument removal
    order.trackingHistory.pull(trackingId);
    
    // If the deleted entry was the most recent one, update the order's main status
    // to the new most recent entry, or to the default if no history remains.
    if (order.trackingHistory.length > 0) {
      order.status = order.trackingHistory[order.trackingHistory.length - 1].status;
    } else {
      order.status = 'pending'; // Or whatever default status is appropriate
    }
    
    await order.save();

    res.json({ message: 'Tracking entry deleted successfully', order });

  } catch (error) {
    console.error('Error deleting tracking entry:', error);
    res.status(500).json({ message: 'Failed to delete tracking entry', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('orderItems.product')
      .populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    // Only allow the user who placed the order or an admin to view
    if (!req.user.isAdmin && String(order.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Get orders by user ID (admin only)
exports.getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate('orderItems.product')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
};

// Test Razorpay connection
exports.testRazorpay = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ 
        message: 'Payment gateway not initialized'
      });
    }
    
    // Create a simple test order with minimal amount
    try {
      const options = {
        amount: 100, // ₹1 in paisa
        currency: 'INR',
        receipt: 'test_receipt_' + Date.now()
      };
      
      const order = await razorpay.orders.create(options);
      
      return res.status(200).json({
        success: true,
        message: 'Razorpay connection successful',
        order,
        key: RAZORPAY_KEY_ID
      });
    } catch (testError) {
      console.error('Razorpay test error:', testError);
      return res.status(500).json({
        success: false,
        message: 'Razorpay connection failed',
        error: testError.message
      });
    }
  } catch (error) {
    console.error('Error testing Razorpay:', error);
    return res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
};
