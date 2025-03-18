const winston = require('winston');

const createLogger = () => {
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({ 
        filename: 'error.log', 
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      }),
      new winston.transports.File({ 
        filename: 'combined.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    ]
  });
};

// Custom log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Create a custom logger instance with traffic-specific logging
const createTrafficLogger = () => {
  return winston.createLogger({
    levels: logLevels,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ 
        filename: 'traffic.log',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        )
      })
    ]
  });
};

module.exports = {
  createLogger,
  createTrafficLogger
};