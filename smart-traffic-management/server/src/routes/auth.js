const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createLogger } = require('../utils/logger');
const logger = createLogger();

// TODO: Move to environment variables
const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Mock user database (replace with actual database integration)
const mockUsers = [
  {
    id: '1',
    username: 'traffic_admin',
    password: '$2a$10$XcBkKCmGXtWwjhqp.bJ1aehYYCGMjqoaFm3hQjyIQoXqQNJzuBnTK', // "admin123"
    role: 'admin',
    permissions: ['all']
  },
  {
    id: '2',
    username: 'traffic_officer',
    password: '$2a$10$XcBkKCmGXtWwjhqp.bJ1aehYYCGMjqoaFm3hQjyIQoXqQNJzuBnTK', // "officer123"
    role: 'traffic_authority',
    permissions: ['modify_routes', 'create_diversions']
  }
];

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user (replace with database query)
    const user = mockUsers.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logger.warn('Failed login attempt', { username });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User logged in successfully', { userId: user.id });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    next(error);
  }
});

// Verify token route
router.get('/verify', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        permissions: decoded.permissions
      }
    });
  } catch (error) {
    logger.error('Token verification error', { error: error.message });
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Change password route
router.post('/change-password', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user (replace with database query)
    const user = mockUsers.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password (replace with database update)
    user.password = hashedPassword;

    logger.info('Password changed successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error', { error: error.message });
    next(error);
  }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    logger.info('User logged out', { token });
  }
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;