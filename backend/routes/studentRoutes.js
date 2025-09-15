// backend/routes/studentRoutes.js
const express = require('express');
const { 
    getStudentProfile, 
    updateStudentProfile, 
    getEnrolledCourses, 
    updateLessonProgress,
    submitCourseReview,
    getMyReviews,
    getMyNotifications,
    getEnrolledCourseDetails,
    claimCertificate,
    getMyCertificates
} = require('../controllers/studentController');
const { protect, isStudent, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// All subsequent routes in this file are for logged-in students
router.use(protect, isStudent);

// Profile routes
router.route('/me')
    .get(getStudentProfile)
    .put(updateStudentProfile);

// Course and progress routes
router.get('/my-courses', getEnrolledCourses);
router.get('/my-courses/:courseId', getEnrolledCourseDetails);
router.post('/my-courses/progress', updateLessonProgress);

// Review routes
router.get('/my-reviews', getMyReviews);
router.post('/courses/:courseId/review', submitCourseReview);

// Notification routes
router.get('/my-notifications', getMyNotifications);

// Certificate routes
router.post('/my-courses/:courseId/claim-certificate', claimCertificate);
router.get('/my-certificates', getMyCertificates);

module.exports = router;