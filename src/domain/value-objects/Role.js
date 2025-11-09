export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator'
};

export class Role {
  constructor(value) {
    this.validate(value);
    this._value = value;
  }

  validate(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Role must be a non-empty string');
    }

    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(value)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  get value() {
    return this._value;
  }

  equals(other) {
    return other instanceof Role && this._value === other._value;
  }

  isAdmin() {
    return this._value === ROLES.ADMIN;
  }

  isModerator() {
    return this._value === ROLES.MODERATOR;
  }

  toString() {
    return this._value;
  }
}
