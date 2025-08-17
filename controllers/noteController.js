const Note = require('../models/Note');

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      count: notes.length,
       notes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const createNote = async (req, res) => {
  const { subject, title, content } = req.body;
  try {
    const note = await Note.create({ user: req.user._id, subject, title, content });
    res.status(201).json({
      success: true,
       note
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }
    res.status(200).json({
      success: true,
       note
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Note not found' 
      });
    }
    res.status(200).json({ 
      success: true,
      message: 'Note removed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
