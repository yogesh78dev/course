// backend/routes/instructorRoutes.js
const express = require('express');
const { getInstructors, createInstructor, updateInstructor, deleteInstructor } = require('../controllers/instructorController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * Public route: Fetch instructors list
 * This allows the student mobile app and other clients to display instructor profiles.
 */
router.get('/', getInstructors);

/**
 * Admin-only routes: Manage instructors
 * Mutations remain protected to prevent unauthorized modifications.
 */
router.post('/', protect, admin, createInstructor);

router.route('/:id')
    .put(protect, admin, updateInstructor)
    .delete(protect, admin, deleteInstructor);

module.exports = router;
