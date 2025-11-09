export class PasswordHash {
  constructor(value) {
    this.validate(value);
    this._value = value;
  }

  validate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Password hash must be a non-empty string');
    }

    // Bcrypt hashes are typically 60 characters
    if (value.length < 20) {
      throw new Error('Invalid password hash format');
    }
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof PasswordHash && this._value === other._value;
  }

  toString() {
    return '[REDACTED]';
  }
}
