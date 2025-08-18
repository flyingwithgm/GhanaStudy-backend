const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getQuestions, 
  getQuestion, 
  createQuestion,
  updateQuestion, 
  deleteQuestion, 
  likeQuestion, 
  createAnswer 
} = require('../controllers/questionController');

router.route('/')
  .get(getQuestions)
  .post(protect, createQuestion);

router.route('/:id')
  .get(getQuestion)
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

router.route('/:id/like')
  .post(protect, likeQuestion);

router.route('/:id/answers')
  .post(protect, createAnswer);

module.exports = router;
