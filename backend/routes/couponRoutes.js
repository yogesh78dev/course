// backend/routes/couponRoutes.js
const express = require('express');
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.route('/')
    .get(getCoupons)
    .post(createCoupon);

router.route('/:id')
    .put(updateCoupon)
    .delete(deleteCoupon);

module.exports = router;
