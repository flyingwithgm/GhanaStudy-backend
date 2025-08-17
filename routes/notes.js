const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const noteController = require('../controllers/noteController');

router.route('/')
  .get(protect, noteController.getNotes)
  .post(protect, noteController.createNote);

router.route('/:id')
  .put(protect, noteController.updateNote)
  .delete(protect, noteController.deleteNote);

module.exports = router;
