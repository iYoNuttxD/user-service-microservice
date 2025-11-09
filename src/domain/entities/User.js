import { v4 as uuidv4 } from 'uuid';
import { Email } from '../value-objects/Email.js';
import { PasswordHash } from '../value-objects/PasswordHash.js';
import { Role, ROLES } from '../value-objects/Role.js';

export class User {
  constructor({
    id,
    email,
    passwordHash,
    firstName,
    lastName,
    roles = [ROLES.USER],
    isActive = true,
    createdAt,
    updatedAt,
    lastLoginAt = null
  }) {
    this.id = id || uuidv4();
    this.email = email instanceof Email ? email : new Email(email);
    this.passwordHash = passwordHash instanceof PasswordHash ? passwordHash : new PasswordHash(passwordHash);
    this.firstName = this.validateName(firstName, 'First name');
    this.lastName = this.validateName(lastName, 'Last name');
    this.roles = this.validateRoles(roles);
    this.isActive = Boolean(isActive);
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    this.lastLoginAt = lastLoginAt;
  }

  validateName(name, fieldName) {
    if (!name || typeof name !== 'string') {
      throw new Error(`${fieldName} must be a non-empty string`);
    }
    
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw new Error(`${fieldName} must be at least 2 characters`);
    }
    
    if (trimmed.length > 100) {
      throw new Error(`${fieldName} must not exceed 100 characters`);
    }
    
    return trimmed;
  }

  validateRoles(roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error('User must have at least one role');
    }

    return roles.map(role => role instanceof Role ? role : new Role(role));
  }

  hasRole(roleValue) {
    return this.roles.some(role => role.value === roleValue);
  }

  isAdmin() {
    return this.hasRole(ROLES.ADMIN);
  }

  updateProfile({ firstName, lastName }) {
    if (firstName) {
      this.firstName = this.validateName(firstName, 'First name');
    }
    if (lastName) {
      this.lastName = this.validateName(lastName, 'Last name');
    }
    this.updatedAt = new Date();
  }

  changePassword(newPasswordHash) {
    this.passwordHash = newPasswordHash instanceof PasswordHash 
      ? newPasswordHash 
      : new PasswordHash(newPasswordHash);
    this.updatedAt = new Date();
  }

  recordLogin() {
    this.lastLoginAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email.value,
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles.map(r => r.value),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLoginAt: this.lastLoginAt
    };
  }

  // For safe serialization (no password hash)
  toPublic() {
    return {
      id: this.id,
      email: this.email.value,
      firstName: this.firstName,
      lastName: this.lastName,
      roles: this.roles.map(r => r.value),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
