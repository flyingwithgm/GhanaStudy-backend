const cron = require('node-cron');
const { logger } = require('../utils/logger');
const User = require('../models/User');
const Progress = require('../models/Progress');

const dailyStreakReset = cron.schedule('0 1 * * *', async () => {
  logger.info('🚀 Starting daily streak reset job...');
  
  try {
    const users = await User.find({ streak: { $gt: 0 } });
    const today = new Date().toDateString();
    let resetCount = 0;
    
    for (const user of users) {
      try {
        const progress = await Progress.findOne({ 
          user: user._id, 
          subject: 'overall' 
        });
        
        if (progress && progress.lastStreakDate) {
          const lastDate = progress.lastStreakDate.toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          
          if (lastDate !== today && lastDate !== yesterday) {
            user.streak = 0;
            await user.save();
            resetCount++;
            logger.info(`Reset streak for user ${user.email}`);
          }
        }
      } catch (userError) {
        logger.error(`Error processing user ${user._id}:`, userError);
      }
    }
    
    logger.info(`✅ Daily streak reset completed. Reset ${resetCount} users.`);
    
  } catch (error) {
    logger.error('❌ Daily streak reset job failed:', error);
  }
}, {
  scheduled: false,
  timezone: "Africa/Accra"
});

const startAllJobs = () => {
  logger.info('⏰ Starting all cron jobs...');
  dailyStreakReset.start();
  logger.info('✅ All cron jobs started successfully');
};

const stopAllJobs = () => {
  logger.info('⏰ Stopping all cron jobs...');
  dailyStreakReset.stop();
  logger.info('✅ All cron jobs stopped successfully');
};

const getJobStatus = () => {
  return {
    dailyStreakReset: dailyStreakReset.running
  };
};

module.exports = {
  startAllJobs,
  stopAllJobs,
  getJobStatus
};
