const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { solveMathProblem, testWolframAPI } = require('../controllers/wolframController');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/solve', protect, aiLimiter, solveMathProblem);
router.get('/test', testWolframAPI);

module.exports = router;
