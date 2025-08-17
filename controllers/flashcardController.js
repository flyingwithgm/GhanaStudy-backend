const Flashcard = require('../models/Flashcard');

const getFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: flashcards.length,
       flashcards
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createFlashcard = async (req, res) => {
  const { subject, front, back } = req.body;
  try {
    const flashcard = await Flashcard.create({ user: req.user._id, subject, front, back });
    res.status(201).json({
      success: true,
       flashcard
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!flashcard) {
      return res.status(404).json({ 
        success: false,
        message: 'Flashcard not found' 
      });
    }
    res.status(200).json({
      success: true,
       flashcard
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!flashcard) {
      return res.status(404).json({ 
        success: false,
        message: 'Flashcard not found' 
      });
    }
    res.status(200).json({ 
      success: true,
      message: 'Flashcard removed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getFlashcards, createFlashcard, updateFlashcard, deleteFlashcard };
