const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const customConsoleFormat = winston.format.printf(({ level, message, stack, timestamp }) => {
  const isVerbose = process.env.LOG_VERBOSE === 'true';

  if (stack && isVerbose) {
    return `\n${timestamp} ${level}: ❌ ${message}\n🧵 Stack:\n${stack}`;
  }

  if (stack) {
    const firstLine = stack.split('\n')[1]?.trim();
    const shortPath = firstLine?.replace(process.cwd(), '.');
    return `\n${timestamp} ${level}: ❌ ${message}\n📍 ${shortPath}\n🧵 LOG_VERBOSE=true to show full stack\n`;
  }

  return `${timestamp} ${level}: ${message}`;
});


const logger = winston.createLogger({
  // level: 'info',
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log') }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customConsoleFormat
      )
    })
  );
}

module.exports = logger;

