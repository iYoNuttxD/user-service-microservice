/**
 * Port for password hashing operations
 * To be implemented by infrastructure layer
 */
export class IPasswordHasher {
  async hash(plainPassword) {
    throw new Error('Method not implemented');
  }

  async compare(plainPassword, hashedPassword) {
    throw new Error('Method not implemented');
  }
}
