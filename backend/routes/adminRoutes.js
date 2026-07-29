const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllUsers,
  updateUserStatus,
  toggleAdmin,
  getSystemStats
} = require('../controllers/adminController');

router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/toggle-admin', toggleAdmin);
router.get('/stats', getSystemStats);

module.exports = router;
