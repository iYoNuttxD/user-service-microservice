export class Credentials {
  constructor(email, password) {
    this.validate(email, password);
    this.email = email;
    this.password = password;
  }

  validate(email, password) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    if (password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }
  }

  getEmail() {
    return this.email;
  }

  getPassword() {
    return this.password;
  }
}
