// backend/routes/purchaseRoutes.js
const express = require('express');
const { 
    createOrder,
    verifyPayment,
    getMySalesHistory
} = require('../controllers/purchaseController');
const { protect, isStudent } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes in this file are for logged-in students
router.use(protect, isStudent);

router.post('/initiate', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getMySalesHistory);

module.exports = router;
