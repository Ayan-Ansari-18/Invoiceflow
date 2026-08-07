const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, upgradePlan, googleAuth } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema, profileSchema } = require('../middleware/validate');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(profileSchema), updateProfile);
router.post('/upgrade', protect, upgradePlan);

module.exports = router;
