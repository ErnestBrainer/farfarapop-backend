const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);  // ✅ New
router.post('/reset-password/:token', resetPassword); // ✅ New

module.exports = router;
