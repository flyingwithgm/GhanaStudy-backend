const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const progressController = require('../controllers/progressController');

router.get('/', protect, progressController.getProgress);
router.post('/streak', protect, progressController.updateStreak);

module.exports = router;
