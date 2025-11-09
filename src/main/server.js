import { createContainer } from './container.js';
import { createApp } from './app.js';
import { ensureIndexes } from '../infra/db/ensureIndexes.js';
import { logger } from '../infra/utils/logger.js';

const PORT = process.env.PORT || 3011;

async function startServer() {
  try {
    logger.info('Starting user-service...', { 
      port: PORT,
      nodeEnv: process.env.NODE_ENV
    });

    // Create container
    const container = createContainer();

    // Connect to MongoDB
    await container.mongoClient.connect();
    
    // Ensure indexes
    await ensureIndexes();

    // Connect to NATS (optional, fail gracefully)
    try {
      await container.eventPublisher.connect();
    } catch (error) {
      logger.warn('Failed to connect to NATS, continuing without event publishing', {
        error: error.message
      });
    }

    // Create Express app
    const app = createApp(container);

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`User service listening on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        apiVersion: process.env.API_VERSION || 'v1'
      });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await container.eventPublisher.disconnect();
          await container.mongoClient.disconnect();
          logger.info('All connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error: error.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
