const express = require('express');
const { requireAuth } = require('../middleware/requireAuth');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  getStats,
  getUsers,
  toggleBanUser,
  updateUserPlan,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(requireAuth, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/plan', updateUserPlan);
router.delete('/users/:id', deleteUser);

module.exports = router;
