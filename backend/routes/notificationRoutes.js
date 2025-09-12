// backend/routes/notificationRoutes.js
const express = require('express');
const { sendNotification, getTemplates, createTemplate, getHistory, updateTemplate, deleteTemplate } = require('../controllers/notificationController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, admin);

router.post('/send', sendNotification);
router.get('/history', getHistory);

router.route('/templates')
    .get(getTemplates)
    .post(createTemplate);

router.route('/templates/:id')
    .put(updateTemplate)
    .delete(deleteTemplate);

module.exports = router;
