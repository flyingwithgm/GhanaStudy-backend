const fs = require('fs');
const path = require('path');
const { logger } = require('./logger');

const rotateLogs = () => {
  const logsDir = path.join(__dirname, '../logs');
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];
  
  const logFiles = ['combined.log', 'error.log', 'http.log'];
  
  logFiles.forEach(file => {
    const filePath = path.join(logsDir, file);
    const rotatedPath = path.join(logsDir, `${file}.${dateString}`);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.renameSync(filePath, rotatedPath);
        logger.info(`Rotated log file: ${file} -> ${file}.${dateString}`);
      } catch (error) {
        logger.error(`Failed to rotate log file ${file}:`, error);
      }
    }
  });
};

const scheduleLogRotation = () => {
  rotateLogs();
  
  const now = new Date();
  const nextMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  
  const timeToMidnight = nextMidnight - now;
  
  setTimeout(() => {
    rotateLogs();
    setInterval(rotateLogs, 24 * 60 * 60 * 1000);
  }, timeToMidnight);
};

module.exports = { rotateLogs, scheduleLogRotation };
