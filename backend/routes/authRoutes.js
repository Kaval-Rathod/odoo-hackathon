const express = require('express');
const router = express.Router();
const { register, login, getAllUsers, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

// Admin: Get all users
router.get('/', protect, (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
}, getAllUsers);

// Get current user info
router.get('/me', protect, getMe);

module.exports = router;
