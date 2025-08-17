const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/profile/:id', userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/leaderboard', userController.getLeaderboard);

module.exports = router;
