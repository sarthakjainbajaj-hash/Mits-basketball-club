const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
  revokeUserSessions,
  toggleUserSuspension,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize, requireSuperAdmin } = require('../middleware/role');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.post('/users/:id/revoke-sessions', protect, requireSuperAdmin, revokeUserSessions);
router.put('/users/:id/suspend', protect, requireSuperAdmin, toggleUserSuspension);

module.exports = router;
