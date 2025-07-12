const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getCategories);
router.get('/all', protect, isAdmin, getAllCategories);
router.get('/:id', getCategoryById);

// Admin Routes
router.post('/', protect, isAdmin, createCategory);
router.put('/:id', protect, isAdmin, updateCategory);
router.delete('/:id', protect, isAdmin, deleteCategory);

module.exports = router; 