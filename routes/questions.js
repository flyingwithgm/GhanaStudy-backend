const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const questionController = require('../controllers/questionController');

router.route('/')
  .get(questionController.getQuestions)
  .post(protect, questionController.createQuestion);

router.route('/:id')
  .get(questionController.getQuestion)
  .put(protect, questionController.updateQuestion)
  .delete(protect, questionController.deleteQuestion);

router.route('/:id/like')
  .post(protect, questionController.likeQuestion);

router.route('/:id/answers')
  .post(protect, questionController.createAnswer);

module.exports = router;
