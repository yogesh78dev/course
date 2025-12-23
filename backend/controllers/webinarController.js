
// backend/controllers/webinarController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

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
    
    await db.query(
        'INSERT INTO webinars (id, title, description, type, schedule_date, duration_minutes, video_url, meeting_url, presenter_id, thumbnail_url, is_free, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [webinarId, title, description, type, scheduleDate, duration, videoUrl, meetingUrl, presenterId, thumbnailUrl, isFree, price]
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

    const [result] = await db.query(
        'UPDATE webinars SET title=?, description=?, type=?, schedule_date=?, duration_minutes=?, video_url=?, meeting_url=?, presenter_id=?, thumbnail_url=?, is_free=?, price=? WHERE id=?',
        [title, description, type, scheduleDate, duration, videoUrl, meetingUrl, presenterId, thumbnailUrl, isFree, price, id]
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