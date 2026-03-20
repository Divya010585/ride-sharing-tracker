const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, updateProfile, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.put('/update-profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;