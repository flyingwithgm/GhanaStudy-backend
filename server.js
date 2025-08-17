const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
require('dotenv').config();

const { logger, requestLogger, errorLogger } = require('./utils/logger');
const connectDB = require('./config/db');
const { startAllJobs, stopAllJobs } = require('./services/cronJobs');

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

app.use(morgan('combined', { stream: logger.stream }));
app.use(requestLogger);
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests' },
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

// Health checks
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Socket.IO
const connectedUsers = new Map();
io.on('connection', (socket) => {
  logger.info(`📱 User connected: ${socket.id}`);
  
  socket.on('joinUser', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.userId = userId;
  });
  
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });
  
  socket.on('sendMessage', async (data) => {
    io.to(data.groupId).emit('newMessage', data);
  });
  
  socket.on('typing', (data) => {
    socket.to(data.groupId).emit('userTyping', data);
  });
  
  socket.on('stopTyping', (data) => {
    socket.to(data.groupId).emit('userStopTyping', data);
  });
  
  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
  });
});

process.on('SIGTERM', () => {
  stopAllJobs();
  server.close(() => {
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  startAllJobs();
});
