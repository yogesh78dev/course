const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const { saveBase64Image, deleteFileByUrl } = require('../utils/fileUtils');

const getInstructors = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors ORDER BY created_at DESC');
    res.json({ message: 'Successfully fetched instructors.', data: rows });
});

const createInstructor = asyncHandler(async (req, res) => {
    const { name, email, bio, avatar } = req.body;
    const instructorId = uuidv4();
    
    const avatarUrl = avatar ? saveBase64Image(avatar, 'instructors') : `https://picsum.photos/seed/${instructorId}/100`;
    
    await db.query(
        'INSERT INTO instructors (id, name, email, bio, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [instructorId, name, email, bio, avatarUrl]
    );

    const [newRows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors WHERE id = ?', [instructorId]);
    res.status(201).json({ message: 'Instructor created.', data: newRows[0] });
});

const updateInstructor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, bio, avatar } = req.body;
    
    const [[existing]] = await db.query('SELECT avatar_url FROM instructors WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ message: 'Instructor not found' });

    let avatarUrl = existing.avatar_url;
    if (avatar && avatar.startsWith('data:image')) {
        avatarUrl = saveBase64Image(avatar, 'instructors');
        if (existing.avatar_url !== avatarUrl) {
            deleteFileByUrl(existing.avatar_url);
        }
    }

    const [result] = await db.query(
        'UPDATE instructors SET name = ?, email = ?, bio = ?, avatar_url = ? WHERE id = ?',
        [name, email, bio, avatarUrl, id]
    );

    if (result.affectedRows > 0) {
        const [updatedRows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors WHERE id = ?', [id]);
        res.json({ message: `Instructor updated.`, data: updatedRows[0] });
    } else {
        res.status(404).json({ message: 'Instructor not found' });
    }
});

const deleteInstructor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [[existing]] = await db.query('SELECT avatar_url FROM instructors WHERE id = ?', [id]);
    
    const [result] = await db.query('DELETE FROM instructors WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        if (existing) deleteFileByUrl(existing.avatar_url);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Instructor not found' });
    }
});

module.exports = { getInstructors, createInstructor, updateInstructor, deleteInstructor };
