/**
 * Port for event publishing operations
 * To be implemented by infrastructure layer
 */
export class IEventPublisher {
  async publish(subject, data) {
    throw new Error('Method not implemented');
  }

  async connect() {
    throw new Error('Method not implemented');
  }

  async disconnect() {
    throw new Error('Method not implemented');
  }

  isConnected() {
    throw new Error('Method not implemented');
  }
}
