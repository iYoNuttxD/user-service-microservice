import { connect, StringCodec } from 'nats';
import { IEventPublisher } from '../../domain/ports/IEventPublisher.js';
import { logger } from '../utils/logger.js';

export class NatsEventPublisher extends IEventPublisher {
  constructor(config = {}) {
    super();
    this.config = {
      url: config.url || process.env.NATS_URL || 'nats://localhost:4222',
      queueGroup: config.queueGroup || process.env.NATS_QUEUE_GROUP || 'user-service',
      jetstreamEnabled: config.jetstreamEnabled || process.env.NATS_JETSTREAM_ENABLED === 'true'
    };
    this.connection = null;
    this.codec = StringCodec();
  }

  async connect() {
    if (this.connection) {
      return;
    }

    try {
      logger.info('Connecting to NATS...', { url: this.config.url });
      
      this.connection = await connect({
        servers: this.config.url,
        name: this.config.queueGroup,
        maxReconnectAttempts: -1,
        reconnectTimeWait: 1000
      });

      logger.info('NATS connected successfully');

      // Handle connection events
      (async () => {
        for await (const status of this.connection.status()) {
          logger.info('NATS status change', { 
            type: status.type,
            data: status.data 
          });
        }
      })();

    } catch (error) {
      logger.error('Failed to connect to NATS', { error: error.message });
      throw error;
    }
  }

  async publish(subject, data) {
    if (!this.connection) {
      logger.warn('NATS not connected, skipping publish', { subject });
      return;
    }

    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.connection.publish(subject, this.codec.encode(payload));
      
      logger.debug('Event published', { subject, data });
    } catch (error) {
      logger.error('Failed to publish event', { 
        subject, 
        error: error.message 
      });
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.drain();
      await this.connection.close();
      this.connection = null;
      logger.info('NATS disconnected');
    }
  }

  isConnected() {
    return this.connection !== null && !this.connection.isClosed();
  }

  async healthCheck() {
    try {
      if (!this.connection || this.connection.isClosed()) {
        return { status: 'disconnected' };
      }

      return { 
        status: 'connected',
        queueGroup: this.config.queueGroup
      };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }
}
