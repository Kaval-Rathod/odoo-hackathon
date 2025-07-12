const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCart, addToCart, removeFromCart, updateCartItemQuantity } = require('../controllers/cartController');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:cartItemId', protect, updateCartItemQuantity);
router.delete('/:cartItemId', protect, removeFromCart);

module.exports = router;
