
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const { saveBase64Image, deleteFileByUrl } = require('../utils/fileUtils');

const mapCourseFromDb = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        price: parseFloat(row.price),
        duration: row.duration,
        posterImageUrl: row.poster_image_url,
        bannerImageUrl: row.banner_image_url,
        introVideoUrl: row.intro_video_url,
        accessType: row.access_type,
        accessDuration: row.access_duration_days,
        enableCertificate: !!row.enable_certificate,
        instructorId: row.instructor_id,
        instructorName: row.instructorName,
        category: row.categoryName || row.category,
        createdAt: row.created_at
    };
};

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

    const course = mapCourseFromDb(courseRows[0]);
    
    const [moduleRows] = await db.query('SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC', [courseId]);
    const [lessonRows] = await db.query(`
        SELECT l.* FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = ? 
        ORDER BY m.order_index ASC, l.order_index ASC
    `, [courseId]);

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
                tags: [], 
                attachmentUrl: l.attachment_url,
                thumbnailUrl: l.thumbnail_url
            }))
    }));
    
    return course;
};

const getCourses = asyncHandler(async (req, res) => {
    const query = `
        SELECT c.*, cat.name as categoryName, i.name as instructorName
        FROM courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        ORDER BY c.created_at DESC
    `;
    const [rows] = await db.query(query);
    const data = rows.map(mapCourseFromDb);
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

const createOrUpdateCourseWithCurriculum = async (courseData, existingId = null) => {
    const { 
        title, description, price, category, duration, instructorId, 
        posterImageUrl, bannerImageUrl, introVideoUrl, 
        accessType = 'lifetime', accessDuration = null, enableCertificate = false, modules = [] 
    } = courseData;
    
    const isUpdate = !!existingId;
    const courseId = isUpdate ? existingId : uuidv4();
    
    let oldPoster = null;
    let oldBanner = null;

    if (isUpdate) {
        const [[curr]] = await db.query('SELECT poster_image_url, banner_image_url FROM courses WHERE id = ?', [courseId]);
        oldPoster = curr && curr.poster_image_url ? curr.poster_image_url : null;
        oldBanner = curr && curr.banner_image_url ? curr.banner_image_url : null;
    }

    const processedPosterUrl = saveBase64Image(posterImageUrl, 'courses/posters');
    const processedBannerUrl = saveBase64Image(bannerImageUrl, 'courses/banners');

    const [categoryRows] = await db.query('SELECT id FROM categories WHERE name = ?', [category]);
    const categoryId = categoryRows.length > 0 ? categoryRows[0].id : null;

    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        if (isUpdate) {
            // Delete old lesson thumbnails and attachments if they are being replaced
            // For simplicity in this logic, we recreate the curriculum
            await connection.query(`DELETE FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)`, [courseId]);
            await connection.query(`DELETE FROM modules WHERE course_id = ?`, [courseId]);
            
            await connection.query(
                'UPDATE courses SET title=?, description=?, price=?, category_id=?, duration=?, instructor_id=?, poster_image_url=?, banner_image_url=?, intro_video_url=?, access_type=?, access_duration_days=?, enable_certificate=? WHERE id=?',
                [title, description, price, categoryId, duration, instructorId, processedPosterUrl, processedBannerUrl, introVideoUrl, accessType, accessDuration, enableCertificate, courseId]
            );

            // Cleanup old main images if they changed
            if (oldPoster && oldPoster !== processedPosterUrl) deleteFileByUrl(oldPoster);
            if (oldBanner && oldBanner !== processedBannerUrl) deleteFileByUrl(oldBanner);
        } else {
            await connection.query(
                'INSERT INTO courses (id, title, description, price, category_id, duration, instructor_id, poster_image_url, banner_image_url, intro_video_url, access_type, access_duration_days, enable_certificate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [courseId, title, description, price, categoryId, duration, instructorId, processedPosterUrl, processedBannerUrl, introVideoUrl, accessType, accessDuration, enableCertificate]
            );
        }

        for (const [moduleIndex, module] of modules.entries()) {
            const moduleId = module.id.startsWith('mod-') ? uuidv4() : module.id; 
            await connection.query('INSERT INTO modules (id, title, course_id, order_index) VALUES (?, ?, ?, ?)', [moduleId, module.title, courseId, moduleIndex]);
            
            if (module.lessons && Array.isArray(module.lessons)) {
                for (const [lessonIndex, lesson] of module.lessons.entries()) {
                    const lessonId = lesson.id.startsWith('les-') ? uuidv4() : lesson.id; 
                    const processedLessonThumb = saveBase64Image(lesson.thumbnailUrl, 'courses/lessons');

                    await connection.query(
                        'INSERT INTO lessons (id, title, description, type, content_url, duration_minutes, attachment_url, thumbnail_url, module_id, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        [lessonId, lesson.title, lesson.description, lesson.type, lesson.contentUrl, lesson.duration, lesson.attachmentUrl, processedLessonThumb, moduleId, lessonIndex]
                    );
                }
            }
        }

        await connection.commit();
        return await getFullCourse(courseId);
    } catch (error) {
        await connection.rollback();
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
    const updatedCourse = await createOrUpdateCourseWithCurriculum(req.body, req.params.id);
    res.json({ message: `Course updated successfully.`, data: updatedCourse });
});

const deleteCourse = asyncHandler(async (req, res) => {
    const courseId = req.params.id;
    const [[course]] = await db.query('SELECT poster_image_url, banner_image_url FROM courses WHERE id = ?', [courseId]);
    
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Cleanup curriculum image files first
    const [lessons] = await db.query('SELECT thumbnail_url FROM lessons WHERE module_id IN (SELECT id FROM modules WHERE course_id = ?)', [courseId]);
    lessons.forEach(l => deleteFileByUrl(l.thumbnail_url));

    const [result] = await db.query('DELETE FROM courses WHERE id = ?', [courseId]);
    
    if (result.affectedRows > 0) {
        deleteFileByUrl(course.poster_image_url);
        deleteFileByUrl(course.banner_image_url);
        res.status(204).send();
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
    getPublicCourses: getCourses, // Reusing same logic for demo
    getPublicCourseById: getCourseById
};
