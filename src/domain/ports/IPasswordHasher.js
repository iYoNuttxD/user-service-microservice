/**
 * Port for password hashing operations
 * To be implemented by infrastructure layer
 */
export class IPasswordHasher {
  async hash(_plainPassword) {
    throw new Error('Method not implemented');
  }

  async compare(_plainPassword, _hashedPassword) {
    throw new Error('Method not implemented');
  }
}
