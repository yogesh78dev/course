// backend/routes/reviewRoutes.js
const express = require('express');
const { getReviews, updateReviewStatus, deleteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.route('/')
    .get(getReviews);
    
router.route('/:id')
    .delete(deleteReview);

router.route('/:id/status')
    .put(updateReviewStatus);

module.exports = router;
