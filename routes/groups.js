const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { 
  getGroups, 
  createGroup, 
  getGroup, 
  joinGroup,
  getGroupMessages,  
  sendGroupMessage
} = require('../controllers/groupController');

router.route('/')
  .get(getGroups)
  .post(protect, createGroup);

router.route('/:id')
  .get(getGroup);

router.route('/:id/join')
  .post(protect, joinGroup);

// Add message routes
router.route('/:id/messages')
  .get(protect, getGroupMessages)
  .post(protect, sendGroupMessage);

module.exports = router;
