import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';

export class BcryptPasswordHasher extends IPasswordHasher {
  constructor(saltRounds = 10) {
    super();
    this.saltRounds = saltRounds;
  }

  async hash(plainPassword) {
    return await bcrypt.hash(plainPassword, this.saltRounds);
  }

  async compare(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
