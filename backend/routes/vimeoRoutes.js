
const express = require('express');
const router = express.Router();
const vimeoController = require('../controllers/vimeoController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.use(protect, admin);

router.get('/accounts', vimeoController.getVimeoAccounts);
router.post('/accounts', vimeoController.addVimeoAccount);
router.delete('/accounts/:id', vimeoController.removeVimeoAccount);
router.get('/videos', vimeoController.getVimeoVideos);
router.post('/sync', vimeoController.syncVimeoVideos);

module.exports = router;
