import winston from 'winston';

/**
 * Winston Logger configurado para Cloud Functions
 */
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'vizionrd-functions',
  },
  transports: [
    // Console transport (se ve en Firebase Functions logs)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(meta).length > 0) {
            msg += `\n${JSON.stringify(meta, null, 2)}`;
          }
          return msg;
        })
      ),
    }),
  ],
});

/**
 * Helper para loggear errores con contexto
 */
export function logError(message, error, context = {}) {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    ...context,
  });
}

/**
 * Helper para loggear eventos importantes
 */
export function logEvent(event, data = {}) {
  logger.info(`Event: ${event}`, data);
}
