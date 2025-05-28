const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../config/s3');
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', upload.single('profilePhoto'), userController.register);
// POST /api/auth/login
router.post('/login', userController.login);
// Reset password request
router.post('/request-password-reset', authController.requestPasswordReset);
// Reset password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
