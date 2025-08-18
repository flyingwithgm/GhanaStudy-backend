const StudyGroup = require('../models/StudyGroup');
const GroupMessage = require('../models/GroupMessage');
const { logger } = require('../utils/logger');

const getGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate('createdBy', 'name')
      .populate('members.user', 'name');
    res.status(200).json({
      success: true,
      count: groups.length,
       groups
    });
  } catch (error) {
    logger.error('Get groups error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createGroup = async (req, res) => {
  const { name, description, privacy } = req.body;
  try {
    const group = await StudyGroup.create({
      name, description, privacy,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });
    res.status(201).json({
      success: true,
       group
    });
  } catch (error) {
    logger.error('Create group error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('members.user', 'name');
    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }
    res.status(200).json({
      success: true,
       group
    });
  } catch (error) {
    logger.error('Get group error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }
    
    const isMember = group.members.find(member => member.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ 
        success: false,
        message: 'Already a member' 
      });
    }
    
    group.members.push({ user: req.user._id, role: 'member' });
    await group.save();
    res.status(200).json({
      success: true,
       group
    });
  } catch (error) {
    logger.error('Join group error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before } = req.query;
    
    // Check if user is member of the group
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }
    
    const isMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember && group.privacy === 'private') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to private group' 
      });
    }
    
    // Build query
    let query = { group: groupId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }
    
    // Get messages
    const messages = await GroupMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name avatar');
    
    // Reverse messages to show in chronological order
    const reversedMessages = messages ? messages.reverse() : [];
    
    res.status(200).json({
      success: true,
      count: reversedMessages.length,
       reversedMessages
    });
  } catch (error) {
    logger.error('Get group messages error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Message content is required' 
      });
    }
    
    // Check if user is member of the group
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }
    
    const isMember = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        success: false,
        message: 'You must be a member to send messages' 
      });
    }
    
    // Create message
    const message = await GroupMessage.create({
      group: groupId,
      user: req.user._id,
      userName: req.user.name,
      content: content.trim()
    });
    
    // Populate user info
    await message.populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
       message
    });
  } catch (error) {
    logger.error('Send group message error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { 
  getGroups, 
  createGroup, 
  getGroup, 
  joinGroup,
  getGroupMessages,  
  sendGroupMessage
};
