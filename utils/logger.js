const winston = require('winston');
const path = require('path');

const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' });
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  new winston.transports.Console({
    format: prettyFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: format,
    level: 'info'
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    format: format,
    level: 'error'
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    format: format,
    level: 'http'
  })
];

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports
});

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

const requestLogger = (req, res, next) => {
  logger.http(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : 'anonymous'
  });
  
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
