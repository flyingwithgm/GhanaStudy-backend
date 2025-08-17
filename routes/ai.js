const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { solveQuestion, testGeminiAPI } = require('../controllers/aiController');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/solve', protect, aiLimiter, solveQuestion);
router.get('/test', testGeminiAPI);

module.exports = router;
