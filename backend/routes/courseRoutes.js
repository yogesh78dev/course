// backend/routes/courseRoutes.js
const express = require('express');
const { 
    getCourses, 
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    getPublicCourses,
    getPublicCourseById
} = require('../controllers/courseController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// --- Public Routes for Mobile App ---
router.get('/public', getPublicCourses);
router.get('/public/:id', getPublicCourseById);


// --- Admin Routes ---
router.route('/')
    .get(protect, admin, getCourses)
    .post(protect, admin, createCourse);

router.route('/:id')
    .get(protect, admin, getCourseById)
    .put(protect, admin, updateCourse)
    .delete(protect, admin, deleteCourse);
    
module.exports = router;