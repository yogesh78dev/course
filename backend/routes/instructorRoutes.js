// backend/routes/instructorRoutes.js
const express = require('express');
const { getInstructors, createInstructor, updateInstructor, deleteInstructor } = require('../controllers/instructorController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.route('/')
    .get(getInstructors)
    .post(createInstructor);

router.route('/:id')
    .put(updateInstructor)
    .delete(deleteInstructor);

module.exports = router;
