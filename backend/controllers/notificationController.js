// backend/controllers/notificationController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

const formatNotification = (row) => ({
    ...row,
    action: { type: row.action_type, payload: row.action_payload },
    channels: typeof row.channels === 'string' ? JSON.parse(row.channels) : row.channels,
});

const sendNotification = asyncHandler(async (req, res) => {
    const { title, message, target, action, channels } = req.body;
    const notificationId = uuidv4();
    await db.query(
        'INSERT INTO sent_notifications (id, title, message, target, action_type, action_payload, channels) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [notificationId, title, message, target, action.type, action.payload, JSON.stringify(channels)]
    );

    const [[newSentNotification]] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications WHERE id = ?", [notificationId]);
    res.status(200).json({ message: 'Notification sent.', data: formatNotification(newSentNotification) });
});

const getHistory = asyncHandler(async (req, res) => {
    const [rows] = await db.query("SELECT *, DATE_FORMAT(sent_date, '%Y-%m-%d') as `sentDate` FROM sent_notifications ORDER BY sent_date DESC");
    const formattedRows = rows.map(formatNotification);
    res.json({ message: 'Successfully fetched notification history.', data: formattedRows });
});

const getTemplates = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM notification_templates ORDER BY created_at DESC');
    const formattedRows = rows.map(formatNotification);
    res.json({ message: 'Successfully fetched notification templates.', data: formattedRows });
});

const createTemplate = asyncHandler(async (req, res) => {
    const { name, title, message, target, action } = req.body;
    const templateId = uuidv4();
    await db.query(
        'INSERT INTO notification_templates (id, name, title, message, target, action_type, action_payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [templateId, name, title, message, target, action.type, action.payload]
    );

    const [[newTemplate]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [templateId]);
    res.status(201).json({ message: 'Template created.', data: formatNotification(newTemplate) });
});

const updateTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, title, message, target, action } = req.body;
    const [result] = await db.query(
        'UPDATE notification_templates SET name = ?, title = ?, message = ?, target = ?, action_type = ?, action_payload = ? WHERE id = ?',
        [name, title, message, target, action.type, action.payload, id]
    );

    if (result.affectedRows > 0) {
        const [[updatedTemplate]] = await db.query('SELECT * FROM notification_templates WHERE id = ?', [id]);
        res.json({ message: `Template ${id} updated.`, data: formatNotification(updatedTemplate) });
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
});

const deleteTemplate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM notification_templates WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Template not found' });
    }
});

module.exports = { sendNotification, getHistory, getTemplates, createTemplate, updateTemplate, deleteTemplate };
