const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const { 
  getPapers, 
  getPaper, 
  uploadPaper, 
  downloadPaper, 
  deletePaper,
  searchPapers
} = require('../controllers/paperController');

router.route('/')
  .get(getPapers)
  .post(protect, uploadSingle, uploadPaper);

router.route('/search')
  .get(searchPapers);

router.route('/:id')
  .get(getPaper)
  .delete(protect, deletePaper);

router.route('/:id/download')
  .post(protect, downloadPaper);

module.exports = router;
