// backend/routes/userRoutes.js
const express = require('express');
const { getUsers, createUser, updateUser, deleteUser, getStudentProfileForAdmin } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin); // All routes in this file are protected and admin-only

router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/profile/:id')
    .get(getStudentProfileForAdmin);

router.route('/:id')
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;