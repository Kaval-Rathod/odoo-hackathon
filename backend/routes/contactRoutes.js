const express = require('express');
const router = express.Router();
const { 
  submitContact, 
  getAllContacts, 
  updateContactStatus, 
  deleteContact 
} = require('../controllers/contactController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Public route - Submit contact message
router.post('/submit', submitContact);

// Admin routes - Get all contacts, update status, delete
router.get('/', protect, isAdmin, getAllContacts);
router.put('/:contactId/status', protect, isAdmin, updateContactStatus);
router.delete('/:contactId', protect, isAdmin, deleteContact);

module.exports = router; 