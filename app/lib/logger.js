import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
  })
);

// Create transports array
const transports = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: isDevelopment ? consoleFormat : logFormat,
    level: isDevelopment ? 'debug' : 'info',
  })
);

// File transports for production
if (!isDevelopment) {
  // Error logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );

  // Combined logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    })
  );

  // API request logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  transports,
  exitOnError: false,
});

// Add custom log levels
logger.addLevel = winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
});

// Helper methods for structured logging
export const logAPI = (method, url, statusCode, duration, meta = {}) => {
  logger.http('API Request', {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    ...meta,
  });
};

export const logAuth = (event, userId, email, success, meta = {}) => {
  logger.info('Auth Event', {
    event,
    userId,
    email,
    success,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

export const logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

// Database operation logging
export const logDB = (operation, collection, success, duration, meta = {}) => {
  logger.info('Database Operation', {
    operation,
    collection,
    success,
    duration: `${duration}ms`,
    ...meta,
  });
};

// Email operation logging
export const logEmail = (type, recipient, success, meta = {}) => {
  logger.info('Email Sent', {
    type,
    recipient,
    success,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

// Security event logging
export const logSecurity = (event, severity, meta = {}) => {
  logger.warn('Security Event', {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

export default logger;
