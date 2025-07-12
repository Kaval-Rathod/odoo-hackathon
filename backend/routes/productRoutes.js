const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Product creation: any authenticated user
router.post('/', protect, createProduct);
// Product update/delete: user can update/delete their own, admin can update/delete any
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.put('/:id/approve', protect, isAdmin, require('../controllers/productController').approveProduct);
router.put('/:id/reject', protect, isAdmin, require('../controllers/productController').rejectProduct);

module.exports = router;
