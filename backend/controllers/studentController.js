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
            DATE_FORMAT(expiry_date, '%Y-%m-%d') as 'expiryDate',
            completion_percentage as 'completionPercentage'
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

    // 4. Calculate profile completion
    let completion = 0;
    if (profile.name) completion += 25; // Should always be present
    if (profile.email) completion += 25; // Should always be present
    if (profile.phoneNumber) completion += 25;
    if (profile.avatar) completion += 25;
    profile.profileCompletionPercentage = completion;


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
        const serverBaseUrl = process.env.SERVER_BASE_URL || `https://admin.creatorguru.in`;
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
        SELECT c.*, cat.name as category, i.name as instructorName, e.completion_percentage as completionPercentage
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
    const studentId = req.user.id;

    // 1. Update watch history
    const historyId = uuidv4();
    const query = `
        INSERT INTO watch_history (id, user_id, lesson_id, progress_percentage)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE progress_percentage = VALUES(progress_percentage)
    `;
    await db.query(query, [historyId, studentId, lessonId, progress]);

    // 2. Recalculate course completion percentage
    const [[courseInfo]] = await db.query(
        'SELECT m.course_id FROM lessons l JOIN modules m ON l.module_id = m.id WHERE l.id = ?',
        [lessonId]
    );
    const courseId = courseInfo.course_id;

    const [[{ totalLessons }]] = await db.query(
        'SELECT COUNT(l.id) as totalLessons FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = ?',
        [courseId]
    );

    const [[{ completedLessons }]] = await db.query(
        `SELECT COUNT(DISTINCT wh.lesson_id) as completedLessons FROM watch_history wh
         JOIN lessons l ON wh.lesson_id = l.id
         JOIN modules m ON l.module_id = m.id
         WHERE wh.user_id = ? AND m.course_id = ? AND wh.progress_percentage = 100`,
        [studentId, courseId]
    );
    
    const newCompletionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    await db.query(
        'UPDATE enrollments SET completion_percentage = ? WHERE user_id = ? AND course_id = ?',
        [newCompletionPercentage, studentId, courseId]
    );

    res.json({ 
        message: 'Lesson progress updated successfully.',
        data: { newCompletionPercentage }
    });
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

    const [enrollment] = await db.query('SELECT completion_percentage FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    if (enrollment.length === 0) {
        return res.status(403).json({ message: 'You are not enrolled in this course.' });
    }
    const completionPercentage = enrollment[0].completion_percentage;

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
    course.enableCertificate = !!course.enable_certificate;
    delete course.categoryName;
    delete course.category_id;
    delete course.enable_certificate;
    
    const [moduleRows] = await db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
    const [lessonRows] = await db.query(
        `SELECT l.id, l.title, l.description, l.type, l.content_url as "contentUrl", l.duration_minutes as "duration", l.attachment_url as "attachmentUrl",l.thumbnail_url as "thumbnailUrl", l.module_id 
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

    const certificateQuery = `SELECT id, certificate_code as certificateCode, DATE_FORMAT(issue_date, '%Y-%m-%d') as issueDate FROM certificates WHERE user_id = ? AND course_id = ?`;
    const [certificateRows] = await db.query(certificateQuery, [studentId, courseId]);

    const responseData = {
        course,
        watchHistory,
        myReview: reviewRows.length > 0 ? reviewRows[0] : null,
        completionPercentage,
        myCertificate: certificateRows.length > 0 ? certificateRows[0] : null,
    };

    res.json({ message: 'Successfully fetched enrolled course details.', data: responseData });
});

const claimCertificate = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const [[enrollment]] = await db.query('SELECT completion_percentage FROM enrollments WHERE user_id = ? AND course_id = ?', [studentId, courseId]);
    const [[course]] = await db.query('SELECT enable_certificate FROM courses WHERE id = ?', [courseId]);
    const [existingCert] = await db.query('SELECT id FROM certificates WHERE user_id = ? AND course_id = ?', [studentId, courseId]);

    if (!enrollment || !course) {
        return res.status(404).json({ message: 'Enrollment or course not found.' });
    }
    if (enrollment.completion_percentage < 100) {
        return res.status(400).json({ message: 'Course is not yet completed.' });
    }
    if (!course.enable_certificate) {
        return res.status(400).json({ message: 'This course does not offer a certificate.' });
    }
    if (existingCert.length > 0) {
        return res.status(400).json({ message: 'Certificate has already been claimed.' });
    }

    const certificateId = uuidv4();
    const certificateCode = `CERT-${courseId.substring(0, 4).toUpperCase()}-${studentId.substring(0, 4).toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    await db.query(
        'INSERT INTO certificates (id, user_id, course_id, certificate_code) VALUES (?, ?, ?, ?)',
        [certificateId, studentId, courseId, certificateCode]
    );

    const [[newCertificate]] = await db.query(
        "SELECT id, certificate_code as certificateCode, DATE_FORMAT(issue_date, '%Y-%m-%d') as issueDate FROM certificates WHERE id = ?",
        [certificateId]
    );
    
    res.status(201).json({ message: 'Certificate claimed successfully!', data: newCertificate });
});

