const winston = require('winston');
const path = require('path');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define custom colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Define formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create transports
const transports = [
  // Write all logs to console
  new winston.transports.Console({
    format: prettyFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),
  
  // Write all logs to file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: format,
    level: 'info'
  }),
  
  // Write error logs to separate file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    format: format,
    level: 'error'
  }),
  
  // Write HTTP request logs to separate file
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    format: format,
    level: 'http'
  })
];

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports
});

// Create a stream object for morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add request logging middleware
const requestLogger = (req, res, next) => {
  // Log the request
  logger.http(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : 'anonymous'
  });
  
  // Log the response when it's finished
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${res.statusCode} ${req.method} ${req.url} - ${duration}ms`, {
      duration,
      contentLength: res.get('Content-Length'),
      userId: req.user ? req.user._id : 'anonymous'
    });
  });
  
  next();
};

// Add error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : 'anonymous'
  });
  
  next(err);
};

module.exports = { logger, requestLogger, errorLogger };
