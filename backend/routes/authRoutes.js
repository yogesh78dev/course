// backend/routes/authRoutes.js
const express = require('express');
const { 
    loginAdmin, 
    registerSendOtp,
    registerVerifyAndCreate,
    loginStudent, 
    loginWithGmail,
    forgotPassword,
    verifyOtp,
    resetPassword,
    resendOtp
} = require('../controllers/authController');

const router = express.Router();

// Admin Authentication
router.post('/login-admin', loginAdmin);

// Student (Mobile App) Authentication with OTP
router.post('/register-send-otp', registerSendOtp);
router.post('/register-verify-and-create', registerVerifyAndCreate);

// Student Login
router.post('/login-student', loginStudent);
router.post('/login-gmail', loginWithGmail);

// Password Reset Flow
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);

module.exports = router;