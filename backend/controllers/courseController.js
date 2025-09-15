// backend/controllers/courseController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

const getFullCourse = async (courseId) => {
    const courseQuery = `
        SELECT c.*, cat.name as categoryName, i.name as instructorName
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        WHERE c.id = ?
    `;
    const [courseRows] = await db.query(courseQuery, [courseId]);
    if (courseRows.length === 0) return null;

    const course = courseRows[0];
    course.category = course.categoryName;
    course.instructorName = course.instructorName;
    course.enableCertificate = !!course.enable_certificate; // Convert to boolean
    
    // Align with frontend type
    delete course.categoryName;
    delete course.category_id;
    delete course.enable_certificate;
    
    const [moduleRows] = await db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
    
    const lessonQuery = `
        SELECT l.*, m.course_id 
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = ? 
        ORDER BY m.order_index ASC, l.order_index ASC
    `;
    const [lessonRows] = await db.query(lessonQuery, [courseId]);

    course.modules = moduleRows.map(module => ({
        id: module.id,
        title: module.title,
        lessons: lessonRows
            .filter(lesson => lesson.module_id === module.id)
            .map(l => ({
                id: l.id,
                title: l.title,
                description: l.description,
                type: l.type,
                contentUrl: l.content_url,
                duration: l.duration_minutes,
                tags: [], // Tags not stored in DB currently, default to empty
                attachmentUrl: l.attachment_url,
            }))
    }));
    
    return course;
};

const getCourses = asyncHandler(async (req, res) => {
    const query = `
        SELECT c.id, c.title, c.price, c.duration, c.instructor_id as "instructorId", 
               c.poster_image_url as "posterImageUrl", c.enable_certificate as "enableCertificate",
               cat.name as category,
               i.name as instructorName
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(query);
    const data = rows.map(r => ({...r, enableCertificate: !!r.enableCertificate}));
    res.json({ message: 'Successfully fetched all courses.', data: data });
});

const getCourseById = asyncHandler(async (req, res) => {
    const course = await getFullCourse(req.params.id);
    if (course) {
        res.json({ message: 'Successfully fetched course.', data: course });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

const createOrUpdateCourseWithCurriculum = async (courseData, courseId = null) => {
    const { title, description, price, category, duration, instructorId, posterImageUrl, bannerImageUrl, introVideoUrl, accessType, accessDuration, enableCertificate, modules = [] } = courseData;
    const isUpdate = !!courseId;
    const newCourseId = isUpdate ? courseId : uuidv4();
    
    const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
    const categoryId = categoryRows.length > 0 ? categoryRows[0].id : null;

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        if (isUpdate) {
            await connection.query(`DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)`, [newCourseId]);
            await connection.query(`DELETE FROM modules WHERE course_id = ?`, [newCourseId]);
            await connection.query(
                'UPDATE courses SET title=?, description=?, price=?, category_id=?, duration=?, instructor_id=?, poster_image_url=?, banner_image_url=?, intro_video_url=?, access_type=?, access_duration_days=?, enable_certificate=? WHERE id=?',
                [title, description, price, categoryId, duration, instructorId, posterImageUrl, bannerImageUrl, introVideoUrl, accessType, accessDuration, enableCertificate, newCourseId]
            );
        } else {
            await connection.query(
                'INSERT INTO courses (id, title, description, price, category_id, duration, instructor_id, poster_image_url, banner_image_url, intro_video_url, access_type, access_duration_days, enable_certificate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [newCourseId, title, description, price, categoryId, duration, instructorId, posterImageUrl, bannerImageUrl, introVideoUrl, accessType, accessDuration, enableCertificate]
            );
        }

        for (const [moduleIndex, module] of modules.entries()) {
            const moduleId = module.id.startsWith('mod-') ? uuidv4() : module.id; // Use new UUID for new modules
            await connection.query('INSERT INTO modules (id, title, course_id, order_index) VALUES (?, ?, ?, ?)', [moduleId, module.title, newCourseId, moduleIndex]);
            if (module.lessons) {
                for (const [lessonIndex, lesson] of module.lessons.entries()) {
                    const lessonId = lesson.id.startsWith('les-') ? uuidv4() : lesson.id; // Use new UUID for new lessons
                    await connection.query(
                        'INSERT INTO lessons (id, title, description, type, content_url, duration_minutes, attachment_url, module_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [lessonId, lesson.title, lesson.description, lesson.type, lesson.contentUrl, lesson.duration, lesson.attachmentUrl, moduleId, lessonIndex]
                    );
                }
            }
        }

        await connection.commit();
        const fullCourse = await getFullCourse(newCourseId);
        return fullCourse;
    } catch (error) {
        await connection.rollback();
        console.error('Course transaction failed:', error);
        throw error;
    } finally {
        connection.release();
    }
};

const createCourse = asyncHandler(async (req, res) => {
    const newCourse = await createOrUpdateCourseWithCurriculum(req.body);
    res.status(201).json({ message: 'Course created successfully.', data: newCourse });
});

const updateCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM courses WHERE id = ?', [id]);
    if (existing.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
    }
    const updatedCourse = await createOrUpdateCourseWithCurriculum(req.body, id);
    res.json({ message: `Course ${id} updated successfully.`, data: updatedCourse });
});

const deleteCourse = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

// --- Public Controllers ---

const getPublicCourses = asyncHandler(async (req, res) => {
    const query = `
        SELECT c.id, c.title, c.price, c.duration, c.poster_image_url as "posterImageUrl",
               c.enable_certificate as "enableCertificate",
               cat.name as category, i.name as instructorName
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(query);
    const data = rows.map(r => ({...r, enableCertificate: !!r.enableCertificate}));
    res.json({ message: 'Successfully fetched all public courses.', data: data });
});

const getPublicCourseById = asyncHandler(async (req, res) => {
    const course = await getFullCourse(req.params.id);
    if (course) {
        res.json({ message: 'Successfully fetched public course.', data: course });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

module.exports = { 
    getCourses, 
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse,
    getPublicCourses,
    getPublicCourseById
};