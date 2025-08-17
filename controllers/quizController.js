const Quiz = require('../models/Quiz');

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      count: quizzes.length,
       quizzes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createQuiz = async (req, res) => {
  const { title, subject, questions } = req.body;
  try {
    const quiz = await Quiz.create({ title, subject, questions, createdBy: req.user._id });
    res.status(201).json({
      success: true,
       quiz
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: 'Quiz not found' 
      });
    }
    res.status(200).json({
      success: true,
       quiz
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getQuizzes, createQuiz, getQuiz };
