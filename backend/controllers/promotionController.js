    // backend/controllers/promotionController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

// @desc    Get the single active promotion
// @route   GET /api/promotions/public/active
// @access  Public
const getActivePromotion = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT id, title, description, image_url as imageUrl, action_type as actionType, action_payload as actionPayload FROM promotions WHERE is_active = TRUE LIMIT 1');
    const promotion = rows.length > 0 ? rows[0] : null;
    res.json({ message: 'Successfully fetched active promotion.', data: promotion });
});

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Admin
const getPromotions = asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT id, title, is_active FROM promotions ORDER BY created_at DESC');
    res.json({ message: 'Successfully fetched all promotions.', data: rows });
});

// @desc    Create or update a promotion
// @route   POST /api/promotions
// @access  Admin
const createOrUpdatePromotion = asyncHandler(async (req, res) => {
    const { id, title, description, imageUrl, isActive, actionType, actionPayload } = req.body;
    
    const connection = await db.pool.getConnection();
    try {
        await connection.beginTransaction();

        // If setting this one to active, deactivate all others
        if (isActive) {
            const query = id ? 'UPDATE promotions SET is_active = FALSE WHERE id != ?' : 'UPDATE promotions SET is_active = FALSE';
            await connection.query(query, id ? [id] : []);
        }

        let promotionId = id || uuidv4();
        
        if (id) { // Update
            await connection.query(
                'UPDATE promotions SET title = ?, description = ?, image_url = ?, is_active = ?, action_type = ?, action_payload = ? WHERE id = ?',
                [title, description, imageUrl, isActive, actionType, actionPayload, id]
            );
        } else { // Create
            await connection.query(
                'INSERT INTO promotions (id, title, description, image_url, is_active, action_type, action_payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [promotionId, title, description, imageUrl, isActive, actionType, actionPayload]
            );
        }

        await connection.commit();

        const [[newPromotion]] = await db.query('SELECT * FROM promotions WHERE id = ?', [promotionId]);
        res.status(id ? 200 : 201).json({ message: `Promotion ${id ? 'updated' : 'created'}.`, data: newPromotion });

    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
});

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Admin
const deletePromotion = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM promotions WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Promotion not found' });
    }
});


module.exports = { getActivePromotion, getPromotions, createOrUpdatePromotion, deletePromotion };