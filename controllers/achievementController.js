const Achievement = require('../models/Achievement');
const User = require('../models/User');

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      count: achievements.length,
       achievements
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const unlockAchievement = async (req, res) => {
  const { title, description, icon } = req.body;
  try {
    const achievement = await Achievement.create({
      user: req.user._id,
      title,
      description,
      icon
    });
    
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 100 } });
    
    res.status(201).json({
      success: true,
       achievement
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getAchievements, unlockAchievement };
