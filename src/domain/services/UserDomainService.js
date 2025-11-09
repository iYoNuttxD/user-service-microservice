import { User } from '../entities/User.js';
import { Email } from '../value-objects/Email.js';
import { PasswordHash } from '../value-objects/PasswordHash.js';
import { ROLES } from '../value-objects/Role.js';

export class UserDomainService {
  constructor(passwordHasher) {
    this.passwordHasher = passwordHasher;
  }

  async createUser({ email, password, firstName, lastName, roles = [ROLES.USER] }) {
    // Validate password requirements
    this.validatePasswordRequirements(password);

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(password);

    // Create user entity
    const user = new User({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      roles,
      isActive: true
    });

    return user;
  }

  async authenticateUser(user, plainPassword) {
    if (!user.isActive) {
      throw new Error('User account is not active');
    }

    const isValid = await this.passwordHasher.compare(plainPassword, user.passwordHash.value);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Record login
    user.recordLogin();
    
    return user;
  }

  async changeUserPassword(user, currentPassword, newPassword) {
    // Verify current password
    const isCurrentValid = await this.passwordHasher.compare(currentPassword, user.passwordHash.value);
    
    if (!isCurrentValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePasswordRequirements(newPassword);

    // Check that new password is different
    const isSamePassword = await this.passwordHasher.compare(newPassword, user.passwordHash.value);
    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }

    // Hash and update password
    const newHashedPassword = await this.passwordHasher.hash(newPassword);
    user.changePassword(newHashedPassword);

    return user;
  }

  validatePasswordRequirements(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      throw new Error('Password must contain at least one letter');
    }
  }

  validateProfileUpdate(updates) {
    const allowedFields = ['firstName', 'lastName'];
    const providedFields = Object.keys(updates);
    
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }

    if (providedFields.length === 0) {
      throw new Error('No fields to update');
    }

    return true;
  }
}
