const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// AI API rate limiting (more generous but still controlled)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 requests per hour
  message: {
    success: false,
    message: 'AI API rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 uploads per hour
  message: {
    success: false,
    message: 'File upload rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Question posting rate limiting
const questionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 questions per hour
  message: {
    success: false,
    message: 'Question posting rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Message sending rate limiting
const messageLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // limit each IP to 30 messages per 5 minutes
  message: {
    success: false,
    message: 'Message rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Search rate limiting
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 searches per minute
  message: {
    success: false,
    message: 'Search rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Create a custom rate limiter factory
const createRateLimiter = (windowMs, max, message = 'Too many requests, please try again later.') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

module.exports = {
  generalLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter,
  questionLimiter,
  messageLimiter,
  searchLimiter,
  createRateLimiter
};
