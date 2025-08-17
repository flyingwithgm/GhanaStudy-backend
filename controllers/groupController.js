const StudyGroup = require('../models/StudyGroup');
const GroupMessage = require('../models/GroupMessage');

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
    
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Group not found' 
      });
    }
    
    let query = { group: groupId };
    if (before) {
      query.timestamp = { $lt: new Date(before) };
    }
    
    const messages = await GroupMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name avatar');
    
    res.status(200).json({
      success: true,
      count: messages.length,
       messages.reverse()
    });
  } catch (error) {
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
    
    const message = await GroupMessage.create({
      group: groupId,
      user: req.user._id,
      userName: req.user.name,
      content: content.trim()
    });
    
    await message.populate('user', 'name avatar');
    
    res.status(201).json({
      success: true,
       message
    });
  } catch (error) {
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
