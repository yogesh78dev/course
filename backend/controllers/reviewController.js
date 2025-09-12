// backend/controllers/reviewController.js
const db = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');

const getReviews = asyncHandler(async (req, res) => {
    const [rows] = await db.query("SELECT id, course_id as `courseId`, user_id as `userId`, rating, comment, DATE_FORMAT(review_date, '%Y-%m-%d') as date, status FROM reviews ORDER BY review_date DESC");
    res.json({ message: 'Successfully fetched reviews.', data: rows });
});

const updateReviewStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const [result] = await db.query("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
    
    if (result.affectedRows > 0) {
        const [rows] = await db.query("SELECT id, course_id as `courseId`, user_id as `userId`, rating, comment, DATE_FORMAT(review_date, '%Y-%m-%d') as date, status FROM reviews WHERE id = ?", [id]);
        res.json({ message: `Status of review ${id} updated to ${status}.`, data: rows[0] });
    } else {
        res.status(404).json({ message: 'Review not found' });
    }
});

const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Review not found' });
    }
});

module.exports = { getReviews, updateReviewStatus, deleteReview };
