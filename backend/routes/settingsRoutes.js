// backend/routes/settingsRoutes.js
const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.route('/categories')
    .get(getCategories)
    .post(createCategory);

router.route('/categories/:id')
    .put(updateCategory)
    .delete(deleteCategory);

module.exports = router;
