const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const flashcardController = require('../controllers/flashcardController');

router.route('/')
  .get(protect, flashcardController.getFlashcards)
  .post(protect, flashcardController.createFlashcard);

router.route('/:id')
  .put(protect, flashcardController.updateFlashcard)
  .delete(protect, flashcardController.deleteFlashcard);

module.exports = router;
