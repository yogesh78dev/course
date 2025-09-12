// backend/controllers/studentController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const getStudentProfile = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    // 1. Get user profile
    const userQuery = `
        SELECT id, name, email, role, avatar_url as avatar, 
               DATE_FORMAT(joined_date, '%Y-%m-%d') as \`joinedDate\`,
               phone_number as phoneNumber, status
        FROM users u
        WHERE u.id = ?
    `;
    const [userRows] = await db.query(userQuery, [studentId]);

    if (userRows.length === 0) {
        return res.status(404).json({ message: 'Student not found.' });
    }
    
    const profile = userRows[0];

    // 2. Get enrollments
    const enrollmentsQuery = `
        SELECT
            course_id as 'courseId', 
            DATE_FORMAT(enrollment_date, '%Y-%m-%d') as 'enrollmentDate',
            DATE_FORMAT(expiry_date, '%Y-%m-%d') as 'expiryDate'
        FROM enrollments WHERE user_id = ?
    `;
    const [enrollments] = await db.query(enrollmentsQuery, [studentId]);
    profile.enrolledCourses = enrollments;

    // 3. Get watch history
    const historyQuery = `
        SELECT 
            wh.lesson_id as 'lessonId',
            m.course_id as 'courseId',
            wh.watched_at as 'watchedAt',
            wh.progress_percentage as 'progress'
        FROM watch_history wh 
        JOIN lessons l ON wh.lesson_id = l.id 
        JOIN modules m ON l.module_id = m.id
        WHERE wh.user_id = ?
    `;
    const [watchHistory] = await db.query(historyQuery, [studentId]);
    profile.watchHistory = watchHistory;

    res.json({ message: 'Successfully fetched student profile.', data: profile });
});

const updateStudentProfile = asyncHandler(async (req, res) => {
    // Email is not updatable.
    const { name, phoneNumber, avatar } = req.body;
    const studentId = req.user.id;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (phoneNumber !== undefined) updateFields.phone_number = phoneNumber || null;
    
    // Handle avatar upload from base64 string
    if (avatar && avatar.startsWith('data:image')) {
        // 1. Fetch old avatar URL to delete the file if it's a local one
        const [[currentUser]] = await db.query('SELECT avatar_url FROM users WHERE id = ?', [studentId]);
        if (currentUser && currentUser.avatar_url && currentUser.avatar_url.includes('/uploads/avatars/')) {
            try {
                const oldFilename = currentUser.avatar_url.split('/').pop();
                if (oldFilename) {
                    const oldPath = path.join(__dirname, '..', 'uploads', 'avatars', oldFilename);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            } catch (e) {
                console.error("Failed to delete old avatar:", e);
                // Non-fatal error, so we continue
            }
        }
        
        // 2. Decode and save the new image
        const matches = avatar.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid base64 image format.' });
        }
        
        const imageType = matches[1].split('+')[0]; // Handles types like 'svg+xml'
        const base64Data = matches[2];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const filename = `${uuidv4()}.${imageType}`;
        
        const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
        fs.mkdirSync(avatarsDir, { recursive: true }); // Ensure directory exists
        
        const imagePath = path.join(avatarsDir, filename);
        fs.writeFileSync(imagePath, imageBuffer);
        
        // 3. Construct the URL and add to updateFields
        const serverBaseUrl = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
        const imageUrl = `${serverBaseUrl}/uploads/avatars/${filename}`;
        updateFields.avatar_url = imageUrl;
    } else if (avatar === '' || avatar === null) {
        // Handle explicit avatar removal
        updateFields.avatar_url = null;
    }

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update provided.' });
    }

    const setClauses = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateFields), studentId];

    const [result] = await db.query(
        `UPDATE users SET ${setClauses} WHERE id = ?`,
        values
    );

    if (result.affectedRows > 0) {
        const query = `
            SELECT id, name, email, role, avatar_url as avatar,
                   phone_number as phoneNumber, status
            FROM users WHERE id = ?
        `;
        const [[updatedUser]] = await db.query(query, [studentId]);
        res.json({ message: 'Profile updated successfully.', data: updatedUser });
    } else {
        res.status(404).json({ message: 'Student not found.' });
    }
});

const getEnrolledCourses = asyncHandler(async (req, res) => {
    const query = `
        SELECT c.*, cat.name as category, i.name as instructorName 
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE e.user_id = ?
    `;
    const [rows] = await db.query(query, [req.user.id]);
    res.json({ message: 'Successfully fetched enrolled courses.', data: rows });
});

const updateLessonProgress = asyncHandler(async (req, res) => {
    const { lessonId, progress } = req.body;
    const historyId = uuidv4();
    const query = `
        INSERT INTO watch_history (id, user_id, lesson_id, progress_percentage)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage)
    `;
    await db.query(query, [historyId, req.user.id, lessonId, progress]);
    res.json({ message: 'Lesson progress updated successfully.' });
});

const enrollInCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const [existing] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    if (existing.length > 0) {
        return res.status(400).json({ message: 'Already enrolled in this course.' });
    }

    const [courseRows] = await db.query('SELECT price, access_type, access_duration_days FROM courses WHERE id = ?', [courseId]);
    if (courseRows.length === 0) {
        return res.status(404).json({ message: 'Course not found.' });
    }
    const course = courseRows[0];

    let expiryDate = null;
    if (course.access_type === 'expiry' && course.access_duration_days) {
        const now = new Date();
        now.setDate(now.getDate() + course.access_duration_days);
        expiryDate = now;
    }

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();
        const enrollmentId = uuidv4();
        await connection.query('INSERT INTO enrollments (id, user_id, course_id, expiry_date) VALUES (?, ?, ?, ?)', [enrollmentId, studentId, courseId, expiryDate]);
        
        const saleId = uuidv4();
        await connection.query('INSERT INTO sales (id, user_id, course_id, amount, status) VALUES (?, ?, ?, ?, ?)', [saleId, studentId, courseId, course.price, 'Paid']);

        await connection.commit();
        res.status(201).json({ message: 'Successfully enrolled in the course.' });
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
});

const submitCourseReview = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;
    const { rating, comment } = req.body;

    const [enrollment] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    if (enrollment.length === 0) {
        return res.status(403).json({ message: 'You must be enrolled in the course to leave a review.' });
    }

    const reviewId = uuidv4();
    const query = `
        INSERT INTO reviews (id, user_id, course_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), status = 'Pending', review_date = NOW()
    `;
    await db.query(query, [reviewId, studentId, courseId, rating, comment]);
    
    const [[newReview]] = await db.query(
        "SELECT id, course_id as `courseId`, user_id as `userId`, rating, comment, DATE_FORMAT(review_date, '%Y-%m-%d') as date, status FROM reviews WHERE user_id = ? AND course_id = ?",
        [studentId, courseId]
    );

    res.status(201).json({ message: 'Review submitted successfully.', data: newReview });
});

const getMyReviews = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const query = `
        SELECT r.id, r.rating, r.comment, r.status, r.review_date as date, c.id as courseId, c.title as courseTitle
        FROM reviews r
        JOIN courses c ON r.course_id = c.id
        WHERE r.user_id = ?
        ORDER BY r.review_date DESC
    `;
    const [reviews] = await db.query(query, [studentId]);
    res.json({ message: 'Successfully fetched your reviews.', data: reviews });
});

const getMyNotifications = asyncHandler(async (req, res) => {
    const studentRole = req.user.role;

    let targets = ["All Users"];
    if (studentRole === 'Student' || studentRole === 'Gold Member') {
        targets.push('Students');
    }
    if (studentRole === 'Gold Member') {
        targets.push('Gold Members');
    }

    const query = `
        SELECT id, title, message, target, action_type, action_payload,
               DATE_FORMAT(sent_date, '%Y-%m-%d %H:%i') as timestamp
        FROM sent_notifications 
        WHERE target IN (?) ORDER BY sent_date DESC
    `;

    const [notifications] = await db.query(query, [targets]);
    const formatted = notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: n.timestamp,
        read: false, // In a real app, this would be tracked per user
    }));
    res.json({ message: 'Successfully fetched your notifications.', data: formatted });
});

const getEnrolledCourseDetails = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const [enrollment] = await db.query('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    if (enrollment.length === 0) {
        return res.status(403).json({ message: 'You are not enrolled in this course.' });
    }

    const courseQuery = `
        SELECT c.*, cat.name as categoryName, i.name as instructorName
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE c.id = ?
    `;
    const [courseRows] = await db.query(courseQuery, [courseId]);
    if (courseRows.length === 0) return res.status(404).json({ message: "Course not found" });

    const course = courseRows[0];
    course.category = course.categoryName;
    delete course.categoryName;
    delete course.category_id;
    
    const [moduleRows] = await db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
    const [lessonRows] = await db.query(
        `SELECT l.id, l.title, l.description, l.type, l.content_url as "contentUrl", l.duration_minutes as "duration", l.attachment_url as "attachmentUrl", l.module_id 
        FROM lessons l
        WHERE l.module_id IN (SELECT id FROM modules WHERE course_id = ?) 
        ORDER BY l.order_index ASC`, 
        [courseId]
    );

    course.modules = moduleRows.map(module => ({
        id: module.id,
        title: module.title,
        lessons: lessonRows.filter(lesson => lesson.module_id === module.id)
    }));

    const historyQuery = `
        SELECT lesson_id as lessonId, progress_percentage as progress
        FROM watch_history
        WHERE user_id = ? AND lesson_id IN (
            SELECT l.id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = ?
        )
    `;
    const [watchHistory] = await db.query(historyQuery, [studentId, courseId]);
    
    const reviewQuery = `SELECT rating, comment FROM reviews WHERE user_id = ? AND course_id = ?`;
    const [reviewRows] = await db.query(reviewQuery, [studentId, courseId]);

    const responseData = {
        course,
        watchHistory,
        myReview: reviewRows.length > 0 ? reviewRows[0] : null,
    };

    res.json({ message: 'Successfully fetched enrolled course details.', data: responseData });
});

module.exports = { 
    getStudentProfile, 
    updateStudentProfile, 
    getEnrolledCourses, 
    updateLessonProgress,
    enrollInCourse,
    submitCourseReview,
    getMyReviews,
    getMyNotifications,
    getEnrolledCourseDetails,
};