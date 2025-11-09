const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LOG_LEVELS.info;
  }

  format(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...this.sanitizeMeta(meta)
    };

    return JSON.stringify(logEntry);
  }

  sanitizeMeta(meta) {
    const sanitized = { ...meta };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'passwordHash', 'token', 'secret', 'authorization'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  error(message, meta = {}) {
    if (this.level >= LOG_LEVELS.error) {
      console.error(this.format('error', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.level >= LOG_LEVELS.warn) {
      console.warn(this.format('warn', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.level >= LOG_LEVELS.info) {
      console.info(this.format('info', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.level >= LOG_LEVELS.debug) {
      console.debug(this.format('debug', message, meta));
    }
  }
}

export const logger = new Logger();
