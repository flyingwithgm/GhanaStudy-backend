const Question = require('../models/Question');
const Answer = require('../models/Answer');
const { logger } = require('../utils/logger');

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('user', 'name avatar')
      .populate('answers')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    logger.error('Get questions error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate({ path: 'answers', populate: { path: 'user', select: 'name avatar' } });
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    logger.error('Get question error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createQuestion = async (req, res) => {
  const { subject, content } = req.body;
  try {
    const question = await Question.create({ user: req.user._id, subject, content });
    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    logger.error('Create question error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authorized' 
      });
    }
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      success: true,
      data: updatedQuestion
    });
  } catch (error) {
    logger.error('Update question error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authorized' 
      });
    }
    await question.remove();
    res.status(200).json({ 
      success: true,
      message: 'Question removed' 
    });
  } catch (error) {
    logger.error('Delete question error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const likeQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    
    if (question.likes.includes(req.user._id)) {
      question.likes = question.likes.filter(like => like.toString() !== req.user._id.toString());
    } else {
      question.likes.push(req.user._id);
    }
    
    await question.save();
    res.status(200).json({
      success: true,
      data: {
        likes: question.likes.length,
        isLiked: question.likes.includes(req.user._id)
      }
    });
  } catch (error) {
    logger.error('Like question error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createAnswer = async (req, res) => {
  const { content } = req.body;
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ 
        success: false,
        message: 'Question not found' 
      });
    }
    
    const answer = await Answer.create({
      question: req.params.id,
      user: req.user._id,
      content
    });
    
    question.answers.push(answer._id);
    await question.save();
    res.status(201).json({
      success: true,
      data: answer
    });
  } catch (error) {
    logger.error('Create answer error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getQuestions, 
  getQuestion, 
  createQuestion,
  updateQuestion, 
  deleteQuestion, 
  likeQuestion, 
  createAnswer
};