const getMyCertificates = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const query = `
        SELECT cer.id, cer.user_id as userId, cer.course_id as courseId, 
               cer.certificate_code as certificateCode, DATE_FORMAT(cer.issue_date, '%Y-%m-%d') as issueDate,
               c.title as courseTitle, i.name as instructorName
        FROM certificates cer
        JOIN courses c ON cer.course_id = c.id
        JOIN instructors i ON c.instructor_id = i.id
        WHERE cer.user_id = ?
        ORDER BY cer.issue_date DESC
    `;
    const [certificates] = await db.query(query, [studentId]);
    res.json({ message: 'Successfully fetched your certificates.', data: certificates });
});

const getDashboardData = asyncHandler(async (req, res) => {
    const studentId = req.user.id;

    const inProgressQuery = `
        SELECT c.id, c.title, c.poster_image_url as posterImageUrl, i.name as instructorName, e.completion_percentage as completionPercentage
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE e.user_id = ? AND e.completion_percentage > 0 AND e.completion_percentage < 100
        ORDER BY e.updated_at DESC
        LIMIT 3
    `;
    const [inProgressCourses] = await db.query(inProgressQuery, [studentId]);

    const recentQuery = `
        SELECT c.id, c.title, c.poster_image_url as posterImageUrl, i.name as instructorName, e.completion_percentage as completionPercentage
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE e.user_id = ?
        ORDER BY e.enrollment_date DESC
        LIMIT 3
    `;
    const [recentCourses] = await db.query(recentQuery, [studentId]);

    const [[stats]] = await db.query(
        `SELECT 
            (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as totalCourses,
            (SELECT COUNT(*) FROM certificates WHERE user_id = ?) as totalCertificates
        `, [studentId, studentId]
    );

    res.json({
        message: 'Successfully fetched dashboard data.',
        data: {
            inProgressCourses,
            recentCourses,
            stats: {
                totalCourses: stats.totalCourses || 0,
                totalCertificates: stats.totalCertificates || 0
            }
        }
    });
});

const getCertificateDetails = asyncHandler(async (req, res) => {
    const studentId = req.user.id;
    const { id: certificateId } = req.params;
    
    const query = `
        SELECT 
            cer.id, cer.certificate_code as certificateCode, DATE_FORMAT(cer.issue_date, '%Y-%m-%d') as issueDate,
            u.name as studentName,
            c.title as courseTitle,
            i.name as instructorName
        FROM certificates cer
        JOIN users u ON cer.user_id = u.id
        JOIN courses c ON cer.course_id = c.id
        JOIN instructors i ON c.instructor_id = i.id
        WHERE cer.id = ? AND cer.user_id = ?
    `;

    const [certificateRows] = await db.query(query, [certificateId, studentId]);

    if (certificateRows.length === 0) {
        return res.status(404).json({ message: 'Certificate not found or you do not have permission to view it.' });
    }

    res.json({ message: 'Successfully fetched certificate details.', data: certificateRows[0] });
});

const registerPushToken = asyncHandler(async (req, res) => {
    const { token, deviceType } = req.body;
    const studentId = req.user.id;

    if (!token || !deviceType) {
        return res.status(400).json({ message: 'Device token and type are required.' });
    }

    if (!['android', 'ios', 'web'].includes(deviceType)) {
        return res.status(400).json({ message: 'Invalid device type.' });
    }

    const tokenId = uuidv4();
    const query = `
        INSERT INTO push_notification_tokens (id, user_id, token, device_type)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE token = VALUES(token), device_type = VALUES(device_type), updated_at = NOW()
    `;

    await db.query(query, [tokenId, studentId, token, deviceType]);
    
    res.status(200).json({ message: 'Push notification token registered successfully.' });
});

module.exports = { 
    getStudentProfile, 
    updateStudentProfile, 
    getEnrolledCourses, 
    updateLessonProgress,
    submitCourseReview,
    getMyReviews,
    getMyNotifications,
    getEnrolledCourseDetails,
    claimCertificate,
    getMyCertificates,
    getDashboardData,
    getCertificateDetails,
    registerPushToken
};
