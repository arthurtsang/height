const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const redisService = require('./services/redis.service');

const PORT = config.port;

/**
 * Start the server
 */
async function startServer() {
  try {
    // Connect to Redis (or use memory fallback)
    logger.info('Initializing storage...');
    await redisService.connect();
    
    // Start memory cleanup for fallback mode
    redisService.startMemoryCleanup();
    
    const status = redisService.getConnectionStatus();
    if (status.usingMemoryFallback) {
      logger.warn('Running with in-memory storage (sessions will not persist across restarts)');
    } else if (status.connected) {
      logger.info('Redis connected successfully');
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        environment: config.nodeEnv,
        port: PORT,
        redisEnabled: config.redis.enabled,
        usingMemoryFallback: status.usingMemoryFallback
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    await redisService.disconnect();
    logger.info('Redis disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();

// Made with Bob
