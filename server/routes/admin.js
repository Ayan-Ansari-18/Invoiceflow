const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const {
  loginAdmin,
  getStats,
  getUsers,
  toggleBanUser,
  updateUserPlan,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// Public route for admin login
router.post('/login', loginAdmin);

// All routes below require authentication and admin privileges
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/plan', updateUserPlan);
router.delete('/users/:id', deleteUser);

module.exports = router;
