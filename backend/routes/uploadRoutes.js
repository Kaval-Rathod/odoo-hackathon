const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Route to handle image uploads
router.post('/', protect, upload, uploadImage);

module.exports = router; 