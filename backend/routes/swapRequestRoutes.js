const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const swapRequestController = require('../controllers/swapRequestController');

// Create a swap/point request
router.post('/', protect, swapRequestController.createSwapRequest);
// Accept a request (uploader only)
router.put('/:id/accept', protect, swapRequestController.acceptSwapRequest);
// Reject a request (uploader only)
router.put('/:id/reject', protect, swapRequestController.rejectSwapRequest);
// List my requests
router.get('/my', protect, swapRequestController.getMySwapRequests);
// List requests for my items
router.get('/for-my-items', protect, swapRequestController.getRequestsForMyItems);

module.exports = router; 