
// backend/routes/webinarRoutes.js
const express = require('express');
const { getWebinars, createWebinar, updateWebinar, deleteWebinar } = require('../controllers/webinarController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getWebinars)
    .post(protect, admin, createWebinar);

router.route('/:id')
    .put(protect, admin, updateWebinar)
    .delete(protect, admin, deleteWebinar);

module.exports = router;

