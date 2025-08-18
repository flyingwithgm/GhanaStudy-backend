const Progress = require('../models/Progress');
const User = require('../models/User');

const getProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: progress.length,
       progress
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const updateStreak = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user._id, subject: 'overall' });
    
    if (!progress) {
      progress = new Progress({ user: req.user._id, subject: 'overall' });
    }
    
    const today = new Date().toDateString();
    const lastDate = progress.lastStreakDate ? progress.lastStreakDate.toDateString() : '';
    
    if (today !== lastDate) {
      if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
        progress.streakDays += 1;
      } else {
        progress.streakDays = 1;
      }
      progress.lastStreakDate = new Date();
      
      await User.findByIdAndUpdate(req.user._id, { streak: progress.streakDays });
    }
    
    await progress.save();
    res.status(200).json({
      success: true,
       progress
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getProgress, updateStreak };
