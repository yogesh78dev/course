// backend/routes/promotionRoutes.js
const express = require('express');
const { getActivePromotion, getPromotions, createOrUpdatePromotion, deletePromotion } = require('../controllers/promotionController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route for mobile app
router.get('/public/active', getActivePromotion);

// Admin routes
router.use(protect, admin);

router.route('/')
    .get(getPromotions)
    .post(createOrUpdatePromotion);

router.route('/:id')
    .delete(deletePromotion);

module.exports = router;
