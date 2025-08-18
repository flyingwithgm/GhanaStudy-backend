const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');
const { logger } = require('../utils/logger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const register = async (req, res) => {
  const { name, email, password, school, formLevel } = req.body;
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }
    
    const user = await User.create({ name, email, password, school, formLevel });
    if (user) {
      // Send welcome email
      if (process.env.EMAIL_USER) {
        try {
          await sendWelcomeEmail(user.email, user.name);
          logger.info(`📧 Welcome email sent to ${user.email}`);
        } catch (emailError) {
          logger.error(`Failed to send welcome email to ${user.email}:`, emailError);
        }
      }
      
      res.status(201).json({
        success: true,
        data: {
          _id: user._id, 
          name: user.name, 
          email: user.email,
          school: user.school, 
          formLevel: user.formLevel,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ 
        success: false,
        message: 'Invalid user data' 
      });
    }
  } catch (error) {
    logger.error('User registration failed:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id, 
          name: user.name, 
          email: user.email,
          school: user.school, 
          formLevel: user.formLevel,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { register, login, getMe };
