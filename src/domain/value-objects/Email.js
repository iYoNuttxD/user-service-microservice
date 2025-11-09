export class Email {
  constructor(value) {
    this.validate(value);
    this._value = value.toLowerCase();
  }

  validate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Email must be a non-empty string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }

    if (value.length > 255) {
      throw new Error('Email must not exceed 255 characters');
    }
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof Email && this._value === other._value;
  }

  toString() {
    return this._value;
  }
}
