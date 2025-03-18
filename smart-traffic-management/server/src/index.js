const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const { createLogger } = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize logger
const logger = createLogger();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/traffic', require('./routes/traffic'));
app.use('/api/control', require('./routes/manualRoutes'));
app.use('/api/auth', require('./routes/auth'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8000",
    methods: ["GET", "POST"]
  }
});

// Handle socket connections
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });

  // Handle real-time traffic updates
  socket.on('traffic:update', (data) => {
    // Broadcast traffic updates to all connected clients
    io.emit('traffic:updated', data);
  });

  // Handle emergency alerts
  socket.on('emergency:alert', (data) => {
    // Broadcast emergency alerts to all connected clients
    io.emit('emergency:broadcast', data);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});