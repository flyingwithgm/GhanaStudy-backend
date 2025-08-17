const { logger } = require('../utils/logger');
const User = require('../models/User');
const Question = require('../models/Question');
const StudyGroup = require('../models/StudyGroup');

const trackUserActivity = async (userId, activityType, metadata = {}) => {
  try {
    logger.info('📊 User Activity Tracked', {
      userId,
      activityType,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    await User.findByIdAndUpdate(userId, {
      $set: { lastActive: new Date() }
    });
    
    return { success: true };
  } catch (error) {
    logger.error('❌ Failed to track user activity:', error);
    return { success: false, error: error.message };
  }
};

const getUserAnalytics = async (userId) => {
  try {
    const [questions, answers, groups] = await Promise.all([
      Question.countDocuments({ user: userId }),
      Question.countDocuments({ 'answers.user': userId }),
      StudyGroup.countDocuments({ 'members.user': userId })
    ]);
    
    return {
      questionsAsked: questions,
      answersGiven: answers,
      groupsJoined: groups
    };
  } catch (error) {
    logger.error('❌ Failed to get user analytics:', error);
    throw error;
  }
};

module.exports = {
  trackUserActivity,
  getUserAnalytics
};
