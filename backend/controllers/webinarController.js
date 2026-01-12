
// backend/controllers/webinarController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String, subDir = 'webinars') => {
    if (!base64String || !base64String.startsWith('data:image')) {
        return base64String;
    }

    const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image format.');
    }

    const imageType = matches[1].split('+')[0];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filename = `${uuidv4()}.${imageType}`;

    const uploadDir = path.join(__dirname, '..', 'uploads', subDir);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const imagePath = path.join(uploadDir, filename);
    fs.writeFileSync(imagePath, imageBuffer);

    const serverBaseUrl = process.env.SERVER_BASE_URL || `https://admin.creatorguru.in`;
    return `${serverBaseUrl}/uploads/${subDir}/${filename}`;
};

/**
 * Robustly converts various date formats to MySQL YYYY-MM-DD HH:mm:ss
 */
const formatForMySQL = (dateInput) => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    
    return date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2) + ' ' +
        ('0' + date.getHours()).slice(-2) + ':' +
        ('0' + date.getMinutes()).slice(-2) + ':' +
        ('0' + date.getSeconds()).slice(-2);
};

const getWebinars = asyncHandler(async (req, res) => {
    const query = `
        SELECT w.id, w.title, w.description, w.type, 
               DATE_FORMAT(w.schedule_date, '%Y-%m-%dT%H:%i:%s') as scheduleDate,
               w.duration_minutes as duration, w.video_url as videoUrl, 
               w.meeting_url as meetingUrl, w.presenter_id as presenterId, 
               w.thumbnail_url as thumbnailUrl, w.is_free as isFree,
               w.price,
               i.name as presenterName
        FROM webinars w
        LEFT JOIN instructors i ON w.presenter_id = i.id
        ORDER BY w.schedule_date DESC
    `;
    const [rows] = await db.query(query);
    const data = rows.map(r => ({...r, isFree: !!r.isFree}));
    res.json({ message: 'Successfully fetched webinars.', data: data });
});

const createWebinar = asyncHandler(async (req, res) => {
    const { title, description, type, scheduleDate, duration, videoUrl, meetingUrl, presenterId, thumbnailUrl, isFree, price } = req.body;
    const webinarId = uuidv4();
    
    // Convert to MySQL compatible format
    const formattedDate = formatForMySQL(scheduleDate);
    const processedThumbnail = saveBase64Image(thumbnailUrl, 'webinars');

    await db.query(
        'INSERT INTO webinars (id, title, description, type, schedule_date, duration_minutes, video_url, meeting_url, presenter_id, thumbnail_url, is_free, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [webinarId, title, description, type, formattedDate, duration, videoUrl, meetingUrl, presenterId, processedThumbnail, isFree, price]
    );

    const [newRows] = await db.query(`
        SELECT w.id, w.title, w.description, w.type, 
               DATE_FORMAT(w.schedule_date, '%Y-%m-%dT%H:%i:%s') as scheduleDate,
               w.duration_minutes as duration, w.video_url as videoUrl, 
               w.meeting_url as meetingUrl, w.presenter_id as presenterId, 
               w.thumbnail_url as thumbnailUrl, w.is_free as isFree,
               w.price, i.name as presenterName
        FROM webinars w
        LEFT JOIN instructors i ON w.presenter_id = i.id
        WHERE w.id = ?
    `, [webinarId]);

    const webinar = { ...newRows[0], isFree: !!newRows[0].isFree };
    res.status(201).json({ message: 'Webinar created successfully.', data: webinar });
});

const updateWebinar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, type, scheduleDate, duration, videoUrl, meetingUrl, presenterId, thumbnailUrl, isFree, price } = req.body;

    const formattedDate = formatForMySQL(scheduleDate);
    const processedThumbnail = saveBase64Image(thumbnailUrl, 'webinars');

    const [result] = await db.query(
        'UPDATE webinars SET title=?, description=?, type=?, schedule_date=?, duration_minutes=?, video_url=?, meeting_url=?, presenter_id=?, thumbnail_url=?, is_free=?, price=? WHERE id=?',
        [title, description, type, formattedDate, duration, videoUrl, meetingUrl, presenterId, processedThumbnail, isFree, price, id]
    );

    if (result.affectedRows > 0) {
        const [updatedRows] = await db.query(`
            SELECT w.id, w.title, w.description, w.type, 
                   DATE_FORMAT(w.schedule_date, '%Y-%m-%dT%H:%i:%s') as scheduleDate,
                   w.duration_minutes as duration, w.video_url as videoUrl, 
                   w.meeting_url as meetingUrl, w.presenter_id as presenterId, 
                   w.thumbnail_url as thumbnailUrl, w.is_free as isFree,
                   w.price, i.name as presenterName
            FROM webinars w
            LEFT JOIN instructors i ON w.presenter_id = i.id
            WHERE w.id = ?
        `, [id]);
        
        const webinar = { ...updatedRows[0], isFree: !!updatedRows[0].isFree };
        res.json({ message: `Webinar ${id} updated successfully.`, data: webinar });
    } else {
        res.status(404).json({ message: 'Webinar not found' });
    }
});

const deleteWebinar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM webinars WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Webinar not found' });
    }
});

module.exports = { getWebinars, createWebinar, updateWebinar, deleteWebinar };
