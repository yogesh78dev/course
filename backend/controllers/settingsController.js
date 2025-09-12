// backend/controllers/settingsController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');


const getCategories = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ message: 'Successfully fetched categories.', data: rows });
});

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const [existing] = await db.query('SELECT id FROM categories WHERE lower(name) = lower(?)', [name]);
    if (existing.length > 0) {
        return res.status(400).json({ message: 'Category already exists.' });
    }
    
    const categoryId = uuidv4();
    await db.query(
        'INSERT INTO categories (id, name) VALUES (?, ?)',
        [categoryId, name]
    );

    const [[newCategory]] = await db.query('SELECT * FROM categories WHERE id = ?', [categoryId]);
    res.status(201).json({ message: 'Category created.', data: newCategory });
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    const [result] = await db.query(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, id]
    );

    if (result.affectedRows > 0) {
        const [[updatedCategory]] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
        res.json({ message: `Category ${id} updated.`, data: updatedCategory });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Note: In a real app, you might want to prevent deletion if courses are using this category.
    const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
