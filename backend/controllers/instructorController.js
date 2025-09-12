// backend/controllers/instructorController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');


const getInstructors = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors ORDER BY created_at DESC');
    res.json({ message: 'Successfully fetched instructors.', data: rows });
});

const createInstructor = asyncHandler(async (req, res) => {
    const { name, email, bio } = req.body;
    const avatar = `https://picsum.photos/seed/${Date.now()}/100`;
    const instructorId = uuidv4();
    await db.query(
        'INSERT INTO instructors (id, name, email, bio, avatar_url) VALUES (?, ?, ?, ?, ?)',
        [instructorId, name, email, bio, avatar]
    );

    const [newRows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors WHERE id = ?', [instructorId]);
    res.status(201).json({ message: 'Instructor created.', data: newRows[0] });
});

const updateInstructor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, bio } = req.body;
    const [result] = await db.query(
        'UPDATE instructors SET name = ?, email = ?, bio = ? WHERE id = ?',
        [name, email, bio, id]
    );
    if (result.affectedRows > 0) {
        const [updatedRows] = await db.query('SELECT id, name, email, bio, avatar_url as avatar FROM instructors WHERE id = ?', [id]);
        res.json({ message: `Instructor ${id} updated.`, data: updatedRows[0] });
    } else {
        res.status(404).json({ message: 'Instructor not found' });
    }
});

const deleteInstructor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM instructors WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Instructor not found' });
    }
});

module.exports = { getInstructors, createInstructor, updateInstructor, deleteInstructor };
