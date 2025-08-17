const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getPapers, 
  uploadPaper, 
  downloadPaper, 
  deletePaper 
} = require('../controllers/paperController');

router.get('/', getPapers);
router.post('/upload', protect, uploadPaper);
router.post('/:id/download', protect, downloadPaper);
router.delete('/:id', protect, deletePaper);

module.exports = router;
