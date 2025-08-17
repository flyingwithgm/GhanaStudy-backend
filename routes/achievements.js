const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

router.get('/', protect, achievementController.getAchievements);
router.post('/unlock', protect, achievementController.unlockAchievement);

module.exports = router;
