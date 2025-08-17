const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

// Import logger and utilities
const { logger, requestLogger, errorLogger } = require('./utils/logger');
const connectDB = require('./config/db');
const { startAllJobs, stopAllJobs } = require('./services/cronJobs');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'https://flyingwithgm.github.io'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Add request logging
app.use(morgan('combined', { stream: logger.stream }));
app.use(requestLogger);

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://flyingwithgm.github.io'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/wolfram', require('./routes/wolfram'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check endpoints
app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/health/db', async (req, res) => {
  try {
    logger.info('Database health check called');
    const testQuery = await mongoose.connection.db.admin().ping();
    res.status(200).json({ 
      status: 'OK', 
      database: 'Connected',
      ping: testQuery
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Add error logging middleware
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection:', {
    error: err.message,
    stack: err.stack
  });
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', {
    error: err.message,
    stack: err.stack
  });
  
  process.exit(1);
});

// ==================== SOCKET.IO IMPLEMENTATION ====================

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`📱 User connected: ${socket.id}`);
  
  // User joins with their user ID
  socket.on('joinUser', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.userId = userId;
    logger.info(`👤 User ${userId} joined with socket ${socket.id}`);
  });
  
  // Join study group
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    logger.info(`👥 User ${socket.userId} joined group ${groupId}`);
  });
  
  // Leave study group
  socket.on('leaveGroup', (groupId) => {
    socket.leave(groupId);
    logger.info(`👋 User ${socket.userId} left group ${groupId}`);
  });
  
  // Send message to group
  socket.on('sendMessage', async (data) => {
    try {
      logger.info(`💬 Message attempt in group ${data.groupId} by user ${data.userId}`);
      
      const { groupId, content, userId, userName } = data;
      
      // Validate data
      if (!groupId || !content || !userId) {
        return socket.emit('messageError', { 
          message: 'Missing required fields' 
        });
      }
      
      const messageData = {
        groupId: groupId,
        userId: userId,
        userName: userName,
        content: content,
        timestamp: new Date()
      };
      
      // Broadcast to all users in the group
      io.to(groupId).emit('newMessage', messageData);
      
      logger.info(`💬 Message sent to group ${groupId} by user ${userId}`);
      
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('messageError', { 
        message: 'Failed to send message' 
      });
    }
  });
  
  // Typing indicator
  socket.on('typing', (data) => {
    const { groupId, userId, userName } = data;
    socket.to(groupId).emit('userTyping', {
      userId: userId,
      userName: userName,
      groupId: groupId,
      timestamp: new Date()
    });
  });
  
  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    const { groupId, userId } = data;
    socket.to(groupId).emit('userStopTyping', {
      userId: userId,
      groupId: groupId
    });
  });
  
  // User disconnects
  socket.on('disconnect', () => {
    logger.info(`🔌 User disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
  });
  
  // Handle errors
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// ==================== END SOCKET.IO ====================

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('🔄 SIGTERM received. Shutting down gracefully...');
  stopAllJobs();
  
  server.close(() => {
    mongoose.connection.close(false, () => {
      logger.info('💾 MongoDB connection closed.');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`💬 Socket.IO ready for real-time connections`);
  
  // Start cron jobs
  startAllJobs();
  logger.info('⏰ Cron jobs started');
});

module.exports = { app, server, io, logger };
