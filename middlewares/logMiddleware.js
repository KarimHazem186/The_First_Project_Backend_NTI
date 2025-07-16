const morgan = require('morgan');
const logger = require('../utils/loggers');

// HTTP logs format
const stream = {
  write: (message) => logger.http?.(message.trim()) || logger.info(message.trim())
};

// Skip logging in tests
const skip = () => process.env.NODE_ENV === 'test';

const morganMiddleware = morgan('combined', { stream, skip });

module.exports = morganMiddleware;
