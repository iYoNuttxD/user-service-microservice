/**
 * Port for user repository operations
 * To be implemented by infrastructure layer
 */
export class IUserRepository {
  async save(_user) {
    throw new Error('Method not implemented');
  }

  async findById(_id) {
    throw new Error('Method not implemented');
  }

  async findByEmail(_email) {
    throw new Error('Method not implemented');
  }

  async findAll(_options = {}) {
    throw new Error('Method not implemented');
  }

  async update(_id, _updates) {
    throw new Error('Method not implemented');
  }

  async delete(_id) {
    throw new Error('Method not implemented');
  }

  async exists(_email) {
    throw new Error('Method not implemented');
  }
}
