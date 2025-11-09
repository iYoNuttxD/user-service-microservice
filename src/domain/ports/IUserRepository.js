/**
 * Port for user repository operations
 * To be implemented by infrastructure layer
 */
export class IUserRepository {
  async save(user) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  async findAll({ page = 1, limit = 10, filters = {} } = {}) {
    throw new Error('Method not implemented');
  }

  async update(id, updates) {
    throw new Error('Method not implemented');
  }

  async delete(id) {
    throw new Error('Method not implemented');
  }

  async exists(email) {
    throw new Error('Method not implemented');
  }
}
