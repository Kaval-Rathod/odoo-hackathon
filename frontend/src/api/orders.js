import api from './index';

export const ordersAPI = {
  placeOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrdersByUserId: async (userId) => {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status, currentLocation) => {
    const response = await api.put(`/orders/${orderId}/status`, { status, currentLocation });
    return response.data;
  },

  updateOrderTracking: async (orderId, trackingData) => {
    const response = await api.put(`/orders/${orderId}/tracking`, trackingData);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  deleteOrderTracking: async (orderId, trackingId) => {
    const response = await api.delete(`/orders/${orderId}/tracking/${trackingId}`);
    return response.data;
  },

  // Razorpay methods
  createRazorpayOrder: async (amount) => {
    try {
      console.log('Sending createRazorpayOrder request with amount:', amount);
      
      // Explicitly set the Content-Type header
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await api.post(
        '/orders/create-razorpay-order', 
        { amount }, 
        config
      );
      
      console.log('Received response from createRazorpayOrder:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      
      // Check if there's a response with data
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
        
        // Return the error data from the server if available
        throw new Error(
          error.response.data.message || 
          error.response.data.error || 
          `Server error: ${error.response.status}`
        );
      }
      
      // Network or other error
      throw new Error(error.message || 'Failed to connect to payment service');
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      console.log('Sending verifyRazorpayPayment request with data:', paymentData);
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const response = await api.post(
        '/orders/verify-razorpay-payment', 
        paymentData, 
        config
      );
      
      console.log('Received response from verifyRazorpayPayment:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error verifying Razorpay payment:', error);
      
      // Check if there's a response with data
      if (error.response && error.response.data) {
        console.error('Server error details:', error.response.data);
        throw new Error(
          error.response.data.message || 
          error.response.data.error || 
          `Server error: ${error.response.status}`
        );
      }
      
      // Network or other error
      throw new Error(error.message || 'Failed to verify payment');
    }
  },

  // Test Razorpay connection
  testRazorpay: async () => {
    try {
      console.log('Testing Razorpay connection');
      const response = await api.get('/orders/test-razorpay');
      console.log('Razorpay test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error testing Razorpay connection:', error);
      throw new Error(error.message || 'Failed to test Razorpay connection');
    }
  }
}; 