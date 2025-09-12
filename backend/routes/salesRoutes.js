// backend/routes/salesRoutes.js
const express = require('express');
const { getSales, getAnalytics, updateSaleStatus } = require('../controllers/salesController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.get('/', getSales);
router.get('/analytics', getAnalytics);
router.put('/:id/status', updateSaleStatus);

module.exports = router;
