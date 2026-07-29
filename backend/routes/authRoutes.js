const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  updateSettings,
  forgotPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/settings', protect, updateSettings);

module.exports = router;
