const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

router.route('/')
  .get(quizController.getQuizzes)
  .post(protect, quizController.createQuiz);

router.route('/:id')
  .get(quizController.getQuiz);

module.exports = router;
